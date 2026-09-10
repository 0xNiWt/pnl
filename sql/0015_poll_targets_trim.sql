-- 0015_poll_targets_trim.sql
--
-- Звужуємо список груп активу, серед яких можна скликати голосування.
--
-- Було: будь-яка класна посада — старости, представники РСЛ, редактори,
-- культорги, фізорги, фотографи, капітани «Ерудиту», усі заступники та
-- волонтери. Дванадцять груп у списку, більшість із них ніколи ні за що
-- не голосує.
--
-- Стало: рівно чотири групи, які справді збираються окремо —
--   старости, редактори, фізорги, капітани команд «Ерудит».
--
-- Хто кого скликає (заступників у списках більше немає):
--   голова старостату   → старости;
--   голова пресцентру   → редактори;
--   голова фізоргів     → фізорги;
--   президент «Ерудиту» → капітани команд;
--   ПРСЛ, модератор і адміністрація → будь-яка з чотирьох груп.
--
-- Той самий розподіл прав продубльовано в lib/voting.ts: застосунок
-- вирішує, що показати у формі, а база — що дозволити насправді.
--
-- Уже створені голосування не чіпаємо: коло голосування рахує
-- poll_audience за position_id, а вона тут не змінюється. Тож старе
-- голосування серед, скажімо, волонтерів дійде до кінця нормально —
-- нове просто вже не створити.
--
-- Міграція безпечна для повторного запуску.

create or replace function public.poll_position_targets(p_positions text[], p_roles text[])
returns text[]
language plpgsql
immutable
as $$
declare
  -- Групи активу, серед яких узагалі проводять голосування.
  -- Порядок — як у довіднику lib/positions.ts.
  v_all text[] := array['starosta', 'redactor', 'fizorg', 'erudite-captain'];
  v_out text[] := '{}';
begin
  p_positions := coalesce(p_positions, '{}');
  p_roles     := coalesce(p_roles, '{}');

  if p_roles && array['owner', 'moderator'] or 'prsl' = any (p_positions) then
    return v_all;
  end if;

  if 'head-starostat' = any (p_positions) then
    v_out := v_out || array['starosta'];
  end if;
  if 'head-presscenter' = any (p_positions) then
    v_out := v_out || array['redactor'];
  end if;
  if 'head-fizorg' = any (p_positions) then
    v_out := v_out || array['fizorg'];
  end if;
  if 'erudite-president' = any (p_positions) then
    v_out := v_out || array['erudite-captain'];
  end if;

  return v_out;
end $$;

grant execute on function public.poll_position_targets(text[], text[]) to authenticated;
