-- 0011_news_moderator.sql
--
-- Модератор має ті самі права на новини, що й редактор: створювати,
-- редагувати, знімати з публікації та видаляти.
--
-- Застосунок так вважав і раніше (canManageNews у lib/roles.ts пускає
-- editor, moderator і owner), а от у базі політики RLS модератора не
-- знали — тому «Створити» й «Видалити» поверталися помилкою прав.
--
-- Міграція навмисно лише ДОДАЄ політику й нічого не чіпає зі старих:
-- політики RLS складаються за «або», тож новий дозвіл просто розширює
-- наявні, не ламаючи нічого, що вже працює.
--
-- Міграція безпечна для повторного запуску.

alter table public.news enable row level security;

-- Модератор працює з новинами нарівні з редактором.
drop policy if exists news_manage_moderator on public.news;
create policy news_manage_moderator
  on public.news for all
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
