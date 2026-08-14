import { createClient } from './server';

export type Role = 'student' | 'teacher' | 'editor' | 'moderator' | 'owner';

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

export function canManageNews(roles: Role[]) {
  return roles.includes('editor') || roles.includes('owner');
}

// Той самий набір прав, що й canManageNews — окрема назва для читабельності
// в місцях, не пов'язаних з новинами (наприклад, нарахування балів).
export function canManagePoints(roles: Role[]) {
  return roles.includes('editor') || roles.includes('owner');
}

// Хто може заходити на сторінку керування користувачами та ролями.
export function canManageUsers(roles: Role[]) {
  return roles.includes('owner') || roles.includes('moderator');
}

// Ролі, які можна видати іншому користувачу.
// Овнер може видати будь-яку роль, включно з moderator та owner.
// Модератор може видати всі ролі, окрім owner і moderator.
export function assignableRoles(actingRoles: Role[]): Role[] {
  if (actingRoles.includes('owner')) {
    return ['student', 'teacher', 'editor', 'moderator', 'owner'];
  }
  if (actingRoles.includes('moderator')) {
    return ['student', 'teacher', 'editor'];
  }
  return [];
}

export function canAssignRole(actingRoles: Role[], targetRole: Role): boolean {
  return assignableRoles(actingRoles).includes(targetRole);
}
