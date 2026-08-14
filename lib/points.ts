import { createClient } from './server';

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

export type StudentRatingRow = {
  student_id: string;
  full_name: string;
  class: string | null;
  categories: CategoryPoints;
  total_points: number;
};

export type ClassRatingRow = {
  class_name: string;
  categories: CategoryPoints;
  total_points: number;
};

// Публічний рейтинг учнів (сума балів), відсортований за спаданням.
export async function getStudentRating(search?: string): Promise<StudentRatingRow[]> {
  const supabase = await createClient();

  let profilesQuery = supabase
    .from('profiles')
    .select('id, full_name, class')
    .not('class', 'is', null);

  if (search) {
    profilesQuery = profilesQuery.ilike('full_name', `%${search}%`);
  }

  const { data: profiles } = await profilesQuery;
  if (!profiles || profiles.length === 0) return [];

  const { data: transactions } = await supabase
    .from('point_transactions_public')
    .select('student_id, category, points')
    .eq('target', 'student');

  const totals = new Map<string, CategoryPoints>();
  for (const t of transactions ?? []) {
    if (!t.student_id) continue;
    const current = totals.get(t.student_id) ?? { ...EMPTY_CATEGORY_POINTS };
    addInto(current, t.category as PointCategory, t.points);
    totals.set(t.student_id, current);
  }

  return profiles
    .map((p) => {
      const categories = totals.get(p.id) ?? { ...EMPTY_CATEGORY_POINTS };
      return {
        student_id: p.id,
        full_name: p.full_name ?? 'Без імені',
        class: p.class,
        categories,
        total_points: sumCategories(categories),
      };
    })
    .sort((a, b) => b.total_points - a.total_points);
}

// Публічний рейтинг класів: сума балів усіх учнів класу
// + окремі нарахування, зроблені класу напряму (напр. Ерудит).
export async function getClassRating(search?: string): Promise<ClassRatingRow[]> {
  const supabase = await createClient();

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, class')
    .not('class', 'is', null);

  const classSet = new Set<string>();
  const studentToClass = new Map<string, string>();
  for (const p of profiles ?? []) {
    if (p.class) {
      classSet.add(p.class);
      studentToClass.set(p.id, p.class);
    }
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

  // 2) Нарахування напряму класу (напр. командні бали Ерудит).
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

  let rows = Array.from(classSet).map((className) => {
    const categories = totals.get(className) ?? { ...EMPTY_CATEGORY_POINTS };
    return {
      class_name: className,
      categories,
      total_points: sumCategories(categories),
    };
  });

  if (search) {
    const q = search.toLowerCase();
    rows = rows.filter((r) => r.class_name.toLowerCase().includes(q));
  }

  return rows.sort((a, b) => b.total_points - a.total_points);
}
