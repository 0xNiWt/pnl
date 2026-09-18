import { NextRequest, NextResponse } from 'next/server';
import { getEruditeAccess } from '@/lib/eruditeData';
import { TEAM_SIZE } from '@/lib/erudite';

function isId(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0;
}

// POST — капітан подає (або переподає) заявку своєї команди на гру.
// Що це справді капітан цієї команди, перевіряє SQL-функція.
export async function POST(request: NextRequest) {
  const { supabase, user, canView } = await getEruditeAccess();

  if (!user) return NextResponse.json({ error: 'Потрібно увійти в акаунт' }, { status: 401 });
  if (!canView) return NextResponse.json({ error: 'Недостатньо прав' }, { status: 403 });

  const body = (await request.json()) as Record<string, unknown>;
  if (!isId(body.gameId)) {
    return NextResponse.json({ error: 'Не вказано гру' }, { status: 400 });
  }
  // Команда необов'язкова: якщо капітан ще без команди, база створить її
  // для його класу (sql/0022_erudite_captain_rosters.sql).
  const teamId = isId(body.teamId) ? body.teamId : null;

  const players = Array.isArray(body.players)
    ? [...new Set(body.players.filter(isId))]
    : [];

  if (players.length === 0) return NextResponse.json({ error: 'Оберіть гравців' }, { status: 400 });
  if (players.length > TEAM_SIZE) {
    return NextResponse.json({ error: `У заявці може бути не більше ${TEAM_SIZE} гравців` }, { status: 400 });
  }

  const { error } = await supabase.rpc('submit_erudite_roster', {
    p_game_id: body.gameId,
    p_team_id: teamId,
    p_players: players,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}

// PATCH — президент клубу підтверджує або відхиляє заявку.
export async function PATCH(request: NextRequest) {
  const { supabase, user, canManage } = await getEruditeAccess();

  if (!user) return NextResponse.json({ error: 'Потрібно увійти в акаунт' }, { status: 401 });
  if (!canManage) return NextResponse.json({ error: 'Недостатньо прав' }, { status: 403 });

  const body = (await request.json()) as Record<string, unknown>;
  if (!isId(body.gameId) || !isId(body.teamId) || typeof body.approve !== 'boolean') {
    return NextResponse.json({ error: 'Некоректні дані запиту' }, { status: 400 });
  }

  const { error } = await supabase.rpc('review_erudite_roster', {
    p_game_id: body.gameId,
    p_team_id: body.teamId,
    p_approve: body.approve,
    p_note: typeof body.note === 'string' ? body.note : null,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
