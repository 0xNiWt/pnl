-- 0021_erudite_rosters_penalties.sql
--
-- Клуб «Ерудит», друга частина (потребує 0020_erudite_rating.sql):
--   1) гру можна запланувати заздалегідь (status = 'planned');
--   2) капітан команди подає заявку — склад на гру (до 5 осіб, п. 9.3.1),
--      президент клубу її підтверджує або відхиляє;
--   3) президент клубу нараховує штрафні бали: за неявку або за
--      неправильно заявлених гравців.
--
-- Міграція безпечна для повторного запуску.

-- =====================================================================
-- 1. Статус гри
-- =====================================================================

alter table public.erudite_games
  add column if not exists status text not null default 'played';

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'erudite_games_status_check'
  ) then
    alter table public.erudite_games
      add constraint erudite_games_status_check check (status in ('planned', 'played'));
  end if;
end $$;

-- Запланувати гру: без результатів, капітани можуть подавати заявки.
create or replace function public.plan_erudite_game(
  p_season    text,
  p_title     text,
  p_played_on date
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

  insert into public.erudite_games (season, title, played_on, status, created_by)
  values (p_season, trim(p_title), coalesce(p_played_on, current_date), 'planned', auth.uid())
  returning id into v_id;

  return v_id;
end;
$$;

grant execute on function public.plan_erudite_game(text, text, date) to authenticated;

-- Збереження результатів тепер також переводить гру в статус «зіграна».
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
    insert into public.erudite_games (season, title, played_on, status, created_by)
    values (p_season, trim(p_title), coalesce(p_played_on, current_date), 'played', auth.uid())
    returning id into v_id;
  else
    update public.erudite_games
       set title = trim(p_title),
           played_on = coalesce(p_played_on, played_on),
           status = 'played'
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
  where exists (
    select 1 from public.erudite_teams t
    where t.id = (r ->> 'team_id')::uuid
      and t.season = (select g.season from public.erudite_games g where g.id = v_id)
  );

  return v_id;
end;
$$;

-- =====================================================================
-- 2. Заявки капітанів
-- =====================================================================

create table if not exists public.erudite_rosters (
  game_id       uuid not null references public.erudite_games (id) on delete cascade,
  team_id       uuid not null references public.erudite_teams (id) on delete cascade,
  players       uuid[] not null default '{}',
  status        text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  -- Коментар президента (наприклад, чому відхилено).
  note          text,
  submitted_by  uuid references auth.users (id) on delete set null,
  submitted_at  timestamptz not null default now(),
  reviewed_by   uuid references auth.users (id) on delete set null,
  reviewed_at   timestamptz,
  primary key (game_id, team_id)
);

alter table public.erudite_rosters enable row level security;

drop policy if exists erudite_rosters_read on public.erudite_rosters;
create policy erudite_rosters_read on public.erudite_rosters
  for select using (public.erudite_can_view());

-- Прямих політик на запис немає: заявки йдуть лише через функції нижче.

-- Подати (або переподати) заявку. Може капітан цієї команди або президент.
-- Будь-яка зміна заявки повертає її на підтвердження.
create or replace function public.submit_erudite_roster(
  p_game_id uuid,
  p_team_id uuid,
  p_players uuid[]
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_team    public.erudite_teams%rowtype;
  v_game    public.erudite_games%rowtype;
  v_players uuid[];
begin
  select * into v_team from public.erudite_teams where id = p_team_id;
  if not found then
    raise exception 'Команду не знайдено';
  end if;

  select * into v_game from public.erudite_games where id = p_game_id;
  if not found then
    raise exception 'Гру не знайдено';
  end if;

  if v_game.season <> v_team.season then
    raise exception 'Команда не бере участі в іграх цього року';
  end if;

  if v_game.status <> 'planned' then
    raise exception 'Заявки приймаються лише на заплановані ігри';
  end if;

  if not (v_team.captain_id = auth.uid() or public.erudite_can_manage()) then
    raise exception 'Подати заявку може лише капітан цієї команди';
  end if;

  select coalesce(array_agg(distinct p), '{}') into v_players
  from unnest(coalesce(p_players, '{}')) as p;

  if cardinality(v_players) = 0 then
    raise exception 'Оберіть гравців';
  end if;

  -- П. 9.3.1: команда на гру — 5 осіб разом із капітаном.
  if cardinality(v_players) > 5 then
    raise exception 'У заявці може бути не більше 5 гравців';
  end if;

  -- Заявити можна лише гравців зі складу своєї команди.
  if not (v_players <@ v_team.members) then
    raise exception 'У заявці є гравці не зі складу команди';
  end if;

  insert into public.erudite_rosters (game_id, team_id, players, status, note, submitted_by, submitted_at, reviewed_by, reviewed_at)
  values (p_game_id, p_team_id, v_players, 'pending', null, auth.uid(), now(), null, null)
  on conflict (game_id, team_id) do update
    set players = excluded.players,
        status = 'pending',
        note = null,
        submitted_by = excluded.submitted_by,
        submitted_at = now(),
        reviewed_by = null,
        reviewed_at = null;
end;
$$;

grant execute on function public.submit_erudite_roster(uuid, uuid, uuid[]) to authenticated;

-- Підтвердити або відхилити заявку — лише президент клубу.
create or replace function public.review_erudite_roster(
  p_game_id uuid,
  p_team_id uuid,
  p_approve boolean,
  p_note    text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.erudite_can_manage() then
    raise exception 'Недостатньо прав';
  end if;

  update public.erudite_rosters
     set status = case when p_approve then 'approved' else 'rejected' end,
         note = nullif(trim(coalesce(p_note, '')), ''),
         reviewed_by = auth.uid(),
         reviewed_at = now()
   where game_id = p_game_id
     and team_id = p_team_id;

  if not found then
    raise exception 'Заявку не знайдено';
  end if;
end;
$$;

grant execute on function public.review_erudite_roster(uuid, uuid, boolean, text) to authenticated;

-- =====================================================================
-- 3. Штрафні бали від президента клубу
-- =====================================================================

create table if not exists public.erudite_penalties (
  id          uuid primary key default gen_random_uuid(),
  season      text not null check (season ~ '^[0-9]{4}/[0-9]{4}$'),
  team_id     uuid not null references public.erudite_teams (id) on delete cascade,
  game_id     uuid references public.erudite_games (id) on delete set null,
  points      int not null check (points > 0),
  reason      text not null check (reason in ('no_show', 'roster', 'other')),
  note        text,
  created_by  uuid references auth.users (id) on delete set null,
  created_at  timestamptz not null default now()
);

create index if not exists erudite_penalties_season_idx on public.erudite_penalties (season);

alter table public.erudite_penalties enable row level security;

drop policy if exists erudite_penalties_read on public.erudite_penalties;
create policy erudite_penalties_read on public.erudite_penalties
  for select using (public.erudite_can_view());

drop policy if exists erudite_penalties_manage on public.erudite_penalties;
create policy erudite_penalties_manage on public.erudite_penalties
  for all using (public.erudite_can_manage()) with check (public.erudite_can_manage());
