// Читання книги пам'яті з бази. Окремо від lib/memory.ts, бо той файл
// імпортують клієнтські компоненти, а тут — серверний Supabase.

import { createClient } from './server';
import type { MemoryEntry } from './memory';

/**
 * Усі записи книги пам'яті в порядку, заданому адміністрацією.
 * Якщо міграції ще немає — порожній список, і сторінка покаже лише
 * саму презентацію.
 */
export async function getMemoryEntries(): Promise<MemoryEntry[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('memory_entries')
    .select('id, name, relation, biography, photo_url, source_page')
    .order('sort_order', { ascending: true });

  if (error || !data) return [];
  return data as MemoryEntry[];
}
