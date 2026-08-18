-- 0012_position_polls.sql
--
-- Голосування для групи активу (scope = 'position').
--
-- Досі голосування були двох видів: клас і весь ліцей. Тепер додається
-- третій — серед усіх, хто обіймає одну класну посаду в ліцеї:
--   голова старостату   → усі старости та їхні заступники;
--   голова фізоргів     → усі фізорги та їхні заступники;
--   голова пресцентру   → усі редактори, їхні заступники та фотографи;
--   президент «Ерудиту» → усі капітани команд;
--   ПРСЛ                → будь-яка з цих груп;
--   модератор і адміністрація → будь-яка.
--
-- Той самий розподіл прав продубльовано в lib/voting.ts: застосунок
-- вирішує, що показати у формі, а база — що дозволити насправді.
--
-- Що робить міграція:
--   1) додає polls.position_id — кому адресоване голосування;
--   2) дозволяє нове значення scope;
--   3) заводить спільне визначення «хто має право голосу» (poll_audience) —
--      одне на всю базу;
--   4) переписує create_poll (новий параметр p_position), cast_vote
--      (перевірка кола голосування) і poll_turnout (розмір кола);
--   5) ДОДАЄ політики RLS для нового виду голосувань, не чіпаючи старих.
--
-- Функції close_poll і poll_results не змінюються: вони не залежать від
-- того, кому адресоване голосування.
--
-- Таємність лишається як була: у poll_ballots пишемо, ХТО проголосував,
-- у poll_votes — ЩО обрали, і ці два записи між собою не пов'язані
-- (див. sql/0007_polls_secret_only.sql).
--
-- Міграція безпечна для повторного запуску.

-- =====================================================================
-- 1. Кому адресоване голосування
-- =====================================================================

alter table public.polls
  add column if not exists position_id text;

comment on column public.polls.position_id is
  'Для scope = ''position'': id посади з довідника lib/positions.ts.';

create index if not exists polls_position_idx
  on public.polls (position_id)
  where position_id is not null;

-- =====================================================================
-- 2. Дозволяємо scope = 'position'
-- =====================================================================
-- Колонка scope може бути або текстом з CHECK-обмеженням, або enum-типом.
-- Розбираємося на місці, щоб міграція підійшла в обох випадках.

do $$
declare
  v_typtype char;
  v_typname text;
  v_conname text;
begin
  select t.typtype, t.typname
    into v_typtype, v_typname
    from pg_attribute a
    join pg_type t on t.oid = a.atttypid
   where a.attrelid = 'public.polls'::regclass
     and a.attname = 'scope'
     and a.attnum > 0;

  if v_typtype = 'e' then
    -- Enum: досить додати значення, CHECK тут не потрібен.
    execute format('alter type public.%I add value if not exists %L', v_typname, 'position');
    raise notice 'polls.scope — enum %, значення position додано', v_typname;
  else
    -- Текст: старе обмеження знало лише class і lyceum, тому міняємо його.
    for v_conname in
      select c.conname
        from pg_constraint c
       where c.conrelid = 'public.polls'::regclass
         and c.contype = 'c'
         and pg_get_constraintdef(c.oid) like '%lyceum%'
    loop
      execute format('alter table public.polls drop constraint %I', v_conname);
      raise notice 'знято старе обмеження %', v_conname;
    end loop;

    alter table public.polls drop constraint if exists polls_scope_valid;
    alter table public.polls add constraint polls_scope_valid check (
      scope in ('class', 'lyceum', 'position')
      -- Голосування класу без класу і групове без посади не мають сенсу.
      and (scope <> 'class' or class_name is not null)
      and (scope <> 'position' or position_id is not null)
    );
    raise notice 'polls.scope — текст, обмеження polls_scope_valid оновлено';
  end if;
end $$;

-- =====================================================================
-- 3. Хто має право голосу
-- =====================================================================
-- Одне визначення кола голосування на всю базу: ним користуються і
-- перевірка голосу, і підрахунок явки, і політики доступу.
--
-- security definer — щоб функція бачила всі профілі: інакше учень не зміг
-- би порахувати розмір власного кола. Назовні вона віддає лише «так/ні»
-- та кількість, тож чужих даних не розкриває.

create or replace function public.poll_audience(p_poll_id uuid)
returns table (profile_id uuid)
language sql
stable
security definer
set search_path = public
as $$
  select p.id
    from public.profiles p
    cross join public.polls poll
   where poll.id = p_poll_id
     and 'student' = any (coalesce(p.roles::text[], '{}'::text[]))
     and case poll.scope::text
           when 'class'    then p.class = poll.class_name
           when 'position' then poll.position_id = any (coalesce(p.positions::text[], '{}'::text[]))
           else true
         end
$$;

create or replace function public.poll_is_audience(p_poll_id uuid, p_user uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.poll_audience(p_poll_id) a where a.profile_id = p_user
  )
$$;

-- Хто скликає голосування серед групи активу: голова цієї групи, ПРСЛ,
-- модератор і адміністрація. Дзеркало pollTargetPositionsFor у lib/voting.ts.
create or replace function public.poll_position_targets(p_positions text[], p_roles text[])
returns text[]
language plpgsql
immutable
as $$
declare
  -- Класні посади: серед них є кого зібрати. Ліцейські посади одиничні,
  -- тому голосувань серед них не буває.
  v_all text[] := array[
    'starosta', 'rsl-rep', 'redactor', 'kultorg', 'fizorg',
    'photographer', 'erudite-captain', 'starosta-deputy',
    'rsl-rep-deputy', 'redactor-deputy', 'fizorg-deputy', 'volunteer'
  ];
  v_out text[] := '{}';
begin
  p_positions := coalesce(p_positions, '{}');
  p_roles     := coalesce(p_roles, '{}');

  if p_roles && array['owner', 'moderator'] or 'prsl' = any (p_positions) then
    return v_all;
  end if;

  if 'head-starostat' = any (p_positions) then
    v_out := v_out || array['starosta', 'starosta-deputy'];
  end if;
  if 'head-fizorg' = any (p_positions) then
    v_out := v_out || array['fizorg', 'fizorg-deputy'];
  end if;
  if 'head-presscenter' = any (p_positions) then
    v_out := v_out || array['redactor', 'redactor-deputy', 'photographer'];
  end if;
  if 'erudite-president' = any (p_positions) then
    v_out := v_out || array['erudite-captain'];
  end if;

  return v_out;
end $$;

-- =====================================================================
-- 4. Перезбираємо функції, які мають знати про новий вид голосування
-- =====================================================================
-- Старі версії прибираємо повністю: з двома різними сигнатурами PostgREST
-- не знав би, яку саме викликати.

do $$
declare
  r record;
begin
  for r in
    select p.oid::regprocedure as signature
      from pg_proc p
      join pg_namespace n on n.oid = p.pronamespace
     where n.nspname = 'public'
       and p.proname in ('create_poll', 'cast_vote', 'poll_turnout')
  loop
    execute format('drop function %s', r.signature);
  end loop;
end $$;

create function public.create_poll(
  p_title        text,
  p_description  text,
  p_scope        text,
  p_class        text,
  p_position     text,
  p_is_anonymous boolean,
  p_options      text[]
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid       uuid := auth.uid();
  v_roles     text[];
  v_positions text[];
  v_class     text;
  v_is_admin  boolean;
  -- Тип беремо з самої колонки: присвоєння в PL/pgSQL переведе текст
  -- і в enum, і в text — залежно від того, як заведена база.
  v_scope     public.polls.scope%type;
  v_poll_id   uuid;
begin
  if v_uid is null then
    raise exception 'Потрібно увійти в акаунт';
  end if;

  select coalesce(p.roles::text[], '{}'), coalesce(p.positions::text[], '{}'), p.class
    into v_roles, v_positions, v_class
    from public.profiles p
   where p.id = v_uid;

  if not found then
    raise exception 'Профіль не знайдено';
  end if;

  v_is_admin := v_roles && array['owner', 'moderator'];

  if p_scope not in ('class', 'lyceum', 'position') then
    raise exception 'Невідомий вид голосування: %', p_scope;
  end if;

  -- Клас: староста і представник РСЛ — лише свій, адміністрація — будь-який.
  if p_scope = 'class' then
    if p_class is null or btrim(p_class) = '' then
      raise exception 'Не вказано клас';
    end if;
    if not v_is_admin then
      if not (v_positions && array['starosta', 'rsl-rep']) then
        raise exception 'Голосування класу скликають староста або представник РСЛ';
      end if;
      if p_class is distinct from v_class then
        raise exception 'Голосування можна створити лише для свого класу';
      end if;
    end if;
  end if;

  -- Увесь ліцей: ПРСЛ і адміністрація.
  if p_scope = 'lyceum' then
    if not v_is_admin and not ('prsl' = any (v_positions)) then
      raise exception 'Загальноліцейське голосування скликає ПРСЛ';
    end if;
  end if;

  -- Група активу: голова цієї групи, ПРСЛ або адміністрація.
  if p_scope = 'position' then
    if p_position is null or btrim(p_position) = '' then
      raise exception 'Не вказано групу активу';
    end if;
    if not (p_position = any (public.poll_position_targets(v_positions, v_roles))) then
      raise exception 'Немає права скликати голосування серед цієї групи активу';
    end if;
  end if;

  if coalesce(array_length(p_options, 1), 0) < 2 then
    raise exception 'Потрібно щонайменше два варіанти відповіді';
  end if;
  if array_length(p_options, 1) > 20 then
    raise exception 'Забагато варіантів (максимум 20)';
  end if;

  v_scope := p_scope;

  insert into public.polls (title, description, scope, class_name, position_id, created_by)
  values (
    btrim(p_title),
    nullif(btrim(coalesce(p_description, '')), ''),
    v_scope,
    case when p_scope = 'class' then p_class end,
    case when p_scope = 'position' then p_position end,
    v_uid
  )
  returning id into v_poll_id;

  insert into public.poll_options (poll_id, label, sort_order)
  select v_poll_id, btrim(o.label), o.ord
    from unnest(p_options) with ordinality as o(label, ord)
   where btrim(o.label) <> '';

  return v_poll_id;
end $$;

-- cast_vote: коло голосування тепер знає і про групи активу.
create function public.cast_vote(p_poll_id uuid, p_option_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid    uuid := auth.uid();
  v_status text;
begin
  if v_uid is null then
    raise exception 'Потрібно увійти в акаунт';
  end if;

  select status::text into v_status from public.polls where id = p_poll_id;

  if not found then
    raise exception 'Голосування не знайдено';
  end if;
  if v_status <> 'open' then
    raise exception 'Голосування вже завершено';
  end if;

  if not exists (
    select 1 from public.poll_options o
     where o.id = p_option_id and o.poll_id = p_poll_id
  ) then
    raise exception 'Такого варіанта в цьому голосуванні немає';
  end if;

  if not public.poll_is_audience(p_poll_id, v_uid) then
    raise exception 'Це голосування не для вас';
  end if;

  if exists (
    select 1 from public.poll_ballots b
     where b.poll_id = p_poll_id and b.voter_id = v_uid
  ) then
    raise exception 'Ви вже проголосували';
  end if;

  -- Спершу відмітка про участь — вона ж і захист від другого голосу.
  insert into public.poll_ballots (poll_id, voter_id) values (p_poll_id, v_uid);

  -- А сам голос лягає окремо й без імені: зв'язати одне з одним не вийде.
  insert into public.poll_votes (poll_id, option_id, voter_id)
  values (p_poll_id, p_option_id, null);
end $$;

-- Голос без імені — саме так і задумано (див. 0007).
alter table public.poll_votes alter column voter_id drop not null;

-- poll_turnout: розмір кола рахуємо тим самим спільним визначенням.
create function public.poll_turnout(p_poll_id uuid)
returns table (voted integer, eligible integer)
language sql
stable
security definer
set search_path = public
as $$
  select
    (select count(*)::integer from public.poll_ballots b where b.poll_id = p_poll_id),
    (select count(*)::integer from public.poll_audience(p_poll_id))
$$;

-- =====================================================================
-- 5. Права на виклик
-- =====================================================================

grant execute on function public.create_poll(text, text, text, text, text, boolean, text[]) to authenticated;
grant execute on function public.cast_vote(uuid, uuid) to authenticated;
grant execute on function public.poll_turnout(uuid) to authenticated;
grant execute on function public.poll_audience(uuid) to authenticated;
grant execute on function public.poll_is_audience(uuid, uuid) to authenticated;
grant execute on function public.poll_position_targets(text[], text[]) to authenticated;

-- =====================================================================
-- 6. Доступ до нового виду голосувань
-- =====================================================================
-- Політики RLS складаються за «або», тому старі (клас і ліцей) лишаємо
-- недоторканими, а для scope = 'position' додаємо власні.

alter table public.polls enable row level security;
alter table public.poll_options enable row level security;

-- Голосування групи бачать її учасники, той, хто його скликав, і адміністрація.
drop policy if exists polls_read_position on public.polls;
create policy polls_read_position
  on public.polls for select
  using (
    scope::text = 'position'
    and (
      created_by = auth.uid()
      or public.poll_is_audience(id, auth.uid())
      or exists (
        select 1 from public.profiles p
        where p.id = auth.uid()
          and p.roles::text[] && array['owner', 'moderator']
      )
    )
  );

-- Варіанти відповіді видно тим, кому видно саме голосування.
drop policy if exists poll_options_read_position on public.poll_options;
create policy poll_options_read_position
  on public.poll_options for select
  using (
    exists (
      select 1 from public.polls poll
      where poll.id = poll_options.poll_id
        and poll.scope::text = 'position'
        and (
          poll.created_by = auth.uid()
          or public.poll_is_audience(poll.id, auth.uid())
          or exists (
            select 1 from public.profiles p
            where p.id = auth.uid()
              and p.roles::text[] && array['owner', 'moderator']
          )
        )
    )
  );

-- Видалення й закриття голосування лишаються як були: цим займається
-- організатор або адміністрація, і від виду голосування це не залежить.
