import { NextRequest, NextResponse } from 'next/server';
import { canManageStaff, getCurrentUserWithRoles } from '@/lib/roles';

type Ctx = { params: Promise<{ id: string }> };

// PATCH — змінити педагога: імʼя, посаду, фото, кафедру чи порядок.
export async function PATCH(request: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const { supabase, user, roles } = await getCurrentUserWithRoles();

  if (!user) {
    return NextResponse.json({ error: 'Потрібно увійти в акаунт' }, { status: 401 });
  }
  if (!canManageStaff(roles)) {
    return NextResponse.json({ error: 'Недостатньо прав' }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const { department, name, position, photoUrl, sortOrder, deptOrder } = body as {
    department?: string;
    name?: string;
    position?: string;
    photoUrl?: string;
    sortOrder?: number;
    deptOrder?: number;
  };

  if (name !== undefined && !name.trim()) {
    return NextResponse.json({ error: 'Вкажіть прізвище, ім’я та по батькові' }, { status: 400 });
  }
  if (department !== undefined && !department.trim()) {
    return NextResponse.json({ error: 'Оберіть або впишіть кафедру' }, { status: 400 });
  }

  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (name !== undefined) patch.name = name.trim();
  if (position !== undefined) patch.position = position.trim();
  if (photoUrl !== undefined) patch.photo_url = photoUrl.trim() || null;
  if (department !== undefined) patch.department = department.trim();
  if (Number.isFinite(sortOrder)) patch.sort_order = sortOrder;
  if (Number.isFinite(deptOrder)) patch.dept_order = deptOrder;

  const { error, count } = await supabase
    .from('staff_members')
    .update(patch, { count: 'exact' })
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  if (!count) {
    return NextResponse.json({ error: 'Педагога не знайдено' }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}

// DELETE — прибрати педагога зі сторінки.
export async function DELETE(_request: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const { supabase, user, roles } = await getCurrentUserWithRoles();

  if (!user) {
    return NextResponse.json({ error: 'Потрібно увійти в акаунт' }, { status: 401 });
  }
  if (!canManageStaff(roles)) {
    return NextResponse.json({ error: 'Недостатньо прав' }, { status: 403 });
  }

  const { error, count } = await supabase
    .from('staff_members')
    .delete({ count: 'exact' })
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  if (!count) {
    return NextResponse.json({ error: 'Педагога не знайдено' }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
