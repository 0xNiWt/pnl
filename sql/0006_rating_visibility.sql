-- 0006_rating_visibility.sql
--
-- Що робить міграція:
--   1) таблиця rating_visibility — який із чотирьох рейтингів приховано;
--   2) функція set_rating_visibility — єдиний спосіб змінити стан,
--      сама перевіряє, що це адміністрація або модератор;
--   3) політики, які дають модератору право керувати новинами.
--
-- Міграція безпечна для повторного запуску.

-- =====================================================================
-- 1. Видимість рейтингів
-- =====================================================================

create table if not exists public.rating_visibility (
  kind        text primary key
              check (kind in ('points', 'academic', 'olympiad', 'overall')),
  hidden      boolean not null default false,
  updated_at  timestamptz not null default now(),
  updated_by  uuid references auth.users (id) on delete set null
);

insert into public.rating_visibility (kind, hidden)
values ('points', false), ('academic', false), ('olympiad', false), ('overall', false)
on conflict (kind) do nothing;

alter table public.rating_visibility enable row level security;

-- Читати стан має право будь-хто: інакше сторінка рейтингу не знала б,
-- що саме ховати. Сам факт «приховано» таємницею не є.
drop policy if exists rating_visibility_read on public.rating_visibility;
create policy rating_visibility_read
  on public.rating_visibility
  for select
  using (true);

-- Прямих політик на insert/update/delete немає навмисно: запис іде тільки
-- через функцію нижче, тому підмінити стан запитом із браузера не вийде.

create or replace function public.set_rating_visibility(p_kind text, p_hidden boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_roles text[];
begin
  if p_kind not in ('points', 'academic', 'olympiad', 'overall') then
    raise exception 'Невідомий рейтинг: %', p_kind;
  end if;

  -- profiles.roles — масив enum-типу app_role, тому порівнюємо через
  -- явне приведення до text[]: оператор && не працює між різними типами.
  select roles::text[] into v_roles from public.profiles where id = auth.uid();

  if v_roles is null or not (v_roles && array['owner', 'moderator']) then
    raise exception 'Недостатньо прав';
  end if;

  insert into public.rating_visibility (kind, hidden, updated_at, updated_by)
  values (p_kind, p_hidden, now(), auth.uid())
  on conflict (kind) do update
    set hidden = excluded.hidden,
        updated_at = now(),
        updated_by = auth.uid();
end;
$$;

grant execute on function public.set_rating_visibility(text, boolean) to authenticated;

-- =====================================================================
-- 2. Модератор керує новинами
-- =====================================================================
-- Політика додаткова: наявні політики редактора й адміністрації лишаються,
-- бо permissive-політики в PostgreSQL складаються за «або».

drop policy if exists news_moderator_manage on public.news;
create policy news_moderator_manage
  on public.news
  for all
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.roles::text[] && array['moderator']
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.roles::text[] && array['moderator']
    )
  );
