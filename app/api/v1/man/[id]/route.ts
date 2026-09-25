import { NextRequest, NextResponse } from 'next/server';
import { canManageManWorks, getCurrentUserWithRoles } from '@/lib/roles';

type Ctx = { params: Promise<{ id: string }> };

type Body = {
  title?: string;
  author?: string;
  authorInfo?: string;
  supervisor?: string;
  section?: string;
  year?: string;
  summary?: string;
  description?: string;
  photoUrl?: string;
  fileUrl?: string;
  sortOrder?: number;
};

// PATCH — змінити роботу або її місце в списку.
export async function PATCH(request: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const { supabase, user, roles } = await getCurrentUserWithRoles();

  if (!user) {
    return NextResponse.json({ error: 'Потрібно увійти в акаунт' }, { status: 401 });
  }
  if (!canManageManWorks(roles)) {
    return NextResponse.json({ error: 'Недостатньо прав' }, { status: 403 });
  }

  const b = (await request.json().catch(() => ({}))) as Body;

  if (b.title !== undefined && !b.title.trim()) {
    return NextResponse.json({ error: 'Вкажіть тему роботи' }, { status: 400 });
  }
  if (b.author !== undefined && !b.author.trim()) {
    return NextResponse.json({ error: 'Вкажіть автора роботи' }, { status: 400 });
  }

  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (b.title !== undefined) patch.title = b.title.trim();
  if (b.author !== undefined) patch.author = b.author.trim();
  if (b.authorInfo !== undefined) patch.author_info = b.authorInfo.trim() || null;
  if (b.supervisor !== undefined) patch.supervisor = b.supervisor.trim() || null;
  if (b.section !== undefined) patch.section = b.section.trim() || null;
  if (b.year !== undefined) patch.year = b.year.trim() || null;
  if (b.summary !== undefined) patch.summary = b.summary.trim() || null;
  if (b.description !== undefined) patch.description = b.description.trim() || null;
  if (b.photoUrl !== undefined) patch.photo_url = b.photoUrl.trim() || null;
  if (b.fileUrl !== undefined) patch.file_url = b.fileUrl.trim() || null;
  if (Number.isFinite(b.sortOrder)) patch.sort_order = b.sortOrder;

  const { error, count } = await supabase
    .from('man_works')
    .update(patch, { count: 'exact' })
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  if (!count) {
    return NextResponse.json({ error: 'Роботу не знайдено' }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}

// DELETE — прибрати роботу зі сторінки.
export async function DELETE(_request: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const { supabase, user, roles } = await getCurrentUserWithRoles();

  if (!user) {
    return NextResponse.json({ error: 'Потрібно увійти в акаунт' }, { status: 401 });
  }
  if (!canManageManWorks(roles)) {
    return NextResponse.json({ error: 'Недостатньо прав' }, { status: 403 });
  }

  const { error, count } = await supabase
    .from('man_works')
    .delete({ count: 'exact' })
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  if (!count) {
    return NextResponse.json({ error: 'Роботу не знайдено' }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
