// Клієнтський (браузерний) підмножина lib/roles.ts.
// Без імпорту './server' — цей файл можна безпечно використовувати
// в компонентах з "use client".

export type Role = 'student' | 'teacher' | 'editor' | 'moderator' | 'owner';

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
