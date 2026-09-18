import { NextRequest, NextResponse } from 'next/server';
import { getEruditeAccess } from '@/lib/eruditeData';

// DELETE — скасувати штраф (наприклад, нарахований помилково).
export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, user, canManage } = await getEruditeAccess();

  if (!user) return NextResponse.json({ error: 'Потрібно увійти в акаунт' }, { status: 401 });
  if (!canManage) return NextResponse.json({ error: 'Недостатньо прав' }, { status: 403 });

  const { error, count } = await supabase
    .from('erudite_penalties')
    .delete({ count: 'exact' })
    .eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  if (!count) return NextResponse.json({ error: 'Штраф не знайдено' }, { status: 404 });
  return NextResponse.json({ ok: true });
}
