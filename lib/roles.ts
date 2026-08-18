import { createClient } from './server';
// Роль і правила видачі ролей описані один раз — у rolesClient.ts, бо той
// файл доступний і браузеру. Тут лише перевикористовуємо, щоб дві копії
// тих самих прав не розійшлися з часом.
import { assignableRoles, canAssignRole, type Role } from './rolesClient';

export { assignableRoles, canAssignRole };
export type { Role };

export async function getCurrentUserWithRoles() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { supabase, user: null, roles: [] as Role[] };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('roles')
    .eq('id', user.id)
    .single();

  return { supabase, user, roles: (profile?.roles ?? []) as Role[] };
}

// Новини: редактор, модератор і адміністрація.
export function canManageNews(roles: Role[]) {
  return roles.includes('editor') || roles.includes('moderator') || roles.includes('owner');
}

// Нарахування балів — окреме право: редактор і адміністрація, без модератора.
export function canManagePoints(roles: Role[]) {
  return roles.includes('editor') || roles.includes('owner');
}

// Хто може заходити на сторінку керування користувачами та ролями.
export function canManageUsers(roles: Role[]) {
  return roles.includes('owner') || roles.includes('moderator');
}

// Хто може ховати й повертати рейтинги на публічній сторінці /rating
// (і, відповідно, бачить приховані рейтинги сам).
export function canManageRatingVisibility(roles: Role[]) {
  return roles.includes('owner') || roles.includes('moderator');
}

// Хто редагує таблиці перемог на олімпіадах на сторінці «Про ліцей».
export function canManageOlympiadStats(roles: Role[]) {
  return roles.includes('owner') || roles.includes('moderator');
}

// Хто заводить товари в магазині мерчу та видає замовлення.
export function canManageShop(roles: Role[]) {
  return roles.includes('owner') || roles.includes('moderator');
}

// Хто редагує книгу пам'яті на сторінці «Ліцей».
export function canManageMemoryBook(roles: Role[]) {
  return roles.includes('owner') || roles.includes('moderator');
}


/**
 * Баланс балів учня: нараховано мінус витрачено в магазині.
 *
 * Рахує база (функція points_balance), бо нарахування й замовлення лежать
 * у різних таблицях, а RLS показує читачеві не всі рядки. Рейтинг тут ні
 * до чого: він рахує зароблене й від покупок не змінюється.
 */
export async function getPointsBalance(userId: string): Promise<number> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('points_balance', { p_user: userId });

  return error ? 0 : (data ?? 0);
}
