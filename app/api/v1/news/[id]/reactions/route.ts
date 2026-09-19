import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/server';
import { emptyCounts, isReactionId, type ReactionId, type ReactionsState } from '@/lib/newsReactions';

type Ctx = { params: Promise<{ id: string }> };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function readState(newsId: string): Promise<ReactionsState> {
  const supabase = await createClient();
  const [{ data: { user } }, { data: rows }] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from('news_reactions').select('user_id, emoji').eq('news_id', newsId),
  ]);

  const counts = emptyCounts();
  let mine: ReactionId | null = null;
  for (const row of rows ?? []) {
    if (!isReactionId(row.emoji)) continue;
    counts[row.emoji] += 1;
    if (user && row.user_id === user.id) mine = row.emoji;
  }

  return { counts, mine, isLoggedIn: !!user };
}

// GET — лічильники реакцій і реакція поточного користувача.
export async function GET(_request: NextRequest, { params }: Ctx) {
  const { id } = await params;
  if (!UUID.test(id)) {
    return NextResponse.json({ error: 'Новину не знайдено' }, { status: 404 });
  }
  return NextResponse.json(await readState(id), {
    headers: { 'Cache-Control': 'no-store' },
  });
}

// POST { emoji } — поставити реакцію. Та сама реакція вдруге її знімає,
// інша — замінює попередню. Лише для зареєстрованих користувачів.
export async function POST(request: NextRequest, { params }: Ctx) {
  const { id } = await params;
  if (!UUID.test(id)) {
    return NextResponse.json({ error: 'Новину не знайдено' }, { status: 404 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Щоб ставити реакції, увійдіть в акаунт' }, { status: 401 });
  }

  const { emoji } = (await request.json().catch(() => ({}))) as { emoji?: unknown };
  if (!isReactionId(emoji)) {
    return NextResponse.json({ error: 'Невідома реакція' }, { status: 400 });
  }

  const { data: current } = await supabase
    .from('news_reactions')
    .select('emoji')
    .eq('news_id', id)
    .eq('user_id', user.id)
    .maybeSingle();

  const { error } = current?.emoji === emoji
    ? await supabase.from('news_reactions').delete().eq('news_id', id).eq('user_id', user.id)
    : await supabase
        .from('news_reactions')
        .upsert({ news_id: id, user_id: user.id, emoji }, { onConflict: 'news_id,user_id' });

  if (error) {
    return NextResponse.json({ error: 'Не вдалося зберегти реакцію' }, { status: 500 });
  }

  return NextResponse.json(await readState(id));
}
