import { NextRequest, NextResponse } from 'next/server';
import { canManageManWorks, getCurrentUserWithRoles } from '@/lib/roles';

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
};

// POST — додати роботу МАН. Нова стає в кінець списку.
export async function POST(request: NextRequest) {
  const { supabase, user, roles } = await getCurrentUserWithRoles();

  if (!user) {
    return NextResponse.json({ error: 'Потрібно увійти в акаунт' }, { status: 401 });
  }
  if (!canManageManWorks(roles)) {
    return NextResponse.json({ error: 'Недостатньо прав' }, { status: 403 });
  }

  const b = (await request.json().catch(() => ({}))) as Body;

  if (!b.title?.trim()) {
    return NextResponse.json({ error: 'Вкажіть тему роботи' }, { status: 400 });
  }
  if (!b.author?.trim()) {
    return NextResponse.json({ error: 'Вкажіть автора роботи' }, { status: 400 });
  }

  const { data: last } = await supabase
    .from('man_works')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data, error } = await supabase
    .from('man_works')
    .insert({
      title: b.title.trim(),
      author: b.author.trim(),
      author_info: b.authorInfo?.trim() || null,
      supervisor: b.supervisor?.trim() || null,
      section: b.section?.trim() || null,
      year: b.year?.trim() || null,
      summary: b.summary?.trim() || null,
      description: b.description?.trim() || null,
      photo_url: b.photoUrl?.trim() || null,
      file_url: b.fileUrl?.trim() || null,
      sort_order: (last?.sort_order ?? 0) + 10,
    })
    .select('id')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ id: data.id }, { status: 201 });
}
