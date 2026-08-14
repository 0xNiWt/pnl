import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/server';
import { getCurrentUserWithRoles, canManagePoints } from '@/lib/roles';

// GET — список ситуацій (кнопок) для кабінету editor-а,
// або історія нарахувань з поясненням: /api/v1/points?history=student&id=...
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const history = searchParams.get('history');

  if (history === 'student' || history === 'class') {
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Не вказано id' }, { status: 400 });
    }

    let query = supabase
      .from('point_transactions')
      .select('id, category, points, explanation, situation_id, created_at, created_by')
      .order('created_at', { ascending: false });

    query =
      history === 'student'
        ? query.eq('target', 'student').eq('student_id', id)
        : query.eq('target', 'class').eq('class_name', id);

    const { data, error } = await query;
    // RLS сам відфільтрує те, що користувачу не можна бачити —
    // якщо доступу нема взагалі, Supabase поверне порожній список, не помилку.
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ data });
  }

  const { data, error } = await supabase
    .from('point_situations')
    .select('*')
    .eq('active', true)
    .order('sort_order', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ data });
}

// POST — нарахувати бали (тільки editor/owner)
// Приймає або одного учня (studentId), або список (studentIds) —
// для групового нарахування однакових балів кільком учням одразу.
export async function POST(request: NextRequest) {
  const { supabase, user, roles } = await getCurrentUserWithRoles();

  if (!user) {
    return NextResponse.json({ error: 'Потрібна автентифікація' }, { status: 401 });
  }
  if (!canManagePoints(roles)) {
    return NextResponse.json({ error: 'Недостатньо прав' }, { status: 403 });
  }

  const body = await request.json();
  const {
    target,
    studentId,
    studentIds,
    className,
    category,
    points,
    explanation,
    situationId,
  } = body as {
    target: 'student' | 'class';
    studentId?: string;
    studentIds?: string[];
    className?: string;
    category: string;
    points: number;
    explanation: string;
    situationId?: string | null;
  };

  if (!target || !category || typeof points !== 'number' || !explanation?.trim()) {
    return NextResponse.json({ error: "Заповнені не всі обов'язкові поля" }, { status: 400 });
  }

  const ids =
    target === 'student'
      ? (studentIds && studentIds.length > 0 ? studentIds : studentId ? [studentId] : [])
      : [];

  if (target === 'student' && ids.length === 0) {
    return NextResponse.json({ error: 'Не вказано жодного учня' }, { status: 400 });
  }
  if (target === 'class' && !className) {
    return NextResponse.json({ error: 'Не вказано клас' }, { status: 400 });
  }

  const createdAt = new Date().toISOString();

  const rows =
    target === 'student'
      ? ids.map((id) => ({
          target: 'student' as const,
          student_id: id,
          class_name: null,
          category,
          points,
          explanation: explanation.trim(),
          situation_id: situationId ?? null,
          created_by: user.id,
          created_at: createdAt,
        }))
      : [
          {
            target: 'class' as const,
            student_id: null,
            class_name: className,
            category,
            points,
            explanation: explanation.trim(),
            situation_id: situationId ?? null,
            created_by: user.id,
            created_at: createdAt,
          },
        ];

  const { data, error } = await supabase.from('point_transactions').insert(rows).select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ data }, { status: 201 });
}