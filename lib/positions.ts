// Довідник посад учнівського самоврядування — п. 1.2 Статуту.
//
// Важливо: посади НЕ дають жодних прав у системі. Це суто інформаційна
// позначка «хто чим займається в активі». Права роздаються ролями
// (student / teacher / editor / moderator / owner) і живуть окремо,
// у lib/roles.ts та lib/rolesClient.ts.
//
// Файл чистий: без імпортів сервера, тож підходить і клієнту, і API-роуту.

export type PositionScope = 'lyceum' | 'class-main' | 'class-secondary';

export type Position = {
  // Ключ, який лягає в базу. Латиницею, щоб не залежати від розкладки.
  id: string;
  label: string;
  scope: PositionScope;
};

export const POSITION_SCOPES: { id: PositionScope; label: string; hint: string }[] = [
  {
    id: 'lyceum',
    label: 'Ліцейський актив',
    hint: 'Орган учнівського самоврядування ліцею',
  },
  {
    id: 'class-main',
    label: 'Головний актив класу',
    hint: 'Ключові посадові особи класу',
  },
  {
    id: 'class-secondary',
    label: 'Другорядний актив класу',
    hint: 'Допоміжні посадові особи класу',
  },
];

export const POSITIONS: Position[] = [
  // Ліцейський актив
  { id: 'prsl', label: 'ПРСЛ (президент РСЛ)', scope: 'lyceum' },
  { id: 'prsl-deputy', label: 'Заступник ПРСЛ', scope: 'lyceum' },
  { id: 'ex-president', label: 'Експрезидент', scope: 'lyceum' },
  { id: 'head-starostat', label: 'Голова старостату', scope: 'lyceum' },
  { id: 'head-presscenter', label: 'Голова пресцентру', scope: 'lyceum' },
  { id: 'head-fizorg', label: 'Голова фізоргів', scope: 'lyceum' },
  { id: 'erudite-president', label: 'Президент клубу «Ерудит»', scope: 'lyceum' },
  { id: 'instagram', label: 'Відповідальний за Instagram', scope: 'lyceum' },
  { id: 'wikipedia', label: 'Відповідальний за Вікіпедію', scope: 'lyceum' },
  { id: 'website', label: 'Відповідальний за сайт ліцею', scope: 'lyceum' },

  // Головний актив класу
  { id: 'starosta', label: 'Староста', scope: 'class-main' },
  { id: 'rsl-rep', label: 'Представник РСЛ', scope: 'class-main' },
  { id: 'redactor', label: 'Редактор', scope: 'class-main' },
  { id: 'kultorg', label: 'Культорг', scope: 'class-main' },
  { id: 'fizorg', label: 'Фізорг', scope: 'class-main' },

  // Другорядний актив класу
  { id: 'photographer', label: 'Фотограф', scope: 'class-secondary' },
  { id: 'erudite-captain', label: 'Капітан команди «Ерудит»', scope: 'class-secondary' },
  { id: 'starosta-deputy', label: 'Заступник старости', scope: 'class-secondary' },
  { id: 'rsl-rep-deputy', label: 'Заступник представника РСЛ', scope: 'class-secondary' },
  { id: 'redactor-deputy', label: 'Заступник редактора', scope: 'class-secondary' },
  { id: 'fizorg-deputy', label: 'Заступник фізорга', scope: 'class-secondary' },
  { id: 'volunteer', label: 'Волонтер', scope: 'class-secondary' },
];

const POSITION_MAP = new Map(POSITIONS.map((p) => [p.id, p]));

export function isPositionId(value: unknown): value is string {
  return typeof value === 'string' && POSITION_MAP.has(value);
}

export function positionLabel(id: string): string {
  return POSITION_MAP.get(id)?.label ?? id;
}

export function positionScope(id: string): PositionScope | null {
  return POSITION_MAP.get(id)?.scope ?? null;
}

export function positionsByScope(scope: PositionScope): Position[] {
  return POSITIONS.filter((p) => p.scope === scope);
}

// Посади ліцейського активу — одні на весь ліцей, класні — одні на клас.
export function isLyceumPosition(id: string): boolean {
  return positionScope(id) === 'lyceum';
}

/**
 * Пошук посад за текстом: «старост» знайде і «Староста», і «Заступник старости».
 * Потрібно, щоб у списку учнів можна було шукати не лише за іменем.
 * Повертає id посад, назви яких підходять під запит.
 */
export function positionIdsMatching(query: string): string[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  return POSITIONS.filter(
    (p) => p.label.toLowerCase().includes(q) || p.id.toLowerCase().includes(q)
  ).map((p) => p.id);
}

/**
 * Паралель — це число з назви класу: «10-А» → «10», «11-Б» → «11».
 * Якщо число не знайшлося, повертаємо null (наприклад, для педагогів).
 */
export function parallelOf(className: string | null | undefined): string | null {
  if (!className) return null;
  const match = className.match(/\d+/);
  return match ? match[0] : null;
}

/**
 * Сортування класів по-людськи: спершу за паралеллю як за числом,
 * потім за буквою. Інакше «10-А» опиниться перед «9-А».
 */
export function compareClasses(a: string, b: string): number {
  const pa = Number(parallelOf(a) ?? 0);
  const pb = Number(parallelOf(b) ?? 0);
  return pa - pb || a.localeCompare(b, 'uk');
}
