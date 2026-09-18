import { NextRequest, NextResponse } from 'next/server';
import { getEruditeAccess } from '@/lib/eruditeData';
import { isPenaltyReason, isSeason } from '@/lib/erudite';

// POST — президент клубу нараховує команді штрафні бали.
export async function POST(request: NextRequest) {
  const { supabase, user, canManage } = await getEruditeAccess();

  if (!user) return NextResponse.json({ error: 'Потрібно увійти в акаунт' }, { status: 401 });
  if (!canManage) return NextResponse.json({ error: 'Недостатньо прав' }, { status: 403 });

  const body = (await request.json()) as Record<string, unknown>;
  const points = Number(body.points);

  if (!isSeason(body.season)) return NextResponse.json({ error: 'Некоректний навчальний рік' }, { status: 400 });
  if (typeof body.teamId !== 'string' || !body.teamId) {
    return NextResponse.json({ error: 'Оберіть команду' }, { status: 400 });
  }
  if (!Number.isInteger(points) || points < 1 || points > 100) {
    return NextResponse.json({ error: 'Штраф — ціле число від 1 до 100' }, { status: 400 });
  }
  if (!isPenaltyReason(body.reason)) return NextResponse.json({ error: 'Оберіть причину' }, { status: 400 });

  const { error } = await supabase.from('erudite_penalties').insert({
    season: body.season,
    team_id: body.teamId,
    game_id: typeof body.gameId === 'string' && body.gameId ? body.gameId : null,
    points,
    reason: body.reason,
    note: typeof body.note === 'string' && body.note.trim() ? body.note.trim() : null,
    created_by: user.id,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true }, { status: 201 });
}
