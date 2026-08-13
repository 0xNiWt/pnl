import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserWithRoles, canManageNews } from '@/lib/roles';

function slugify(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/['"]/g, '')
    .replace(/[^a-zа-яіїєґ0-9]+/gi, '-')
    .replace(/^-+|-+$/g, '');
}

export async function GET(request: NextRequest) {
  const { supabase, roles } = await getCurrentUserWithRoles();
  const showAll = request.nextUrl.searchParams.get('all') === '1';

  let query = supabase
    .from('news')
    .select('id, title, slug, excerpt, cover_url, published, published_at, created_at')
    .order('created_at', { ascending: false });

  if (!(showAll && canManageNews(roles))) {
    query = query.eq('published', true).order('published_at', { ascending: false });
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: 'Не вдалося завантажити новини' }, { status: 500 });
  }

  return NextResponse.json({ news: data });
}

export async function POST(request: NextRequest) {
  const { supabase, user, roles } = await getCurrentUserWithRoles();

  if (!user) {
    return NextResponse.json({ error: 'Потрібна авторизація' }, { status: 401 });
  }

  if (!canManageNews(roles)) {
    return NextResponse.json({ error: 'Недостатньо прав для публікації новин' }, { status: 403 });
  }

  const body = await request.json();
  const { title, excerpt, content, coverUrl, published } = body as {
    title?: string;
    excerpt?: string;
    content?: string;
    coverUrl?: string;
    published?: boolean;
  };

  if (!title || !content) {
    return NextResponse.json({ error: "Заголовок і текст новини обов'язкові" }, { status: 400 });
  }

  const baseSlug = slugify(title);
  let slug = baseSlug;
  let attempt = 1;

  while (true) {
    const { data: existing } = await supabase
      .from('news')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();

    if (!existing) break;
    attempt += 1;
    slug = `${baseSlug}-${attempt}`;
  }

  const { data, error } = await supabase
    .from('news')
    .insert({
      title,
      slug,
      excerpt: excerpt ?? null,
      content,
      cover_url: coverUrl ?? null,
      author_id: user.id,
      published: Boolean(published),
      published_at: published ? new Date().toISOString() : null,
    })
    .select('id, slug')
    .single();

  if (error) {
    return NextResponse.json({ error: 'Не вдалося створити новину' }, { status: 500 });
  }

  return NextResponse.json({ news: data }, { status: 201 });
}
