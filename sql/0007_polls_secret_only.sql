-- 0007_polls_secret_only.sql
--
-- Відкритих (поіменних) голосувань у ліцеї більше немає: кожне голосування
-- таємне, і зв'язок «хто за що» не має бути доступний нікому — ні організатору,
-- ні адміністрації.
--
-- Застосунок уже не створює відкритих голосувань і не показує поіменних
-- списків. Ця міграція закріплює те саме в базі, щоб правило не можна було
-- обійти прямим запитом:
--   1) наявні голосування переводяться в таємні;
--   2) is_anonymous завжди true — тригер перезаписує будь-яке інше значення;
--   3) функції poll_voters забирається право виконання у звичайних акаунтів.
--
-- Міграція безпечна для повторного запуску.

-- =====================================================================
-- 1. Наявні голосування — таємні
-- =====================================================================

update public.polls
   set is_anonymous = true
 where is_anonymous is distinct from true;

alter table public.polls
  alter column is_anonymous set default true;

-- =====================================================================
-- 2. Тригер, який не дає створити відкрите голосування
-- =====================================================================

create or replace function public.polls_force_secret()
returns trigger
language plpgsql
as $$
begin
  new.is_anonymous := true;
  return new;
end;
$$;

drop trigger if exists polls_secret_only on public.polls;
create trigger polls_secret_only
  before insert or update on public.polls
  for each row
  execute function public.polls_force_secret();

-- =====================================================================
-- 3. Поіменний список більше не читає ніхто
-- =====================================================================
-- Функцію не видаляємо, а забираємо право виконання: якщо колись знадобиться
-- (наприклад, для розслідування зловживань за рішенням активу), її досить буде
-- знову грантувати. Сигнатуру шукаємо в каталозі, щоб міграція не залежала
-- від того, як саме функцію оголошували.

do $$
declare
  r record;
begin
  for r in
    select p.oid::regprocedure as signature
      from pg_proc p
      join pg_namespace n on n.oid = p.pronamespace
     where n.nspname = 'public'
       and p.proname = 'poll_voters'
  loop
    execute format('revoke execute on function %s from authenticated', r.signature);
    execute format('revoke execute on function %s from anon', r.signature);
  end loop;
end $$;

-- Увага: голосування, створені раніше як відкриті, могли зберегти зв'язок
-- «хто за що» у своїх бюлетенях. Читати його вже нізвідки, але фізично в базі
-- він міг залишитися. Якщо потрібно прибрати й це — почистіть відповідні
-- рядки вручну, попередньо перевіривши, що не зіпсуєте підрахунок результатів.
