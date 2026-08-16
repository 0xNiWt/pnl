import { cache } from 'react';
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
// Знімок рейтингів
// ---------------------------------------------------------------------
// Раніше рейтинг учнів і рейтинг класів рахувалися окремо, і кожен наново
// тягнув із бази ті самі профілі, нарахування та олімпіади — тобто на
// перемикання «учні ↔ класи» був повний похід у базу.
//
// Тепер обидва рейтинги рахуються з одного знімка: три запити паралельно,
// решта — в пам'яті. cache() з React дедуплікує виклик у межах одного
// рендера, тож сторінка й серверні компоненти діляться результатом.
export type RatingSnapshot = {
  students: StudentRatingRow[];
  classes: ClassRatingRow[];
};

export const getRatingSnapshot = cache(async function getRatingSnapshot(): Promise<RatingSnapshot> {
  const supabase = await createClient();

  const [profilesRes, transactionsRes, olympiadsRes] = await Promise.all([
    supabase.from('profiles').select('id, full_name, class, academic_score').not('class', 'is', null),
    supabase.from('point_transactions_public').select('student_id, class_name, target, category, points'),
    supabase.from('olympiad_results').select('student_id, points'),
  ]);

  const profiles = profilesRes.data ?? [];
  const transactions = transactionsRes.data ?? [];
  const olympiads = olympiadsRes.data ?? [];

  // --- допоміжні мапи по учнях -------------------------------------
  const studentToClass = new Map<string, string>();
  const scoresByClass = new Map<string, (number | null)[]>();
  const sizeByClass = new Map<string, number>();
  const classSet = new Set<string>();

  for (const p of profiles) {
    if (!p.class) continue;
    classSet.add(p.class);
    studentToClass.set(p.id, p.class);

    const scores = scoresByClass.get(p.class) ?? [];
    scores.push(p.academic_score === null ? null : Number(p.academic_score));
    scoresByClass.set(p.class, scores);

    sizeByClass.set(p.class, (sizeByClass.get(p.class) ?? 0) + 1);
  }

  // --- бали активності ----------------------------------------------
  const pointsByStudent = new Map<string, CategoryPoints>();
  const pointsByClass = new Map<string, CategoryPoints>();

  for (const t of transactions) {
    const category = t.category as PointCategory;

    if (t.target === 'student' && t.student_id) {
      const own = pointsByStudent.get(t.student_id) ?? { ...EMPTY_CATEGORY_POINTS };
      addInto(own, category, t.points);
      pointsByStudent.set(t.student_id, own);

      // Бали учня зараховуються і його класу (п. 10.11.4 Статуту).
      const className = studentToClass.get(t.student_id);
      if (className) {
        const forClass = pointsByClass.get(className) ?? { ...EMPTY_CATEGORY_POINTS };
        addInto(forClass, category, t.points);
        pointsByClass.set(className, forClass);
      }
      continue;
    }

    // Старі нарахування напряму класу (вкладку прибрано, але дані лишились).
    if (t.target === 'class' && t.class_name) {
      const forClass = pointsByClass.get(t.class_name) ?? { ...EMPTY_CATEGORY_POINTS };
      addInto(forClass, category, t.points);
      pointsByClass.set(t.class_name, forClass);
      classSet.add(t.class_name);
    }
  }

  // --- олімпіадні здобутки ------------------------------------------
  const olympiadByStudent = new Map<string, number>();
  const olympiadByClass = new Map<string, number>();

  for (const o of olympiads) {
    if (!o.student_id) continue;
    const points = o.points ?? 0;
    olympiadByStudent.set(o.student_id, (olympiadByStudent.get(o.student_id) ?? 0) + points);

    const className = studentToClass.get(o.student_id);
    if (className) {
      olympiadByClass.set(className, (olympiadByClass.get(className) ?? 0) + points);
    }
  }

  // --- учні ----------------------------------------------------------
  // Місця рахуються по ВСІХ учнях ліцею; пошук застосовується вже в браузері,
  // інакше знайдений через пошук учень опинявся б на першому місці.
  const studentBase = profiles.map((p) => {
    const categories = pointsByStudent.get(p.id) ?? { ...EMPTY_CATEGORY_POINTS };
    return {
      student_id: p.id,
      full_name: p.full_name ?? 'Без імені',
      class: p.class as string | null,
      categories,
      total_points: sumCategories(categories),
      academic_score: p.academic_score === null ? null : Number(p.academic_score),
      olympiad_points: olympiadByStudent.get(p.id) ?? 0,
    };
  });

  const studentPlaces = computePlaces(
    studentBase.map((r) => ({
      id: r.student_id,
      total_points: r.total_points,
      academic_score: r.academic_score,
      olympiad_points: r.olympiad_points,
    }))
  );

  const students: StudentRatingRow[] = studentBase
    .map((r) => withPlaces(r, studentPlaces.get(r.student_id)))
    .sort((a, b) => b.total_points - a.total_points);

  // --- класи ----------------------------------------------------------
  const classBase = Array.from(classSet).map((className) => {
    const categories = pointsByClass.get(className) ?? { ...EMPTY_CATEGORY_POINTS };
    return {
      class_name: className,
      students_count: sizeByClass.get(className) ?? 0,
      categories,
      total_points: sumCategories(categories),
      // Середнє арифметичне середніх балів учнів (п. 10.11.2).
      academic_score: averageOf(scoresByClass.get(className) ?? []),
      olympiad_points: olympiadByClass.get(className) ?? 0,
    };
  });

  const classPlaces = computePlaces(
    classBase.map((r) => ({
      id: r.class_name,
      total_points: r.total_points,
      academic_score: r.academic_score,
      olympiad_points: r.olympiad_points,
    }))
  );

  const classes: ClassRatingRow[] = classBase
    .map((r) => withPlaces(r, classPlaces.get(r.class_name)))
    .sort((a, b) => b.total_points - a.total_points);

  return { students, classes };
});

function withPlaces<T>(
  row: T,
  places: (RatingPlaces & { overall_sum: number }) | undefined
): T & { places: RatingPlaces; overall_sum: number } {
  return {
    ...row,
    places: {
      points: places?.points ?? 0,
      academic: places?.academic ?? 0,
      olympiad: places?.olympiad ?? 0,
      overall: places?.overall ?? 0,
    },
    overall_sum: places?.overall_sum ?? 0,
  };
}

// Рядок конкретного учня — для блоку «Мій рейтинг» у кабінеті.
export async function getMyRatingRow(studentId: string): Promise<StudentRatingRow | null> {
  const { students } = await getRatingSnapshot();
  return students.find((s) => s.student_id === studentId) ?? null;
}
