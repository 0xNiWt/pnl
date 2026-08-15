import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/server';
import { getCurrentUserWithRoles, canManagePoints } from '@/lib/roles';
import {
  distributeByCoefficients,
  isCoefficientLevel,
  type CoefficientParticipant,
} from '@/lib/coefficients';

const CATEGORIES = ['sport', 'creative', 'organizational', 'intellectual', 'volunteer'];

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
      .select(
        'id, category, points, explanation, situation_id, coefficient, event_title, event_budget, created_at, created_by'
      )
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

// Рядок, який реально лягає в таблицю point_transactions.
type PointTransactionInsert = {
  target: 'student';
  student_id: string;
  class_name: null;
  category: string;
  points: number;
  explanation: string;
  situation_id: string | null;
  coefficient: number | null;
  event_title: string | null;
  event_budget: number | null;
  created_by: string;
  created_at: string;
};

// POST — нарахувати бали (тільки editor/owner).
//
// Два режими:
//   target: 'student' — однакова кількість балів одному або кільком учням;
//   target: 'event'   — бюджет заходу ділиться між учасниками
//                       за коефіцієнтами залученості (п. 12.2.3 Статуту).
//
// В обох випадках у базу лягають звичайні нарахування учням (target = 'student'),
// тому рейтинг рахується без жодних змін.
export async function POST(request: NextRequest) {
  const { supabase, user, roles } = await getCurrentUserWithRoles();

  if (!user) {
    return NextResponse.json({ error: 'Потрібна автентифікація' }, { status: 401 });
  }
  if (!canManagePoints(roles)) {
    return NextResponse.json({ error: 'Недостатньо прав' }, { status: 403 });
  }

  const body = await request.json();
  const target = body?.target;
  const category = body?.category;
  const explanation = typeof body?.explanation === 'string' ? body.explanation.trim() : '';
  const situationId = body?.situationId ?? null;
  const createdAt = new Date().toISOString();

  if (target !== 'student' && target !== 'event') {
    return NextResponse.json({ error: 'Невідомий тип нарахування' }, { status: 400 });
  }
  if (!CATEGORIES.includes(category)) {
    return NextResponse.json({ error: 'Невідома категорія балів' }, { status: 400 });
  }
  if (!explanation) {
    return NextResponse.json({ error: 'Додай пояснення' }, { status: 400 });
  }

  let rows: PointTransactionInsert[];

  // ---------------------------------------------------------------
  // Режим 1: однакові бали одному або кільком учням
  // ---------------------------------------------------------------
  if (target === 'student') {
    const { studentId, studentIds, points } = body as {
      studentId?: string;
      studentIds?: string[];
      points: number;
    };

    if (typeof points !== 'number' || !Number.isFinite(points)) {
      return NextResponse.json({ error: 'Некоректна кількість балів' }, { status: 400 });
    }

    const ids = Array.from(
      new Set(
        studentIds && studentIds.length > 0 ? studentIds : studentId ? [studentId] : []
      )
    );

    if (ids.length === 0) {
      return NextResponse.json({ error: 'Не вказано жодного учня' }, { status: 400 });
    }

    rows = ids.map((id) => ({
      target: 'student' as const,
      student_id: id,
      class_name: null,
      category,
      points: Math.round(points),
      explanation,
      situation_id: situationId,
      coefficient: null,
      event_title: null,
      event_budget: null,
      created_by: user.id,
      created_at: createdAt,
    }));
  }

  // ---------------------------------------------------------------
  // Режим 2: бюджет заходу за коефіцієнтами залученості
  // ---------------------------------------------------------------
  else {
    const eventTitle = typeof body?.eventTitle === 'string' ? body.eventTitle.trim() : '';
    const eventBudget = body?.eventBudget;
    const participants = body?.participants;

    if (!eventTitle) {
      return NextResponse.json({ error: 'Вкажи назву заходу' }, { status: 400 });
    }
    if (typeof eventBudget !== 'number' || !Number.isFinite(eventBudget) || eventBudget === 0) {
      return NextResponse.json({ error: 'Вкажи бюджет заходу в балах' }, { status: 400 });
    }
    if (!Array.isArray(participants) || participants.length === 0) {
      return NextResponse.json({ error: 'Додай хоча б одного учасника' }, { status: 400 });
    }

    const clean: CoefficientParticipant[] = [];
    const seen = new Set<string>();

    for (const p of participants) {
      const studentId = p?.studentId;
      const coefficient = p?.coefficient;

      if (typeof studentId !== 'string' || !studentId) {
        return NextResponse.json({ error: 'Некоректний список учасників' }, { status: 400 });
      }
      if (!isCoefficientLevel(coefficient)) {
        return NextResponse.json(
          { error: 'Коефіцієнт має бути 1, 2 або 3 (п. 12.2.3.3 Статуту)' },
          { status: 400 }
        );
      }
      if (seen.has(studentId)) {
        return NextResponse.json({ error: 'Один учень доданий двічі' }, { status: 400 });
      }

      seen.add(studentId);
      clean.push({ studentId, coefficient });
    }

    // Рахуємо саме тут, на сервері: те, що прислав браузер,
    // ми як джерело правди не використовуємо.
    const { shares } = distributeByCoefficients(eventBudget, clean);
    const budget = Math.round(eventBudget);

    rows = shares.map((s) => ({
      target: 'student' as const,
      student_id: s.studentId,
      class_name: null,
      category,
      points: s.points,
      explanation: `${eventTitle} — ${explanation} (К = ${s.coefficient}, бюджет заходу ${budget} балів)`,
      situation_id: situationId,
      coefficient: s.coefficient,
      event_title: eventTitle,
      event_budget: budget,
      created_by: user.id,
      created_at: createdAt,
    }));
  }

  const { data, error } = await supabase.from('point_transactions').insert(rows).select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ data }, { status: 201 });
}
