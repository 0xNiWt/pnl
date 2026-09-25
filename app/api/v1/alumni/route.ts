import { NextRequest, NextResponse } from 'next/server';
import { canManageAlumni, getCurrentUserWithRoles } from '@/lib/roles';

type Body = {
  name?: string;
  headline?: string;
  years?: string;
  bio?: string;
  photoUrl?: string;
  linkUrl?: string;
};

// POST — додати випускника. Новий стає в кінець списку.
export async function POST(request: NextRequest) {
  const { supabase, user, roles } = await getCurrentUserWithRoles();

  if (!user) {
    return NextResponse.json({ error: 'Потрібно увійти в акаунт' }, { status: 401 });
  }
  if (!canManageAlumni(roles)) {
    return NextResponse.json({ error: 'Недостатньо прав' }, { status: 403 });
  }

  const b = (await request.json().catch(() => ({}))) as Body;

  if (!b.name?.trim()) {
    return NextResponse.json({ error: 'Вкажіть імʼя випускника' }, { status: 400 });
  }

  const { data: last } = await supabase
    .from('alumni')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data, error } = await supabase
    .from('alumni')
    .insert({
      name: b.name.trim(),
      headline: b.headline?.trim() || null,
      years: b.years?.trim() || null,
      bio: b.bio?.trim() || null,
      photo_url: b.photoUrl?.trim() || null,
      link_url: b.linkUrl?.trim() || null,
      sort_order: (last?.sort_order ?? 0) + 10,
    })
    .select('id')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ id: data.id }, { status: 201 });
}
