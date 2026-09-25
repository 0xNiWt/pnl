// Випускники ліцею. Файл чистий (без бази й браузера) — його імпортують
// і клієнтські компоненти, і сервер. Запит до бази — у lib/alumniData.ts,
// схема — у sql/0027_alumni.sql.

export type Alum = {
  id: string;
  name: string;
  headline: string | null;
  years: string | null;
  bio: string | null;
  photo_url: string | null;
  link_url: string | null;
  sort_order: number;
};

export function matchesQuery(alum: Alum, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [alum.name, alum.headline, alum.years, alum.bio]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
    .includes(q);
}

/** Ініціали для картки без фото. */
export function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase();
}
