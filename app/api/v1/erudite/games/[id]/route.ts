import { NextRequest, NextResponse } from 'next/server';
import { getEruditeAccess } from '@/lib/eruditeData';
import { parseGamePayload } from '../../gamePayload';

type Params = { params: Promise<{ id: string }> };

// PUT — переписати гру та всі її результати.
export async function PUT(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const { supabase, user, canManage } = await getEruditeAccess();

  if (!user) return NextResponse.json({ error: 'Потрібно увійти в акаунт' }, { status: 401 });
  if (!canManage) return NextResponse.json({ error: 'Недостатньо прав' }, { status: 403 });

  const parsed = parseGamePayload(await request.json());
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

  const { season, title, playedOn, results } = parsed.value;
  const { error } = await supabase.rpc('save_erudite_game', {
    p_game_id: id,
    p_season: season,
    p_title: title,
    p_played_on: playedOn,
    p_results: results,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}

// DELETE — прибрати гру разом із результатами.
export async function DELETE(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  const { supabase, user, canManage } = await getEruditeAccess();

  if (!user) return NextResponse.json({ error: 'Потрібно увійти в акаунт' }, { status: 401 });
  if (!canManage) return NextResponse.json({ error: 'Недостатньо прав' }, { status: 403 });

  const { error, count } = await supabase
    .from('erudite_games')
    .delete({ count: 'exact' })
    .eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  if (!count) return NextResponse.json({ error: 'Гру не знайдено' }, { status: 404 });
  return NextResponse.json({ ok: true });
}
