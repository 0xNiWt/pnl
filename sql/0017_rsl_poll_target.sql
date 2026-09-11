-- 0017_rsl_poll_target.sql
--
-- Повертаємо РСЛ у список груп активу, серед яких можна скликати голосування.
--
-- Міграція 0015 звузила список до чотирьох груп (старости, редактори,
-- фізорги, капітани «Ерудиту») і разом з іншими прибрала звідти представників
-- РСЛ. Але РСЛ — це якраз орган, що збирається окремо й голосує: рада
-- старшокласників ліцею складається з представників від класів.
--
-- Стало — п'ять груп:
--   старости            <- голова старостату;
--   представники РСЛ    <- ПРСЛ;              (додано цією міграцією)
--   редактори           <- голова пресцентру;
--   фізорги             <- голова фізоргів;
--   капітани «Ерудиту»  <- президент клубу.
--
-- ПРСЛ, модератор і адміністрація, як і раніше, скликають будь-яку групу.
-- Для ПРСЛ рядок head = 'prsl' нічого не змінює (він і так проходить за
-- загальним правилом), але тримає в одному місці відповідь на питання
-- «хто голова цієї групи».
--
-- Коло голосування (poll_audience) рахується за position_id і вже вміє
-- працювати з будь-якою посадою, тож чіпати його не треба.
--
-- Той самий розподіл продубльовано в lib/voting.ts: застосунок вирішує,
-- що показати у формі, а база — що дозволити насправді.
--
-- Міграція безпечна для повторного запуску.

create or replace function public.poll_position_targets(p_positions text[], p_roles text[])
returns text[]
language sql
immutable
as $$
  -- Порядок (ord) — як у довіднику lib/positions.ts, щоб список у формі
  -- не стрибав. head — посада, яка скликає голосування серед цієї групи.
  select coalesce(array_agg(t.id order by t.ord), '{}'::text[])
    from (values
            ('starosta'::text,        1, 'head-starostat'::text),
            ('rsl-rep'::text,         2, 'prsl'::text),
            ('redactor'::text,        3, 'head-presscenter'::text),
            ('fizorg'::text,          4, 'head-fizorg'::text),
            ('erudite-captain'::text, 5, 'erudite-president'::text)
         ) as t(id, ord, head)
   -- Адміністрація і ПРСЛ — будь-яка група; голова — лише своя.
   where 'owner'     = any (coalesce(p_roles, '{}'::text[]))
      or 'moderator' = any (coalesce(p_roles, '{}'::text[]))
      or 'prsl'      = any (coalesce(p_positions, '{}'::text[]))
      or t.head      = any (coalesce(p_positions, '{}'::text[]))
$$;

grant execute on function public.poll_position_targets(text[], text[]) to authenticated;
