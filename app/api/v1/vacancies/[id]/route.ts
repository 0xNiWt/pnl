import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserWithRoles, canManageUsers } from '@/lib/roles';

type RouteParams = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const { supabase, user, roles } = await getCurrentUserWithRoles();

  if (!user) {
    return NextResponse.json({ error: 'Потрібна авторизація' }, { status: 401 });
  }

  if (!canManageUsers(roles)) {
    return NextResponse.json({ error: 'Недостатньо прав' }, { status: 403 });
  }

  const body = await request.json();
  const { title, url, sortOrder } = body as { title?: string; url?: string; sortOrder?: number };

  const { data, error } = await supabase
    .from('vacancies')
    .update({
      ...(title !== undefined ? { title } : {}),
      ...(url !== undefined ? { url } : {}),
      ...(sortOrder !== undefined ? { sort_order: sortOrder } : {}),
    })
    .eq('id', id)
    .select('id, title, url, sort_order')
    .single();

  if (error) {
    return NextResponse.json({ error: 'Не вдалося оновити вакансію' }, { status: 500 });
  }

  return NextResponse.json({ vacancy: data });
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const { supabase, user, roles } = await getCurrentUserWithRoles();

  if (!user) {
    return NextResponse.json({ error: 'Потрібна авторизація' }, { status: 401 });
  }

  if (!canManageUsers(roles)) {
    return NextResponse.json({ error: 'Недостатньо прав' }, { status: 403 });
  }

  const { data: deleted, error } = await supabase
    .from('vacancies')
    .delete()
    .eq('id', id)
    .select('id');

  if (error) {
    return NextResponse.json({ error: `Не вдалося видалити вакансію: ${error.message}` }, { status: 500 });
  }

  if (!deleted || deleted.length === 0) {
    return NextResponse.json({ error: 'Видалення заблоковано правами доступу' }, { status: 403 });
  }

  return NextResponse.json({ ok: true });
}
