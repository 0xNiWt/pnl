// Книга пам'яті — родичі вчителів та учнів ліцею, учасники Другої світової
// війни. Схема у sql/0010_memory_book.sql.
//
// Файл чистий: без бази й без браузера (його імпортують клієнтські
// компоненти). Запит до бази — у lib/memoryBook.ts.

export type MemoryEntry = {
  id: string;
  name: string;
  relation: string | null;
  biography: string | null;
  photo_url: string | null;
  source_page: number | null;
};

// Оригінальна презентація, з якої зібрано книгу.
export const MEMORY_BOOK_PDF = '/docs/knyha-pamyati-2024.pdf';
export const MEMORY_BOOK_TITLE = 'Дідусі та онуки: спадковість поколінь';

// Для пошуку: усе, що бачить користувач, одним рядком.
export function entryHaystack(entry: MemoryEntry): string {
  return [entry.name, entry.relation, entry.biography]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

export function matchesQuery(entry: MemoryEntry, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return entryHaystack(entry).includes(q);
}
