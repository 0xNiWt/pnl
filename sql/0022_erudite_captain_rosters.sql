-- 0022_erudite_captain_rosters.sql
--
-- Заявки капітанів без попереднього налаштування президентом
-- (потребує 0020 та 0021):
--   1) капітан (посада erudite-captain) подає заявку на заплановану гру,
--      обираючи до 5 гравців зі свого класу. Якщо його команди ще немає,
--      вона створюється автоматично (назва — клас капітана);
--   2) коли президент клубу підтверджує заявку, гравці додаються до складу
--      команди й автоматично отримують посаду «Учасник клубу «Ерудит»»
--      (erudite-member), якщо ще не мають посади в клубі.
--
-- Капітан, як і раніше, не може планувати ігри, вносити результати чи
-- штрафи — це робить лише президент клубу (erudite_can_manage).
--
-- Міграція безпечна для повторного запуску.

-- =====================================================================
-- 1. Подати заявку
-- =====================================================================
-- p_team_id може бути null: тоді береться команда, де викликач — капітан,
-- а якщо її немає — створюється нова для класу капітана.

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
  v_game      public.erudite_games%rowtype;
  v_team      public.erudite_teams%rowtype;
  v_players   uuid[];
  v_class     text;
  v_positions text[];
  v_manager   boolean := public.erudite_can_manage();
begin
  select * into v_game from public.erudite_games where id = p_game_id;
  if not found then
    raise exception 'Гру не знайдено';
  end if;

  if v_game.status <> 'planned' then
    raise exception 'Заявки приймаються лише на заплановані ігри';
  end if;

  if p_team_id is not null then
    select * into v_team from public.erudite_teams where id = p_team_id;
    if not found then
      raise exception 'Команду не знайдено';
    end if;
  else
    select * into v_team
    from public.erudite_teams
    where captain_id = auth.uid()
      and season = v_game.season
    order by created_at
    limit 1;

    if not found then
      select p.class, coalesce(p.positions, '{}')
        into v_class, v_positions
      from public.profiles p
      where p.id = auth.uid();

      if not ('erudite-captain' = any (coalesce(v_positions, '{}'))) then
        raise exception 'Подавати заявки може лише капітан команди';
      end if;
      if v_class is null then
        raise exception 'У вашому профілі не вказано клас';
      end if;

      insert into public.erudite_teams (season, name, class_name, captain_id, members)
      values (v_game.season, v_class, v_class, auth.uid(), array[auth.uid()])
      returning * into v_team;
    end if;
  end if;

  if v_team.season <> v_game.season then
    raise exception 'Команда не бере участі в іграх цього року';
  end if;

  if not (v_team.captain_id = auth.uid() or v_manager) then
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

  -- Заявити можна склад команди або учнів класу, за який грає команда.
  if exists (
    select 1
    from unnest(v_players) as pl
    where not (
      pl = any (v_team.members)
      or exists (
        select 1 from public.profiles pr
        where pr.id = pl
          and v_team.class_name is not null
          and pr.class = v_team.class_name
      )
    )
  ) then
    raise exception 'У заявці є учні не з класу команди';
  end if;

  insert into public.erudite_rosters (game_id, team_id, players, status, note, submitted_by, submitted_at, reviewed_by, reviewed_at)
  values (p_game_id, v_team.id, v_players, 'pending', null, auth.uid(), now(), null, null)
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

-- =====================================================================
-- 2. Підтвердити або відхилити заявку
-- =====================================================================
-- Підтвердження: гравці входять до складу команди й отримують посаду
-- «Учасник клубу «Ерудит»», якщо ще не мають жодної посади в клубі.

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
declare
  v_players uuid[];
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
     and team_id = p_team_id
  returning players into v_players;

  if not found then
    raise exception 'Заявку не знайдено';
  end if;

  if p_approve then
    update public.erudite_teams t
       set members = (
         select coalesce(array_agg(distinct m), '{}')
         from unnest(t.members || v_players) as m
       )
     where t.id = p_team_id;

    update public.profiles p
       set positions = array_append(coalesce(p.positions, '{}'), 'erudite-member')
     where p.id = any (v_players)
       and not (coalesce(p.positions, '{}') && array['erudite-member', 'erudite-captain', 'erudite-president']);
  end if;
end;
$$;

grant execute on function public.review_erudite_roster(uuid, uuid, boolean, text) to authenticated;
