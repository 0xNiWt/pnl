// Читання таблиць перемог із бази. Окремо від lib/olympiads.ts, бо той файл
// імпортують клієнтські компоненти, а тут — серверний Supabase.

import { createClient } from './server';
import type { OlympiadTable } from './olympiads';

/**
 * Усі таблиці з бази, у порядку, заданому адміністрацією.
 * Якщо міграцію ще не застосовано — повертає порожній масив, і блок
 * зі статистикою просто не показується.
 */
export async function getOlympiadTables(): Promise<OlympiadTable[]> {
  const supabase = await createClient();

  const [tablesRes, rowsRes] = await Promise.all([
    supabase
      .from('olympiad_tables')
      .select('id, title, subtitle, note, years, sort_order')
      .order('sort_order', { ascending: true }),
    supabase
      .from('olympiad_rows')
      .select('table_id, subject, total, counts, sort_order')
      .order('sort_order', { ascending: true }),
  ]);

  if (tablesRes.error || !tablesRes.data) return [];

  const rows = rowsRes.data ?? [];

  return tablesRes.data.map((table) => ({
    id: table.id,
    title: table.title,
    subtitle: table.subtitle,
    note: table.note,
    years: (table.years ?? []) as string[],
    rows: rows
      .filter((r) => r.table_id === table.id)
      .map((r) => ({
        subject: r.subject as string,
        total: (r.total ?? null) as number | null,
        counts: (r.counts ?? {}) as Record<string, number>,
      })),
  }));
}
