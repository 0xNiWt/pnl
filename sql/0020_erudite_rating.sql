-- 0020_erudite_rating.sql
--
-- Рейтинг клубу інтелектуальних ігор «Ерудит» (розділ 9 Положення).
--
-- Рейтинг окремий від усіх інших: власні таблиці, нічого не пише ні в бали,
-- ні в навчальний чи олімпіадний рейтинги. Підрахунок місць і балів живе
-- в lib/erudite.ts — у базі лежать лише сирі результати ігор.
--
-- Хто що може:
--   бачити  — учасники клубу, капітани команд, президент клубу,
--             а також адміністрація й модератор;
--   вести   — президент клубу (пп. 3.1.5, 9.4.2), адміністрація, модератор.
--
-- Посади беруться з profiles.positions (довідник lib/positions.ts):
--   erudite-member, erudite-captain, erudite-president.
--
-- Міграція безпечна для повторного запуску.

-- =====================================================================
-- 1. Перевірки прав
-- =====================================================================

create or replace function public.erudite_can_view()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and (
        coalesce(p.positions, '{}') && array['erudite-member', 'erudite-captain', 'erudite-president']
        or p.roles::text[] && array['owner', 'moderator']
      )
  );
$$;

create or replace function public.erudite_can_manage()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and (
        'erudite-president' = any (coalesce(p.positions, '{}'))
        or p.roles::text[] && array['owner', 'moderator']
      )
  );
$$;

grant execute on function public.erudite_can_view() to authenticated;
grant execute on function public.erudite_can_manage() to authenticated;

-- =====================================================================
-- 2. Таблиці
-- =====================================================================

-- Команда класу на навчальний рік (п. 9.3). Від класу може бути кілька
-- команд (п. 9.3.2), тож клас не унікальний.
create table if not exists public.erudite_teams (
  id          uuid primary key default gen_random_uuid(),
  season      text not null check (season ~ '^[0-9]{4}/[0-9]{4}$'),
  name        text not null check (length(trim(name)) > 0),
  class_name  text,
  captain_id  uuid references auth.users (id) on delete set null,
  -- Постійний склад команди — підставляється як «хто грав» у нову гру.
  members     uuid[] not null default '{}',
  created_at  timestamptz not null default now()
);

create index if not exists erudite_teams_season_idx on public.erudite_teams (season);

create table if not exists public.erudite_games (
  id          uuid primary key default gen_random_uuid(),
  season      text not null check (season ~ '^[0-9]{4}/[0-9]{4}$'),
  title       text not null check (length(trim(title)) > 0),
  played_on   date not null default current_date,
  created_at  timestamptz not null default now(),
  created_by  uuid references auth.users (id) on delete set null
);

create index if not exists erudite_games_season_idx on public.erudite_games (season, played_on);

-- Результат однієї команди в одній грі.
create table if not exists public.erudite_results (
  game_id   uuid not null references public.erudite_games (id) on delete cascade,
  team_id   uuid not null references public.erudite_teams (id) on delete cascade,
  -- false — неявка (п. 9.5.2).
  attended  boolean not null default true,
  -- Ігрові очки, набрані в самій грі. Вікові бали (п. 9.5.1) додає код.
  score     numeric not null default 0 check (score >= 0),
  -- Хто грав цього разу — для персонального рейтингу.
  players   uuid[] not null default '{}',
  primary key (game_id, team_id)
);

alter table public.erudite_teams   enable row level security;
alter table public.erudite_games   enable row level security;
alter table public.erudite_results enable row level security;

-- =====================================================================
-- 3. Політики
-- =====================================================================

drop policy if exists erudite_teams_read on public.erudite_teams;
create policy erudite_teams_read on public.erudite_teams
  for select using (public.erudite_can_view());

drop policy if exists erudite_teams_manage on public.erudite_teams;
create policy erudite_teams_manage on public.erudite_teams
  for all using (public.erudite_can_manage()) with check (public.erudite_can_manage());

drop policy if exists erudite_games_read on public.erudite_games;
create policy erudite_games_read on public.erudite_games
  for select using (public.erudite_can_view());

drop policy if exists erudite_games_manage on public.erudite_games;
create policy erudite_games_manage on public.erudite_games
  for all using (public.erudite_can_manage()) with check (public.erudite_can_manage());

drop policy if exists erudite_results_read on public.erudite_results;
create policy erudite_results_read on public.erudite_results
  for select using (public.erudite_can_view());

drop policy if exists erudite_results_manage on public.erudite_results;
create policy erudite_results_manage on public.erudite_results
  for all using (public.erudite_can_manage()) with check (public.erudite_can_manage());

-- =====================================================================
-- 4. Збереження гри одним запитом
-- =====================================================================
-- Гра й результати всіх команд записуються атомарно: не буває гри,
-- у якої результати збереглися лише частково.
--
-- p_results — масив об'єктів:
--   [{ "team_id": "...", "attended": true, "score": 34, "players": ["uuid", ...] }]

create or replace function public.save_erudite_game(
  p_game_id    uuid,
  p_season     text,
  p_title      text,
  p_played_on  date,
  p_results    jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  if not public.erudite_can_manage() then
    raise exception 'Недостатньо прав';
  end if;

  if coalesce(trim(p_title), '') = '' then
    raise exception 'Вкажіть назву гри';
  end if;

  if jsonb_typeof(p_results) <> 'array' then
    raise exception 'Результати треба передати масивом';
  end if;

  if p_game_id is null then
    insert into public.erudite_games (season, title, played_on, created_by)
    values (p_season, trim(p_title), coalesce(p_played_on, current_date), auth.uid())
    returning id into v_id;
  else
    update public.erudite_games
       set title = trim(p_title),
           played_on = coalesce(p_played_on, played_on)
     where id = p_game_id
    returning id into v_id;

    if v_id is null then
      raise exception 'Гру не знайдено';
    end if;
  end if;

  delete from public.erudite_results where game_id = v_id;

  insert into public.erudite_results (game_id, team_id, attended, score, players)
  select
    v_id,
    (r ->> 'team_id')::uuid,
    coalesce((r ->> 'attended')::boolean, true),
    greatest(coalesce((r ->> 'score')::numeric, 0), 0),
    coalesce(
      array(select jsonb_array_elements_text(coalesce(r -> 'players', '[]'::jsonb)))::uuid[],
      '{}'
    )
  from jsonb_array_elements(p_results) as r
  -- Лише команди того самого навчального року, що й гра.
  where exists (
    select 1 from public.erudite_teams t
    where t.id = (r ->> 'team_id')::uuid
      and t.season = (select g.season from public.erudite_games g where g.id = v_id)
  );

  return v_id;
end;
$$;

grant execute on function public.save_erudite_game(uuid, text, text, date, jsonb) to authenticated;
