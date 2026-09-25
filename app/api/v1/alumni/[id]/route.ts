import { NextRequest, NextResponse } from 'next/server';
import { canManageAlumni, getCurrentUserWithRoles } from '@/lib/roles';

type Ctx = { params: Promise<{ id: string }> };

type Body = {
  name?: string;
  headline?: string;
  years?: string;
  bio?: string;
  photoUrl?: string;
  linkUrl?: string;
  sortOrder?: number;
};

// PATCH — змінити випускника або його місце в списку.
export async function PATCH(request: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const { supabase, user, roles } = await getCurrentUserWithRoles();

  if (!user) {
    return NextResponse.json({ error: 'Потрібно увійти в акаунт' }, { status: 401 });
  }
  if (!canManageAlumni(roles)) {
    return NextResponse.json({ error: 'Недостатньо прав' }, { status: 403 });
  }

  const b = (await request.json().catch(() => ({}))) as Body;

  if (b.name !== undefined && !b.name.trim()) {
    return NextResponse.json({ error: 'Вкажіть імʼя випускника' }, { status: 400 });
  }

  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (b.name !== undefined) patch.name = b.name.trim();
  if (b.headline !== undefined) patch.headline = b.headline.trim() || null;
  if (b.years !== undefined) patch.years = b.years.trim() || null;
  if (b.bio !== undefined) patch.bio = b.bio.trim() || null;
  if (b.photoUrl !== undefined) patch.photo_url = b.photoUrl.trim() || null;
  if (b.linkUrl !== undefined) patch.link_url = b.linkUrl.trim() || null;
  if (Number.isFinite(b.sortOrder)) patch.sort_order = b.sortOrder;

  const { error, count } = await supabase
    .from('alumni')
    .update(patch, { count: 'exact' })
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  if (!count) {
    return NextResponse.json({ error: 'Випускника не знайдено' }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}

// DELETE — прибрати випускника зі сторінки.
export async function DELETE(_request: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const { supabase, user, roles } = await getCurrentUserWithRoles();

  if (!user) {
    return NextResponse.json({ error: 'Потрібно увійти в акаунт' }, { status: 401 });
  }
  if (!canManageAlumni(roles)) {
    return NextResponse.json({ error: 'Недостатньо прав' }, { status: 403 });
  }

  const { error, count } = await supabase
    .from('alumni')
    .delete({ count: 'exact' })
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  if (!count) {
    return NextResponse.json({ error: 'Випускника не знайдено' }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
