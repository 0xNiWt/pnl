// Читання списку випускників із бази. Окремо від lib/alumni.ts, бо той
// файл імпортують клієнтські компоненти, а тут — серверний Supabase.

import { createClient } from './server';
import type { Alum } from './alumni';

/**
 * Усі випускники в порядку, заданому адміністрацією. Якщо міграції
 * sql/0027_alumni.sql ще немає — порожній список.
 */
export async function getAlumni(): Promise<Alum[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('alumni')
    .select('id, name, headline, years, bio, photo_url, link_url, sort_order')
    .order('sort_order', { ascending: true });

  if (error || !data) return [];
  return data as Alum[];
}
