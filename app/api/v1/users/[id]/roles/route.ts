import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/server';
import { getCurrentUserWithRoles, canAssignRole, canManageUsers, type Role } from '@/lib/roles';

const ALL_ROLES: Role[] = ['student', 'teacher', 'editor', 'moderator', 'owner'];

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: targetUserId } = await params;

  const { supabase, user, roles: actingRoles } = await getCurrentUserWithRoles();

  if (!user) {
    return NextResponse.json({ error: 'Потрібно увійти в акаунт' }, { status: 401 });
  }

  if (!canManageUsers(actingRoles)) {
    return NextResponse.json({ error: 'Недостатньо прав' }, { status: 403 });
  }

  const body = await request.json();
  const { role, action } = body as { role?: Role; action?: 'add' | 'remove' };

  if (!role || !ALL_ROLES.includes(role) || (action !== 'add' && action !== 'remove')) {
    return NextResponse.json({ error: 'Некоректні дані запиту' }, { status: 400 });
  }

  // Ключове правило: чинний користувач може призначати чи знімати лише ті ролі,
  // на які в нього є право (модератор не може чіпати роль owner/moderator).
  if (!canAssignRole(actingRoles, role)) {
    return NextResponse.json(
      { error: 'У вас немає права призначати цю роль' },
      { status: 403 }
    );
  }

  const { data: targetProfile, error: fetchError } = await supabase
    .from('profiles')
    .select('roles')
    .eq('id', targetUserId)
    .single();

  if (fetchError || !targetProfile) {
    return NextResponse.json({ error: 'Користувача не знайдено' }, { status: 404 });
  }

  const currentRoles = (targetProfile.roles ?? []) as Role[];

  // Додатковий захист: не можна знімати роль owner чи moderator у когось іншого,
  // якщо в тебе самого немає права призначати цю роль.
  if (action === 'remove' && !canAssignRole(actingRoles, role)) {
    return NextResponse.json(
      { error: 'У вас немає права знімати цю роль' },
      { status: 403 }
    );
  }

  let newRoles: Role[];
  if (action === 'add') {
    newRoles = currentRoles.includes(role) ? currentRoles : [...currentRoles, role];
  } else {
    newRoles = currentRoles.filter((r) => r !== role);
  }

  const { error: updateError } = await supabase
    .from('profiles')
    .update({ roles: newRoles })
    .eq('id', targetUserId);

  if (updateError) {
    console.error('Role update error:', updateError);
    return NextResponse.json({ error: 'Не вдалося оновити ролі' }, { status: 500 });
  }

  return NextResponse.json({ roles: newRoles }, { status: 200 });
}
