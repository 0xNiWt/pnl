-- 0014_points_moderator.sql
--
-- Модератор нараховує бали нарівні з редактором: і поодинокі нарахування
-- учням, і розподіл бюджету заходу за коефіцієнтами, і скасування
-- помилкового нарахування.
--
-- Сам застосунок пускає модератора на /profile/rating/settings
-- (canManagePoints у lib/roles.ts), але в базі політики RLS на
-- point_transactions знали лише editor і owner — тож нарахування
-- поверталося помилкою прав, як свого часу з новинами (0011).
--
-- Політика лише ДОДАЄТЬСЯ: permissive-політики в PostgreSQL складаються
-- за «або», тому наявні дозволи редактора, адміністрації та учня
-- (бачити свої нарахування) лишаються без змін.
--
-- Міграція безпечна для повторного запуску.

alter table public.point_transactions enable row level security;

-- Модератор бачить, нараховує та скасовує бали нарівні з редактором.
drop policy if exists point_transactions_manage_moderator on public.point_transactions;
create policy point_transactions_manage_moderator
  on public.point_transactions for all
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

-- Список ситуацій (кнопок нарахування) модератор має читати так само,
-- як редактор — інакше панель нарахувань відкриється порожньою.
drop policy if exists point_situations_read_moderator on public.point_situations;
create policy point_situations_read_moderator
  on public.point_situations for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.roles::text[] && array['moderator']
    )
  );
