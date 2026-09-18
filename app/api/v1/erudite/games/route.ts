import { NextRequest, NextResponse } from 'next/server';
import { getEruditeAccess } from '@/lib/eruditeData';
import { parseGamePayload } from '../gamePayload';

// POST — додати гру разом із результатами всіх команд.
// Права перевіряються тут і ще раз у SQL-функції save_erudite_game.
export async function POST(request: NextRequest) {
  const { supabase, user, canManage } = await getEruditeAccess();

  if (!user) return NextResponse.json({ error: 'Потрібно увійти в акаунт' }, { status: 401 });
  if (!canManage) return NextResponse.json({ error: 'Недостатньо прав' }, { status: 403 });

  const parsed = parseGamePayload(await request.json());
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

  const { season, title, playedOn, results } = parsed.value;
  const { data, error } = await supabase.rpc('save_erudite_game', {
    p_game_id: null,
    p_season: season,
    p_title: title,
    p_played_on: playedOn,
    p_results: results,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ id: data }, { status: 201 });
}
