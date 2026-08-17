// Таблиці перемог на олімпіадах (сторінка «Про ліцей» + редактор у кабінеті).
// Схема — у sql/0008_olympiad_stats.sql.
//
// Файл чистий: без бази й без браузера, бо його імпортують і клієнтські
// компоненти. Запит до бази живе в lib/olympiadStats.ts.

export const OLYMPIAD_TABLE_IDS = ['international', 'national', 'city', 'man'] as const;
export type OlympiadTableId = (typeof OLYMPIAD_TABLE_IDS)[number];

export type OlympiadRow = {
  subject: string;
  // Якщо задано — показуємо це число замість суми клітинок (частина перемог
  // припадає на роки, за які системних даних немає).
  total: number | null;
  counts: Record<string, number>;
};

export type OlympiadTable = {
  id: string;
  title: string;
  subtitle: string | null;
  note: string | null;
  years: string[];
  rows: OlympiadRow[];
};

export function isOlympiadTableId(value: unknown): value is OlympiadTableId {
  return typeof value === 'string' && (OLYMPIAD_TABLE_IDS as readonly string[]).includes(value);
}

// Скільки перемог у рядку: збережене число або сума по роках.
export function rowTotal(row: OlympiadRow): number {
  if (typeof row.total === 'number') return row.total;
  return Object.values(row.counts).reduce((sum, n) => sum + (n || 0), 0);
}

// Разом по всій таблиці — сума рядків.
export function tableTotal(rows: OlympiadRow[]): number {
  return rows.reduce((sum, row) => sum + rowTotal(row), 0);
}

// Частка предмета в загальній кількості перемог.
export function rowShare(row: OlympiadRow, total: number): number {
  if (total <= 0) return 0;
  return (rowTotal(row) / total) * 100;
}

// Підсумок по конкретному року (нижній рядок таблиці).
export function yearTotal(rows: OlympiadRow[], year: string): number {
  return rows.reduce((sum, row) => sum + (row.counts[year] || 0), 0);
}

export function formatShare(share: number): string {
  return `${share.toFixed(1).replace('.', ',')}%`;
}
