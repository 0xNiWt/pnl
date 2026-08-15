import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/server';
import { getCurrentUserWithRoles, canManageUsers } from '@/lib/roles';
import { isOlympiadLevel, isOlympiadPlace } from '@/lib/ratings';

// GET — здобутки. Без параметрів віддає всі, з ?studentId= — одного учня.
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const studentId = new URL(request.url).searchParams.get('studentId');

  let query = supabase
    .from('olympiad_results')
    .select('id, student_id, subject, level, place, points, created_at')
    .order('created_at', { ascending: false });

  if (studentId) query = query.eq('student_id', studentId);

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ data });
}

// POST — додати здобуток. Бали беремо зі шкали, якщо їх не передали вручну.
export async function POST(request: NextRequest) {
  const { supabase, user, roles } = await getCurrentUserWithRoles();

  if (!user) {
    return NextResponse.json({ error: 'Потрібно увійти в акаунт' }, { status: 401 });
  }
  if (!canManageUsers(roles)) {
    return NextResponse.json({ error: 'Недостатньо прав' }, { status: 403 });
  }

  const body = await request.json();
  const { studentId, subject, level, place, points } = body as {
    studentId?: string;
    subject?: string;
    level?: string;
    place?: number;
    points?: number;
  };

  if (!studentId || typeof studentId !== 'string') {
    return NextResponse.json({ error: 'Не вказано учня' }, { status: 400 });
  }
  if (!subject?.trim()) {
    return NextResponse.json({ error: 'Вкажи предмет або тему' }, { status: 400 });
  }
  if (!isOlympiadLevel(level)) {
    return NextResponse.json({ error: 'Невідомий етап олімпіади' }, { status: 400 });
  }
  if (!isOlympiadPlace(place)) {
    return NextResponse.json({ error: 'Місце має бути 1, 2, 3 або «участь»' }, { status: 400 });
  }

  let finalPoints: number;

  if (typeof points === 'number' && Number.isFinite(points)) {
    finalPoints = Math.round(points);
  } else {
    const { data: scaleRow } = await supabase
      .from('olympiad_scale')
      .select('points')
      .eq('level', level)
      .eq('place', place)
      .maybeSingle();

    finalPoints = scaleRow?.points ?? 0;
  }

  const { data, error } = await supabase
    .from('olympiad_results')
    .insert({
      student_id: studentId,
      subject: subject.trim(),
      level,
      place,
      points: finalPoints,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ data }, { status: 201 });
}

// DELETE — прибрати здобуток: /api/v1/rating/olympiads?id=...
export async function DELETE(request: NextRequest) {
  const { supabase, user, roles } = await getCurrentUserWithRoles();

  if (!user) {
    return NextResponse.json({ error: 'Потрібно увійти в акаунт' }, { status: 401 });
  }
  if (!canManageUsers(roles)) {
    return NextResponse.json({ error: 'Недостатньо прав' }, { status: 403 });
  }

  const id = new URL(request.url).searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'Не вказано id' }, { status: 400 });
  }

  const { error } = await supabase.from('olympiad_results').delete().eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
