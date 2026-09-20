// Педагогічний колектив. Файл чистий (без бази й браузера) — його імпортують
// і клієнтські компоненти, і сервер. Запит до бази — у lib/staffData.ts,
// схема — у sql/0024_staff.sql.

import { STAFF_SEED } from './staffSeed';

export type StaffRow = {
  id: string;
  department: string;
  dept_order: number;
  name: string;
  position: string;
  photo_url: string | null;
  sort_order: number;
};

export type StaffDepartment = {
  title: string;
  members: StaffRow[];
};

/** Рядки з бази → кафедри в потрібному порядку. */
export function groupByDepartment(rows: StaffRow[]): StaffDepartment[] {
  const order = new Map<string, number>();
  const groups = new Map<string, StaffRow[]>();

  for (const row of rows) {
    if (!groups.has(row.department)) {
      groups.set(row.department, []);
      order.set(row.department, row.dept_order);
    }
    // Кафедра йде за найменшим dept_order серед своїх рядків, тож достатньо
    // змінити його в одного вчителя, щоб пересунути всю кафедру.
    order.set(row.department, Math.min(order.get(row.department)!, row.dept_order));
    groups.get(row.department)!.push(row);
  }

  return [...groups.entries()]
    .sort((a, b) => order.get(a[0])! - order.get(b[0])! || a[0].localeCompare(b[0], 'uk'))
    .map(([title, members]) => ({
      title,
      members: members.sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name, 'uk')),
    }));
}

/** Запасний список із коду — поки міграцію не застосовано. */
export function fallbackDepartments(): StaffDepartment[] {
  return STAFF_SEED.map((dept, di) => ({
    title: dept.title,
    members: dept.members.map((m, mi) => ({
      id: `seed-${di}-${mi}`,
      department: dept.title,
      dept_order: (di + 1) * 10,
      name: m.name,
      position: m.position,
      photo_url: m.photo ?? null,
      sort_order: (mi + 1) * 10,
    })),
  }));
}
