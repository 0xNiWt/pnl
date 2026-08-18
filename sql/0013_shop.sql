-- 0013_shop.sql
--
-- Магазин мерчу ліцею.
--
-- Товар можна купити двома способами, і кожен товар сам вирішує, якими:
--   за бали   — price_points; бали списуються одразу, замовлення лягає
--               в shop_orders, адміністрація потім видає мерч;
--   за гроші  — price_uah разом із посиланням на Google-форму; оплату сайт
--               не проводить, кнопка просто відкриває форму.
-- Порожня ціна означає «цим способом не продається». Якщо порожні обидві —
-- товар просто показується як вітрина.
--
-- Важливо про бали: рейтинг за Статутом рахує ЗАРОБЛЕНЕ, тому покупки не
-- чіпають point_transactions і місце учня в рейтингу не змінюють. Витрати
-- живуть окремо, у shop_orders, а баланс у кабінеті — це різниця:
--   баланс = сума нарахувань − сума незаскасованих замовлень.
-- Саме це й рахує функція points_balance.
--
-- Міграція безпечна для повторного запуску.

-- =====================================================================
-- 1. Товари
-- =====================================================================

create table if not exists public.shop_products (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  description  text,
  image_url    text,
  -- Ціна в балах ліцею. null — за бали не продається.
  price_points integer check (price_points is null or price_points > 0),
  -- Ціна в гривнях. null — за гроші не продається.
  price_uah    numeric(10, 2) check (price_uah is null or price_uah > 0),
  -- Google-форма, яка відкривається на покупку за гроші.
  form_url     text,
  -- Скільки лишилося. null — облік не ведемо, товар не закінчується.
  stock        integer check (stock is null or stock >= 0),
  active       boolean not null default true,
  sort_order   integer not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists shop_products_order_idx
  on public.shop_products (sort_order, created_at);

-- =====================================================================
-- 2. Замовлення за бали
-- =====================================================================
-- Назву й ціну зберігаємо знімком: товар потім можуть перейменувати,
-- здешевшати чи прибрати, а замовлення має лишитися таким, яким було.

create table if not exists public.shop_orders (
  id            uuid primary key default gen_random_uuid(),
  product_id    uuid references public.shop_products (id) on delete set null,
  student_id    uuid not null references auth.users (id) on delete cascade,
  product_title text not null,
  points_spent  integer not null check (points_spent >= 0),
  -- new — чекає видачі; issued — мерч віддано; cancelled — бали повернуто.
  status        text not null default 'new' check (status in ('new', 'issued', 'cancelled')),
  created_at    timestamptz not null default now(),
  handled_at    timestamptz,
  handled_by    uuid references auth.users (id) on delete set null
);

create index if not exists shop_orders_student_idx on public.shop_orders (student_id);
create index if not exists shop_orders_status_idx  on public.shop_orders (status, created_at desc);

-- =====================================================================
-- 3. Баланс балів
-- =====================================================================
-- Одне визначення балансу на всю систему: ним користуються і кабінет,
-- і сама покупка. security definer — щоб порахувати суму нарахувань
-- незалежно від того, які рядки видно читачеві.

create or replace function public.points_balance(p_user uuid)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select
    coalesce((
      select sum(t.points)::integer
        from public.point_transactions t
       where t.target = 'student'
         and t.student_id = p_user
    ), 0)
    -
    coalesce((
      select sum(o.points_spent)::integer
        from public.shop_orders o
       where o.student_id = p_user
         and o.status <> 'cancelled'
    ), 0)
$$;

-- =====================================================================
-- 4. Покупка за бали
-- =====================================================================

create or replace function public.buy_for_points(p_product_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid     uuid := auth.uid();
  v_product public.shop_products%rowtype;
  v_balance integer;
  v_order   uuid;
begin
  if v_uid is null then
    raise exception 'Потрібно увійти в акаунт';
  end if;

  -- Блокуємо рядок товару: дві одночасні покупки останньої футболки
  -- шикуються в чергу, і друга побачить, що залишку вже немає.
  select * into v_product
    from public.shop_products
   where id = p_product_id
     for update;

  if not found then
    raise exception 'Товар не знайдено';
  end if;
  if not v_product.active then
    raise exception 'Товар зараз недоступний';
  end if;
  if v_product.price_points is null then
    raise exception 'Цей товар за бали не продається';
  end if;
  if v_product.stock is not null and v_product.stock <= 0 then
    raise exception 'Товар закінчився';
  end if;

  v_balance := public.points_balance(v_uid);

  if v_balance < v_product.price_points then
    raise exception 'Не вистачає балів: потрібно %, у вас %',
      v_product.price_points, v_balance;
  end if;

  if v_product.stock is not null then
    update public.shop_products
       set stock = stock - 1, updated_at = now()
     where id = p_product_id;
  end if;

  insert into public.shop_orders (product_id, student_id, product_title, points_spent)
  values (p_product_id, v_uid, v_product.title, v_product.price_points)
  returning id into v_order;

  return v_order;
end $$;

-- =====================================================================
-- 5. Видача та скасування
-- =====================================================================
-- Скасування повертає бали автоматично: баланс рахує лише незаскасовані
-- замовлення, тому окремої «зворотної транзакції» не потрібно.

create or replace function public.set_shop_order_status(p_order_id uuid, p_status text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid   uuid := auth.uid();
  v_order public.shop_orders%rowtype;
begin
  if v_uid is null then
    raise exception 'Потрібно увійти в акаунт';
  end if;

  if not exists (
    select 1 from public.profiles p
     where p.id = v_uid
       and p.roles::text[] && array['owner', 'moderator']
  ) then
    raise exception 'Замовленнями керує адміністрація або модератор';
  end if;

  if p_status not in ('new', 'issued', 'cancelled') then
    raise exception 'Невідомий статус замовлення: %', p_status;
  end if;

  select * into v_order from public.shop_orders where id = p_order_id for update;

  if not found then
    raise exception 'Замовлення не знайдено';
  end if;
  if v_order.status = p_status then
    return;
  end if;

  -- Товар повертається на склад, коли замовлення скасували, і знімається
  -- зі складу, якщо скасування відкотили назад.
  if v_order.product_id is not null then
    if p_status = 'cancelled' then
      update public.shop_products
         set stock = stock + 1, updated_at = now()
       where id = v_order.product_id and stock is not null;
    elsif v_order.status = 'cancelled' then
      update public.shop_products
         set stock = greatest(stock - 1, 0), updated_at = now()
       where id = v_order.product_id and stock is not null;
    end if;
  end if;

  update public.shop_orders
     set status = p_status,
         handled_at = now(),
         handled_by = v_uid
   where id = p_order_id;
end $$;

-- =====================================================================
-- 6. Доступ
-- =====================================================================

alter table public.shop_products enable row level security;
alter table public.shop_orders   enable row level security;

-- Вітрину видно всім, зокрема й незалогіненим. Приховані товари —
-- лише адміністрації та модератору.
drop policy if exists shop_products_read on public.shop_products;
create policy shop_products_read
  on public.shop_products for select
  using (
    active
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.roles::text[] && array['owner', 'moderator']
    )
  );

-- Заводить і змінює товари адміністрація або модератор.
drop policy if exists shop_products_manage on public.shop_products;
create policy shop_products_manage
  on public.shop_products for all
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

-- Своє замовлення бачить учень, усі — адміністрація й модератор.
drop policy if exists shop_orders_read on public.shop_orders;
create policy shop_orders_read
  on public.shop_orders for select
  using (
    student_id = auth.uid()
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.roles::text[] && array['owner', 'moderator']
    )
  );

-- Писати в замовлення напряму не можна нікому: і покупка, і зміна статусу
-- йдуть через функції вище, які перевіряють бали та права.

grant execute on function public.points_balance(uuid) to authenticated;
grant execute on function public.buy_for_points(uuid) to authenticated;
grant execute on function public.set_shop_order_status(uuid, text) to authenticated;
