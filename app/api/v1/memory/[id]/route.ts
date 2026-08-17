import { NextRequest, NextResponse } from 'next/server';
import { canManageMemoryBook, getCurrentUserWithRoles } from '@/lib/roles';

// PATCH — змінити запис книги пам'яті.
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { supabase, user, roles } = await getCurrentUserWithRoles();

  if (!user) {
    return NextResponse.json({ error: 'Потрібно увійти в акаунт' }, { status: 401 });
  }
  if (!canManageMemoryBook(roles)) {
    return NextResponse.json({ error: 'Недостатньо прав' }, { status: 403 });
  }

  const body = await request.json();
  const { name, relation, biography, photoUrl } = body as {
    name?: string;
    relation?: string;
    biography?: string;
    photoUrl?: string;
  };

  if (!name?.trim()) {
    return NextResponse.json({ error: 'Вкажіть імʼя' }, { status: 400 });
  }

  const { error, count } = await supabase
    .from('memory_entries')
    .update(
      {
        name: name.trim(),
        relation: relation?.trim() || null,
        biography: biography?.trim() || null,
        photo_url: photoUrl?.trim() || null,
        updated_at: new Date().toISOString(),
      },
      { count: 'exact' }
    )
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  if (!count) {
    return NextResponse.json({ error: 'Запис не знайдено' }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}

// DELETE — прибрати запис.
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { supabase, user, roles } = await getCurrentUserWithRoles();

  if (!user) {
    return NextResponse.json({ error: 'Потрібно увійти в акаунт' }, { status: 401 });
  }
  if (!canManageMemoryBook(roles)) {
    return NextResponse.json({ error: 'Недостатньо прав' }, { status: 403 });
  }

  const { error, count } = await supabase
    .from('memory_entries')
    .delete({ count: 'exact' })
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  if (!count) {
    return NextResponse.json({ error: 'Запис не знайдено' }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
