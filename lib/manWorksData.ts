// Читання робіт МАН із бази. Окремо від lib/manWorks.ts, бо той файл
// імпортують клієнтські компоненти, а тут — серверний Supabase.

import { createClient } from './server';
import type { ManWork } from './manWorks';

/**
 * Усі роботи в порядку, заданому адміністрацією. Якщо міграції
 * sql/0025_man_works.sql ще немає — порожній список, і сторінка просто
 * запропонує додати першу роботу.
 */
export async function getManWorks(): Promise<ManWork[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('man_works')
    .select('id, title, author, author_info, supervisor, section, year, summary, description, photo_url, file_url, sort_order')
    .order('sort_order', { ascending: true });

  if (error || !data) return [];
  return data as ManWork[];
}
