import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserWithRoles, canManageUsers } from '@/lib/roles';
import { isPositionId } from '@/lib/positions';

// PATCH — призначити або зняти посаду учня (тільки moderator/owner).
//
// Посади не дають жодних прав у системі — це інформаційна позначка
// «хто чим займається в активі» (п. 1.2 Статуту). Ролі змінюються
// окремим роутом: /api/v1/users/[id]/roles.
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
  const { position, action } = body as { position?: string; action?: 'add' | 'remove' };

  if (!position || !isPositionId(position)) {
    return NextResponse.json({ error: 'Невідома посада' }, { status: 400 });
  }
  if (action !== 'add' && action !== 'remove') {
    return NextResponse.json({ error: 'Некоректні дані запиту' }, { status: 400 });
  }

  const { data: targetProfile, error: fetchError } = await supabase
    .from('profiles')
    .select('positions')
    .eq('id', targetUserId)
    .single();

  if (fetchError || !targetProfile) {
    return NextResponse.json({ error: 'Користувача не знайдено' }, { status: 404 });
  }

  const current = (targetProfile.positions ?? []) as string[];
  const next =
    action === 'add'
      ? current.includes(position)
        ? current
        : [...current, position]
      : current.filter((p) => p !== position);

  // Запис іде через SECURITY DEFINER-функцію: вона ще раз перевіряє права
  // на боці бази, тому підробити запит з браузера не вийде.
  const { data: saved, error: updateError } = await supabase.rpc('set_user_positions', {
    p_target_user_id: targetUserId,
    p_new_positions: next,
  });

  if (updateError) {
    console.error('Position update error:', updateError);
    return NextResponse.json(
      { error: `Не вдалося оновити посаду: ${updateError.message}` },
      { status: 500 }
    );
  }

  return NextResponse.json({ positions: saved ?? next }, { status: 200 });
}
