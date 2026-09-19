-- 0023_news_reactions.sql
--
-- Реакції на новини: 😃 ❤️ 😢 👍 🎉.
-- Бачити кількість реакцій може кожен відвідувач, ставити — лише
-- зареєстровані користувачі. Один користувач — одна реакція на новину:
-- натиснув іншу — реакція замінилась, натиснув ту саму ще раз — зникла.
--
-- Міграція безпечна для повторного запуску.

create table if not exists public.news_reactions (
  news_id    uuid        not null references public.news(id) on delete cascade,
  user_id    uuid        not null references auth.users(id) on delete cascade default auth.uid(),
  emoji      text        not null check (emoji in ('smile', 'heart', 'cry', 'like', 'party')),
  created_at timestamptz not null default now(),
  primary key (news_id, user_id)
);

create index if not exists news_reactions_news_idx on public.news_reactions (news_id);

alter table public.news_reactions enable row level security;

-- Лічильники бачать усі, зокрема гості.
drop policy if exists news_reactions_read on public.news_reactions;
create policy news_reactions_read
  on public.news_reactions for select
  using (true);

-- Ставити, змінювати й знімати можна лише власну реакцію.
drop policy if exists news_reactions_insert_own on public.news_reactions;
create policy news_reactions_insert_own
  on public.news_reactions for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists news_reactions_update_own on public.news_reactions;
create policy news_reactions_update_own
  on public.news_reactions for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists news_reactions_delete_own on public.news_reactions;
create policy news_reactions_delete_own
  on public.news_reactions for delete
  to authenticated
  using (user_id = auth.uid());

grant select on public.news_reactions to anon, authenticated;
grant insert, update, delete on public.news_reactions to authenticated;
