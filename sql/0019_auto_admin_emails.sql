-- 0019_auto_admin_emails.sql
--
-- Акаунти з певних пошт автоматично отримують роль «Адміністрація» (owner).
--
-- Як це працює:
--   1) таблиця auto_admin_emails — список пошт, яким належить адмінка;
--   2) тригер на profiles додає роль owner, щойно профіль такої пошти
--      створюється (реєстрація) або в ньому змінюються ролі;
--   3) наявним акаунтам із цих пошт роль видається одразу під час міграції.
--
-- Тригер спрацьовує й на зміну ролей, тому зняти owner із цих акаунтів
-- через кабінет не вийде — роль повернеться. Щоб прибрати людину з
-- адмінів, спершу видаліть її пошту з auto_admin_emails.
--
-- Міграція безпечна для повторного запуску.

-- =====================================================================
-- 1. Список пошт
-- =====================================================================

create table if not exists public.auto_admin_emails (
  email       text primary key check (email = lower(email)),
  note        text,
  created_at  timestamptz not null default now()
);

-- RLS увімкнено без жодної політики: список не читається і не змінюється
-- з браузера. Його бачать лише функція нижче та SQL-редактор Supabase.
alter table public.auto_admin_emails enable row level security;

insert into public.auto_admin_emails (email, note) values
  ('fla@kpnl145.kyiv.ua', 'Адміністрація ліцею'),
  ('fla_couch@kpnl145.kyiv.ua', 'Адміністрація ліцею')
on conflict (email) do nothing;

-- =====================================================================
-- 2. Тригер на профілях
-- =====================================================================

create or replace function public.grant_auto_admin()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text;
begin
  -- Пошта лежить в auth.users, а не в profiles.
  select lower(u.email) into v_email
  from auth.users u
  where u.id = new.id;

  if v_email is not null
     and exists (select 1 from public.auto_admin_emails a where a.email = v_email)
     and not ('owner' = any (coalesce(new.roles::text[], '{}')))
  then
    new.roles := array_append(coalesce(new.roles, '{}'), 'owner'::app_role);
  end if;

  return new;
end;
$$;

drop trigger if exists profiles_auto_admin on public.profiles;
create trigger profiles_auto_admin
  before insert or update of roles on public.profiles
  for each row
  execute function public.grant_auto_admin();

-- =====================================================================
-- 3. Акаунти, які вже зареєстровані
-- =====================================================================

update public.profiles p
   set roles = array_append(coalesce(p.roles, '{}'), 'owner'::app_role)
  from auth.users u
  join public.auto_admin_emails a on a.email = lower(u.email)
 where u.id = p.id
   and not ('owner' = any (coalesce(p.roles::text[], '{}')));
