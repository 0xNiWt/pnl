import { createClient } from './server';
import { averageOf, combinePlaces, rankByValue } from './ratings';

export type PointCategory =
  | 'sport'
  | 'creative'
  | 'organizational'
  | 'intellectual'
  | 'volunteer';

export const CATEGORY_LABELS: Record<PointCategory, string> = {
  sport: 'Спортивна',
  creative: 'Творча',
  organizational: 'Організаційна',
  intellectual: 'Інтелектуальна',
  volunteer: 'Волонтерська',
};

export type PointTarget = 'student' | 'class';

export type PointSituation = {
  id: string;
  title: string;
  category: PointCategory;
  target: PointTarget;
  points: number | null;
  explanation_template: string;
  statute_ref: string | null;
  active: boolean;
  sort_order: number;
};

// Розбивка балів по кожній з 5 категорій.
export type CategoryPoints = Record<PointCategory, number>;

const EMPTY_CATEGORY_POINTS: CategoryPoints = {
  sport: 0,
  creative: 0,
  organizational: 0,
  intellectual: 0,
  volunteer: 0,
};

function sumCategories(c: CategoryPoints): number {
  return c.sport + c.creative + c.organizational + c.intellectual + c.volunteer;
}

function addInto(target: CategoryPoints, cat: PointCategory, points: number) {
  target[cat] = (target[cat] ?? 0) + points;
}

// Місця за чотирма рейтингами (пп. 10.7 та 10.11 Статуту).
export type RatingPlaces = {
  points: number;
  academic: number;
  olympiad: number;
  overall: number;
};

export type StudentRatingRow = {
  student_id: string;
  full_name: string;
  class: string | null;
  categories: CategoryPoints;
  total_points: number;
  academic_score: number | null;
  olympiad_points: number;
  places: RatingPlaces;
  overall_sum: number;
};

export type ClassRatingRow = {
  class_name: string;
  students_count: number;
  categories: CategoryPoints;
  total_points: number;
  academic_score: number | null;
  olympiad_points: number;
  places: RatingPlaces;
  overall_sum: number;
};

// ---------------------------------------------------------------------
// Спільна частина: рахуємо місця за трьома базовими рейтингами
// й складаємо з них загальний.
// ---------------------------------------------------------------------
type Rankable = {
  id: string;
  total_points: number;
  academic_score: number | null;
  olympiad_points: number;
};

function computePlaces(rows: Rankable[]): Map<string, RatingPlaces & { overall_sum: number }> {
  const pointsPlaces = rankByValue(rows.map((r) => ({ id: r.id, value: r.total_points })));
  const academicPlaces = rankByValue(rows.map((r) => ({ id: r.id, value: r.academic_score })));
  const olympiadPlaces = rankByValue(rows.map((r) => ({ id: r.id, value: r.olympiad_points })));

  const overall = combinePlaces(
    rows.map((r) => ({
      id: r.id,
      points: pointsPlaces.get(r.id) ?? rows.length,
      academic: academicPlaces.get(r.id) ?? rows.length,
      olympiad: olympiadPlaces.get(r.id) ?? rows.length,
    }))
  );

  const result = new Map<string, RatingPlaces & { overall_sum: number }>();

  for (const r of rows) {
    const combined = overall.get(r.id);
    result.set(r.id, {
      points: pointsPlaces.get(r.id) ?? rows.length,
      academic: academicPlaces.get(r.id) ?? rows.length,
      olympiad: olympiadPlaces.get(r.id) ?? rows.length,
      overall: combined?.place ?? rows.length,
      overall_sum: combined?.sum ?? 0,
    });
  }

  return result;
}

// ---------------------------------------------------------------------
// Рейтинг учнів
// ---------------------------------------------------------------------
// Важливо: місця рахуються по ВСІХ учнях ліцею, і лише потім застосовується
// пошук. Інакше «Іваненко» в результатах пошуку опинявся б на 1 місці.
export async function getStudentRating(search?: string): Promise<StudentRatingRow[]> {
  const supabase = await createClient();

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name, class, academic_score')
    .not('class', 'is', null);

  if (!profiles || profiles.length === 0) return [];

  const { data: transactions } = await supabase
    .from('point_transactions_public')
    .select('student_id, category, points')
    .eq('target', 'student');

  const { data: olympiads } = await supabase
    .from('olympiad_results')
    .select('student_id, points');

  const totals = new Map<string, CategoryPoints>();
  for (const t of transactions ?? []) {
    if (!t.student_id) continue;
    const current = totals.get(t.student_id) ?? { ...EMPTY_CATEGORY_POINTS };
    addInto(current, t.category as PointCategory, t.points);
    totals.set(t.student_id, current);
  }

  const olympiadTotals = new Map<string, number>();
  for (const o of olympiads ?? []) {
    if (!o.student_id) continue;
    olympiadTotals.set(o.student_id, (olympiadTotals.get(o.student_id) ?? 0) + (o.points ?? 0));
  }

  const rows = profiles.map((p) => {
    const categories = totals.get(p.id) ?? { ...EMPTY_CATEGORY_POINTS };
    return {
      student_id: p.id,
      full_name: p.full_name ?? 'Без імені',
      class: p.class,
      categories,
      total_points: sumCategories(categories),
      academic_score: p.academic_score === null ? null : Number(p.academic_score),
      olympiad_points: olympiadTotals.get(p.id) ?? 0,
    };
  });

  const places = computePlaces(
    rows.map((r) => ({
      id: r.student_id,
      total_points: r.total_points,
      academic_score: r.academic_score,
      olympiad_points: r.olympiad_points,
    }))
  );

  let result: StudentRatingRow[] = rows.map((r) => {
    const p = places.get(r.student_id);
    return {
      ...r,
      places: {
        points: p?.points ?? 0,
        academic: p?.academic ?? 0,
        olympiad: p?.olympiad ?? 0,
        overall: p?.overall ?? 0,
      },
      overall_sum: p?.overall_sum ?? 0,
    };
  });

  if (search) {
    const q = search.toLowerCase();
    result = result.filter((r) => r.full_name.toLowerCase().includes(q));
  }

  return result.sort((a, b) => b.total_points - a.total_points);
}

// ---------------------------------------------------------------------
// Рейтинг класів
// ---------------------------------------------------------------------
// Баловий — сума балів учнів класу + нарахування, зроблені класу напряму.
// Навчальний — середнє арифметичне середніх балів учнів (п. 10.11.2).
// Олімпіадний — сума здобутків усіх учнів класу (п. 10.11.3).
export async function getClassRating(search?: string): Promise<ClassRatingRow[]> {
  const supabase = await createClient();

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, class, academic_score')
    .not('class', 'is', null);

  const classSet = new Set<string>();
  const studentToClass = new Map<string, string>();
  const scoresByClass = new Map<string, (number | null)[]>();
  const sizeByClass = new Map<string, number>();

  for (const p of profiles ?? []) {
    if (!p.class) continue;
    classSet.add(p.class);
    studentToClass.set(p.id, p.class);

    const scores = scoresByClass.get(p.class) ?? [];
    scores.push(p.academic_score === null ? null : Number(p.academic_score));
    scoresByClass.set(p.class, scores);

    sizeByClass.set(p.class, (sizeByClass.get(p.class) ?? 0) + 1);
  }

  const totals = new Map<string, CategoryPoints>();

  // 1) Нарахування безпосередньо учням — зараховуємо в рейтинг їхнього класу.
  const { data: studentTransactions } = await supabase
    .from('point_transactions_public')
    .select('student_id, category, points')
    .eq('target', 'student');

  for (const t of studentTransactions ?? []) {
    if (!t.student_id) continue;
    const className = studentToClass.get(t.student_id);
    if (!className) continue;
    const current = totals.get(className) ?? { ...EMPTY_CATEGORY_POINTS };
    addInto(current, t.category as PointCategory, t.points);
    totals.set(className, current);
  }

  // 2) Старі нарахування напряму класу (вкладку прибрано, але дані лишились).
  const { data: classTransactions } = await supabase
    .from('point_transactions_public')
    .select('class_name, category, points')
    .eq('target', 'class');

  for (const t of classTransactions ?? []) {
    if (!t.class_name) continue;
    const current = totals.get(t.class_name) ?? { ...EMPTY_CATEGORY_POINTS };
    addInto(current, t.category as PointCategory, t.points);
    totals.set(t.class_name, current);
    classSet.add(t.class_name);
  }

  // 3) Олімпіадні здобутки учнів класу.
  const { data: olympiads } = await supabase
    .from('olympiad_results')
    .select('student_id, points');

  const olympiadByClass = new Map<string, number>();
  for (const o of olympiads ?? []) {
    if (!o.student_id) continue;
    const className = studentToClass.get(o.student_id);
    if (!className) continue;
    olympiadByClass.set(className, (olympiadByClass.get(className) ?? 0) + (o.points ?? 0));
  }

  const rows = Array.from(classSet).map((className) => {
    const categories = totals.get(className) ?? { ...EMPTY_CATEGORY_POINTS };
    return {
      class_name: className,
      students_count: sizeByClass.get(className) ?? 0,
      categories,
      total_points: sumCategories(categories),
      academic_score: averageOf(scoresByClass.get(className) ?? []),
      olympiad_points: olympiadByClass.get(className) ?? 0,
    };
  });

  const places = computePlaces(
    rows.map((r) => ({
      id: r.class_name,
      total_points: r.total_points,
      academic_score: r.academic_score,
      olympiad_points: r.olympiad_points,
    }))
  );

  let result: ClassRatingRow[] = rows.map((r) => {
    const p = places.get(r.class_name);
    return {
      ...r,
      places: {
        points: p?.points ?? 0,
        academic: p?.academic ?? 0,
        olympiad: p?.olympiad ?? 0,
        overall: p?.overall ?? 0,
      },
      overall_sum: p?.overall_sum ?? 0,
    };
  });

  if (search) {
    const q = search.toLowerCase();
    result = result.filter((r) => r.class_name.toLowerCase().includes(q));
  }

  return result.sort((a, b) => b.total_points - a.total_points);
}
