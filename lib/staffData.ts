// Читання педагогічного колективу з бази. Окремо від lib/staff.ts, бо тут
// серверний Supabase, а той файл імпортують клієнтські компоненти.

import { createClient } from './server';
import { fallbackDepartments, groupByDepartment, type StaffDepartment, type StaffRow } from './staff';

export async function getStaffRows(): Promise<StaffRow[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('staff_members')
    .select('id, department, dept_order, name, position, photo_url, sort_order')
    .order('dept_order', { ascending: true })
    .order('sort_order', { ascending: true });

  if (error || !data) return [];
  return data as StaffRow[];
}

/**
 * Кафедри для сторінки «Педагоги». Якщо міграцію sql/0024_staff.sql ще не
 * застосовано (або таблиця порожня), показуємо список із коду, щоб сторінка
 * не лишилась без учителів.
 */
export async function getStaffDepartments(): Promise<StaffDepartment[]> {
  const rows = await getStaffRows();
  return rows.length ? groupByDepartment(rows) : fallbackDepartments();
}
