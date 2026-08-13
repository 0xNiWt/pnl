import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserWithRoles, canManageNews } from '@/lib/roles';

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const { supabase, roles } = await getCurrentUserWithRoles();

  if (!canManageNews(roles)) {
    return NextResponse.json({ error: 'Недостатньо прав' }, { status: 403 });
  }

  const { data, error } = await supabase
    .from('news')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Новину не знайдено' }, { status: 404 });
  }

  return NextResponse.json({ news: data });
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const { supabase, user, roles } = await getCurrentUserWithRoles();

  if (!user) {
    return NextResponse.json({ error: 'Потрібна авторизація' }, { status: 401 });
  }

  if (!canManageNews(roles)) {
    return NextResponse.json({ error: 'Недостатньо прав' }, { status: 403 });
  }

  const body = await request.json();
  const { title, excerpt, content, coverUrl, images, published } = body as {
    title?: string;
    excerpt?: string;
    content?: string;
    coverUrl?: string;
    images?: string[];
    published?: boolean;
  };

  const { data: existing } = await supabase
    .from('news')
    .select('published, published_at')
    .eq('id', id)
    .single();

  const wasPublished = existing?.published ?? false;
  const nextPublished = published ?? wasPublished;

  const { data, error } = await supabase
    .from('news')
    .update({
      ...(title !== undefined ? { title } : {}),
      ...(excerpt !== undefined ? { excerpt } : {}),
      ...(content !== undefined ? { content } : {}),
      ...(coverUrl !== undefined ? { cover_url: coverUrl } : {}),
      ...(images !== undefined ? { images } : {}),
      published: nextPublished,
      published_at: !wasPublished && nextPublished
        ? new Date().toISOString()
        : existing?.published_at,
    })
    .eq('id', id)
    .select('id, slug')
    .single();

  if (error) {
    return NextResponse.json({ error: 'Не вдалося оновити новину' }, { status: 500 });
  }

  return NextResponse.json({ news: data });
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const { supabase, user, roles } = await getCurrentUserWithRoles();

  if (!user) {
    return NextResponse.json({ error: 'Потрібна авторизація' }, { status: 401 });
  }

  if (!canManageNews(roles)) {
    return NextResponse.json({ error: 'Недостатньо прав' }, { status: 403 });
  }

  const { error } = await supabase.from('news').delete().eq('id', id);

  if (error) {
    return NextResponse.json({ error: 'Не вдалося видалити новину' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
