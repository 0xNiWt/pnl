-- 0016_rating_consent.sql
--
-- Згода учня на участь у рейтинговій системі — пп. 10.1.2–10.1.5 та 10.2.2
-- Положення про учнівське самоврядування.
--
-- Що робить міграція:
--   1) додає в profiles відмітки про згоду та про її відкликання;
--   2) переносить згоду, дану під час реєстрації, з метаданих акаунта;
--   3) додає функцію, якою згоду дають уже наявні акаунти з кабінету;
--   4) заводить таблицю налаштувань із перемикачем «строгого режиму»
--      (чи виключати з рейтингів тих, хто згоди не дав).
--
-- Міграція безпечна для повторного запуску.

-- =====================================================================
-- 1. Відмітки в профілі
-- =====================================================================

alter table public.profiles
  add column if not exists rating_consent_at         timestamptz,
  add column if not exists rating_consent_version    text,
  -- П. 10.1.4: відкликати згоду можна ВИКЛЮЧНО письмовою заявою на ім'я
  -- директора, тому кнопки для цього на сайті немає й бути не повинно.
  -- Поле заповнює адміністрація, коли така заява надійшла.
  add column if not exists rating_consent_revoked_at timestamptz;

comment on column public.profiles.rating_consent_at is
  'Коли учень дав згоду на участь у рейтингах (п. 10.1.2 Положення).';
comment on column public.profiles.rating_consent_version is
  'Редакція Положення, на яку дано згоду.';
comment on column public.profiles.rating_consent_revoked_at is
  'Коли згоду відкликано письмовою заявою (п. 10.1.4). Заповнює адміністрація.';

-- =====================================================================
-- 2. Згода, дана під час реєстрації
-- =====================================================================
-- Прапорець їде разом із signUp у метаданих акаунта, тому підробити його
-- окремим запитом не вийде: він з'являється тільки в тій самій операції,
-- якою створюють акаунт. Профіль створює тригер бази, а цей тригер
-- спрацьовує на його вставці й переносить відмітку в профіль.

create or replace function public.sync_rating_consent_from_metadata()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_version text;
begin
  select u.raw_user_meta_data ->> 'rating_consent_version'
    into v_version
  from auth.users u
  where u.id = new.id;

  if v_version is not null and v_version <> '' then
    new.rating_consent_at := now();
    new.rating_consent_version := v_version;
  end if;

  return new;
end;
$$;

drop trigger if exists profiles_rating_consent on public.profiles;
create trigger profiles_rating_consent
  before insert on public.profiles
  for each row
  execute function public.sync_rating_consent_from_metadata();

-- =====================================================================
-- 3. Згода з кабінету — для акаунтів, створених до цієї міграції
-- =====================================================================
-- Діє лише на себе: чужий id функція не приймає взагалі.
-- Відкликану згоду назад не вмикає — п. 10.1.5 забороняє повторне
-- включення до кінця навчального року.

create or replace function public.give_rating_consent(p_version text)
returns timestamptz
language plpgsql
security definer
set search_path = public
as $$
declare
  v_revoked timestamptz;
  v_now     timestamptz := now();
begin
  if auth.uid() is null then
    raise exception 'Потрібно увійти в акаунт';
  end if;

  select rating_consent_revoked_at into v_revoked
  from public.profiles where id = auth.uid();

  if v_revoked is not null then
    raise exception 'Згоду було відкликано: повторне включення можливе не раніше наступного навчального року (п. 10.1.5)';
  end if;

  update public.profiles
     set rating_consent_at = v_now,
         rating_consent_version = p_version
   where id = auth.uid();

  return v_now;
end;
$$;

grant execute on function public.give_rating_consent(text) to authenticated;

-- =====================================================================
-- 4. Налаштування: строгий режим рейтингів
-- =====================================================================

create table if not exists public.app_settings (
  key        text primary key,
  value      jsonb not null default 'null'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete set null
);

-- Поки вимкнено: наявні акаунти лишаються в рейтингах, доки не дадуть
-- згоду з кабінету. Вмикати, коли більшість уже погодилася.
insert into public.app_settings (key, value)
values ('rating_consent_enforced', 'false'::jsonb)
on conflict (key) do nothing;

alter table public.app_settings enable row level security;

drop policy if exists app_settings_read on public.app_settings;
create policy app_settings_read
  on public.app_settings
  for select
  using (true);

-- Прямих політик на запис немає: тільки через функцію нижче.

create or replace function public.set_app_setting(p_key text, p_value jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_roles text[];
begin
  -- profiles.roles — масив enum-типу app_role, тому порівнюємо через text[].
  select roles::text[] into v_roles from public.profiles where id = auth.uid();

  if v_roles is null or not (v_roles && array['owner', 'moderator']) then
    raise exception 'Недостатньо прав';
  end if;

  insert into public.app_settings (key, value, updated_at, updated_by)
  values (p_key, p_value, now(), auth.uid())
  on conflict (key) do update
    set value = excluded.value,
        updated_at = now(),
        updated_by = auth.uid();
end;
$$;

grant execute on function public.set_app_setting(text, jsonb) to authenticated;
