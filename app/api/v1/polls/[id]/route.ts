import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserWithRoles } from '@/lib/roles';

// PATCH — закрити голосування. Після цього результати стають видимі всім,
// а нові голоси більше не приймаються.
export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { supabase, user } = await getCurrentUserWithRoles();

  if (!user) {
    return NextResponse.json({ error: 'Потрібно увійти в акаунт' }, { status: 401 });
  }

  const { error } = await supabase.rpc('close_poll', { p_poll_id: id });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}

// DELETE — прибрати голосування разом з голосами.
// RLS пускає лише організатора або адміністрацію.
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { supabase, user } = await getCurrentUserWithRoles();

  if (!user) {
    return NextResponse.json({ error: 'Потрібно увійти в акаунт' }, { status: 401 });
  }

  const { error, count } = await supabase
    .from('polls')
    .delete({ count: 'exact' })
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  if (!count) {
    return NextResponse.json(
      { error: 'Видалити голосування може лише його організатор' },
      { status: 403 }
    );
  }
  return NextResponse.json({ ok: true });
}
