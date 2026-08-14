import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserWithRoles, canManagePoints } from '@/lib/roles';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { supabase, user, roles } = await getCurrentUserWithRoles();

  if (!user) {
    return NextResponse.json({ error: 'Потрібна автентифікація' }, { status: 401 });
  }
  if (!canManagePoints(roles)) {
    return NextResponse.json({ error: 'Недостатньо прав' }, { status: 403 });
  }

  const { error } = await supabase.from('point_transactions').delete().eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
