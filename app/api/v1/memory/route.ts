import { NextRequest, NextResponse } from 'next/server';
import { canManageMemoryBook, getCurrentUserWithRoles } from '@/lib/roles';

// POST — додати запис до книги пам'яті.
export async function POST(request: NextRequest) {
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

  // Новий запис стає в кінець списку.
  const { data: last } = await supabase
    .from('memory_entries')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data, error } = await supabase
    .from('memory_entries')
    .insert({
      name: name.trim(),
      relation: relation?.trim() || null,
      biography: biography?.trim() || null,
      photo_url: photoUrl?.trim() || null,
      sort_order: (last?.sort_order ?? 0) + 1,
    })
    .select('id')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ id: data.id }, { status: 201 });
}
