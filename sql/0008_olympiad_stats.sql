-- 0008_olympiad_stats.sql
--
-- Таблиці перемог на олімпіадах для сторінки «Про ліцей».
-- Чотири набори: міжнародні, всеукраїнські, міські олімпіади та конкурс
-- захисту робіт МАН. Кожен набір — це список предметів (рядки) і список
-- навчальних років (колонки); у клітинках — кількість перемог.
--
-- Роки зберігаємо масивом у самій таблиці, а не виводимо з даних: колонка
-- може бути порожньою (рік був, перемог не було) і все одно має показуватись.
-- Клітинки лежать у jsonb рядка — так один предмет це один запис, а не
-- двадцять п'ять.
--
-- Редагувати може лише адміністрація або модератор — і через RLS, і через
-- функцію save_olympiad_table, яка перевіряє права ще раз.
--
-- Міграція безпечна для повторного запуску.

-- =====================================================================
-- 1. Схема
-- =====================================================================

create table if not exists public.olympiad_tables (
  id          text primary key,
  title       text not null,
  subtitle    text,
  note        text,
  years       text[] not null default '{}',
  sort_order  int not null default 0,
  updated_at  timestamptz not null default now(),
  updated_by  uuid references auth.users (id) on delete set null
);

create table if not exists public.olympiad_rows (
  id          uuid primary key default gen_random_uuid(),
  table_id    text not null references public.olympiad_tables (id) on delete cascade,
  subject     text not null,
  -- Якщо задано — показуємо це число замість суми клітинок. Потрібно тому,
  -- що частина перемог припадає на роки, за які системних даних немає.
  total       int,
  counts      jsonb not null default '{}'::jsonb,
  sort_order  int not null default 0
);

create index if not exists olympiad_rows_table_idx
  on public.olympiad_rows (table_id, sort_order);

alter table public.olympiad_tables enable row level security;
alter table public.olympiad_rows   enable row level security;

-- Читає будь-хто: це публічна статистика зі сторінки «Про ліцей».
drop policy if exists olympiad_tables_read on public.olympiad_tables;
create policy olympiad_tables_read
  on public.olympiad_tables for select using (true);

drop policy if exists olympiad_rows_read on public.olympiad_rows;
create policy olympiad_rows_read
  on public.olympiad_rows for select using (true);

-- Пише лише адміністрація або модератор.
drop policy if exists olympiad_tables_manage on public.olympiad_tables;
create policy olympiad_tables_manage
  on public.olympiad_tables for all
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.roles::text[] && array['owner', 'moderator']
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.roles::text[] && array['owner', 'moderator']
    )
  );

drop policy if exists olympiad_rows_manage on public.olympiad_rows;
create policy olympiad_rows_manage
  on public.olympiad_rows for all
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.roles::text[] && array['owner', 'moderator']
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.roles::text[] && array['owner', 'moderator']
    )
  );

-- =====================================================================
-- 2. Збереження таблиці одним запитом
-- =====================================================================
-- Клієнт надсилає повний стан таблиці (роки + усі рядки), а функція
-- переписує його атомарно. Так не буває напівзбереженого стану, коли рядки
-- вже нові, а роки ще старі.
--
-- p_rows очікується як масив об'єктів:
--   [{ "subject": "хімія", "total": 9, "counts": { "2005-2006": 1 } }, ...]

create or replace function public.save_olympiad_table(
  p_table_id text,
  p_years    text[],
  p_rows     jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_roles text[];
  v_row   jsonb;
  v_index int := 0;
begin
  select roles::text[] into v_roles from public.profiles where id = auth.uid();

  if v_roles is null or not (v_roles && array['owner', 'moderator']) then
    raise exception 'Недостатньо прав';
  end if;

  if not exists (select 1 from public.olympiad_tables where id = p_table_id) then
    raise exception 'Невідома таблиця: %', p_table_id;
  end if;

  if jsonb_typeof(p_rows) <> 'array' then
    raise exception 'Рядки треба передати масивом';
  end if;

  update public.olympiad_tables
     set years = coalesce(p_years, '{}'),
         updated_at = now(),
         updated_by = auth.uid()
   where id = p_table_id;

  delete from public.olympiad_rows where table_id = p_table_id;

  for v_row in select * from jsonb_array_elements(p_rows)
  loop
    if coalesce(trim(v_row ->> 'subject'), '') <> '' then
      insert into public.olympiad_rows (table_id, subject, total, counts, sort_order)
      values (
        p_table_id,
        trim(v_row ->> 'subject'),
        nullif(v_row ->> 'total', '')::int,
        coalesce(v_row -> 'counts', '{}'::jsonb),
        v_index
      );
      v_index := v_index + 1;
    end if;
  end loop;
end;
$$;

grant execute on function public.save_olympiad_table(text, text[], jsonb) to authenticated;

-- =====================================================================
-- 3. Наповнення: чотири таблиці
-- =====================================================================

insert into public.olympiad_tables (id, title, subtitle, note, years, sort_order)
values
  (
    'international',
    'Міжнародні олімпіади',
    'Кількість перемог учнів ліцею на міжнародних олімпіадах',
    'Системної інформації до 2003/2004 н. р. немає. MMOX — Міжнародна менделєєвська олімпіада з хімії; EGMO — Європейська математична олімпіада для дівчат; RMM — Romanian Master of Mathematics; APLO — Asia Pacific Linguistics Olympiad; GO — Genious Olympiad.',
    array[
      '2003-2004','2004-2005','2005-2006','2006-2007','2007-2008','2008-2009',
      '2009-2010','2010-2011','2011-2012','2012-2013','2013-2014','2014-2015',
      '2015-2016','2016-2017','2017-2018','2018-2019','2021-2022','2022-2023',
      '2024-2025'
    ],
    1
  ),
  (
    'national',
    'Всеукраїнські олімпіади',
    'Кількість перемог учнів ліцею на всеукраїнських олімпіадах',
    'Системної інформації до 2003/2004 н. р. немає.',
    array[
      '1998-1999','1999-2000','2000-2001','2001-2002','2002-2003','2003-2004',
      '2004-2005','2005-2006','2006-2007','2007-2008','2008-2009','2009-2010',
      '2010-2011','2011-2012','2012-2013','2013-2014','2014-2015','2015-2016',
      '2016-2017','2017-2018','2018-2019','2020-2021','2021-2022','2022-2023',
      '2023-2024','2024-2025'
    ],
    2
  ),
  (
    'city',
    'Міські олімпіади',
    'Кількість перемог учнів ліцею на міських олімпіадах',
    'Системної інформації до 2003 року немає.',
    array[
      '2000-2001','2001-2002','2002-2003','2003-2004','2004-2005','2005-2006',
      '2006-2007','2007-2008','2008-2009','2009-2010','2010-2011','2011-2012',
      '2012-2013','2013-2014','2014-2015','2015-2016','2016-2017','2017-2018',
      '2018-2019','2020-2021','2021-2022','2022-2023','2023-2024','2024-2025'
    ],
    3
  ),
  (
    'man',
    'Конкурс захисту робіт МАН',
    'Кількість перемог учнів ліцею на конкурсі-захисті науково-дослідницьких робіт МАН',
    null,
    array[
      '2000-2001','2001-2002','2002-2003','2003-2004','2004-2005','2005-2006',
      '2006-2007','2007-2008','2008-2009','2009-2010','2010-2011','2011-2012',
      '2012-2013','2013-2014','2014-2015','2015-2016','2016-2017','2017-2018',
      '2018-2019','2020-2021','2021-2022','2022-2023','2023-2024','2024-2025'
    ],
    4
  )
on conflict (id) do nothing;

-- Предмети наповнюємо лише тоді, коли таблиця ще порожня: інакше повторний
-- запуск міграції затер би те, що адміністрація вже відредагувала.

-- Міжнародні олімпіади
insert into public.olympiad_rows (table_id, subject, total, sort_order)
select 'international', subject, total, sort_order
from (values
  ('хімія', 9, 0),
  ('фізика', 8, 1),
  ('інформатика', 6, 2),
  ('біологія', 4, 3),
  ('математика', 2, 4),
  ('лінгвістика', 1, 5),
  ('штучний інтелект', 1, 6),
  ('хімія (MMOX)', 20, 7),
  ('математика (EGMO)', 5, 8),
  ('математика (RMM)', 3, 9),
  ('лінгвістика (APLO)', 3, 10),
  ('екологія (GO)', 1, 11)
) as seed(subject, total, sort_order)
where not exists (select 1 from public.olympiad_rows where table_id = 'international');

-- Всеукраїнські олімпіади
insert into public.olympiad_rows (table_id, subject, total, sort_order)
select 'national', subject, total, sort_order
from (values
  ('хімія', 94, 0),
  ('фізика', 67, 1),
  ('інформатика', 45, 2),
  ('математика', 19, 3),
  ('біологія', 16, 4),
  ('офісні технології', 5, 5),
  ('астрономія', 4, 6),
  ('лінгвістика', 3, 7),
  ('англійська мова', 2, 8),
  ('географія', 2, 9),
  ('історія', 1, 10),
  ('екологія', 1, 11),
  ('економіка', 1, 12),
  ('польська мова', 1, 13),
  ('французька мова', 1, 14)
) as seed(subject, total, sort_order)
where not exists (select 1 from public.olympiad_rows where table_id = 'national');

-- Міські олімпіади
insert into public.olympiad_rows (table_id, subject, total, sort_order)
select 'city', subject, total, sort_order
from (values
  ('фізика', 693, 0),
  ('математика', 678, 1),
  ('хімія', 330, 2),
  ('біологія', 219, 3),
  ('інформатика', 179, 4),
  ('англійська мова', 55, 5),
  ('географія', 50, 6),
  ('лінгвістика', 42, 7),
  ('історія', 40, 8),
  ('правознавство', 33, 9),
  ('українська мова', 33, 10),
  ('зарубіжна (світова) література', 25, 11),
  ('офісні технології', 24, 12),
  ('лінгвістика (командна)', 14, 13),
  ('астрономія', 13, 14),
  ('WEB-дизайн', 12, 15),
  ('комп''ютерна анімація', 6, 16),
  ('економіка', 6, 17),
  ('образотворче мистецтво', 4, 18),
  ('німецька мова', 4, 19),
  ('комп''ютерна графіка', 3, 20),
  ('польська мова', 3, 21),
  ('іспанська мова', 2, 22),
  ('східні мови', 1, 23),
  ('екологія', 1, 24),
  ('педагогіка і психологія', 1, 25),
  ('французька мова', 1, 26),
  ('трудове навчання / технології', 1, 27)
) as seed(subject, total, sort_order)
where not exists (select 1 from public.olympiad_rows where table_id = 'city');

-- Таблицю МАН лишаємо порожньою навмисно: предмети та роки внесе
-- адміністрація через кабінет.
