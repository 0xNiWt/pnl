import { NextRequest, NextResponse } from 'next/server';
import { getEruditeAccess } from '@/lib/eruditeData';
import { isSeason } from '@/lib/erudite';

// POST — запланувати гру: результатів ще немає, капітани подають заявки.
export async function POST(request: NextRequest) {
  const { supabase, user, canManage } = await getEruditeAccess();

  if (!user) return NextResponse.json({ error: 'Потрібно увійти в акаунт' }, { status: 401 });
  if (!canManage) return NextResponse.json({ error: 'Недостатньо прав' }, { status: 403 });

  const body = (await request.json()) as Record<string, unknown>;
  const title = typeof body.title === 'string' ? body.title.trim() : '';
  const playedOn = typeof body.playedOn === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(body.playedOn) ? body.playedOn : '';

  if (!title) return NextResponse.json({ error: 'Вкажіть назву гри' }, { status: 400 });
  if (!playedOn) return NextResponse.json({ error: 'Вкажіть дату гри' }, { status: 400 });
  if (!isSeason(body.season)) return NextResponse.json({ error: 'Некоректний навчальний рік' }, { status: 400 });

  const { data, error } = await supabase.rpc('plan_erudite_game', {
    p_season: body.season,
    p_title: title,
    p_played_on: playedOn,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ id: data }, { status: 201 });
}
