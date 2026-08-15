import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/server';
import { getCurrentUserWithRoles, canManageUsers } from '@/lib/roles';
import { isOlympiadLevel, isOlympiadPlace } from '@/lib/ratings';

// Шкала олімпіадних балів. У Статуті (п. 10.7.6) вона позначена як
// [ДОРОБИТИ], тому живе в базі й редагується з кабінету.

export async function GET() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('olympiad_scale')
    .select('level, place, points');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ data });
}

// PATCH — змінити одну клітинку шкали: { level, place, points }
export async function PATCH(request: NextRequest) {
  const { supabase, user, roles } = await getCurrentUserWithRoles();

  if (!user) {
    return NextResponse.json({ error: 'Потрібно увійти в акаунт' }, { status: 401 });
  }
  if (!canManageUsers(roles)) {
    return NextResponse.json({ error: 'Недостатньо прав' }, { status: 403 });
  }

  const body = await request.json();
  const { level, place, points } = body as {
    level?: string;
    place?: number;
    points?: number;
  };

  if (!isOlympiadLevel(level)) {
    return NextResponse.json({ error: 'Невідомий етап олімпіади' }, { status: 400 });
  }
  if (!isOlympiadPlace(place)) {
    return NextResponse.json({ error: 'Невідоме місце' }, { status: 400 });
  }
  if (typeof points !== 'number' || !Number.isFinite(points)) {
    return NextResponse.json({ error: 'Бали мають бути числом' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('olympiad_scale')
    .upsert({ level, place, points: Math.round(points) }, { onConflict: 'level,place' })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // Уже записані здобутки не чіпаємо навмисно: інакше торішній рейтинг
  // поїхав би сам собою. Перерахунок — окремою кнопкою в кабінеті.
  return NextResponse.json({ data }, { status: 200 });
}
