// Роботи МАН. Файл чистий (без бази й браузера) — його імпортують
// і клієнтські компоненти, і сервер. Запит до бази — у lib/manWorksData.ts,
// схема — у sql/0025_man_works.sql.

export type ManWork = {
  id: string;
  title: string;
  author: string;
  author_info: string | null;
  supervisor: string | null;
  section: string | null;
  year: string | null;
  summary: string | null;
  description: string | null;
  photo_url: string | null;
  file_url: string | null;
  sort_order: number;
};

export function workHaystack(work: ManWork): string {
  return [work.title, work.author, work.author_info, work.supervisor, work.section, work.summary, work.description]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

export function matchesQuery(work: ManWork, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return workHaystack(work).includes(q);
}

/** Підпис для кнопки: презентація чи текст роботи. */
export function fileLabel(fileUrl: string | null): string {
  if (!fileUrl) return '';
  return /\.pptx?$/i.test(fileUrl) ? 'Презентація' : 'Текст роботи';
}
