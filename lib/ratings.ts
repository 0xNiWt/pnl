// Система рейтингів — пп. 10.7 (учні) та 10.11 (класи) Статуту.
//
// Рейтингів чотири:
//   1) навчальний   — за середнім балом;
//   2) олімпіадний  — за сумою олімпіадних здобутків;
//   3) баловий      — за сумою балів активності (5 категорій);
//   4) загальний    — сума місць за трьома попередніми, найменша сума виграє.
//
// Файл чистий: без бази й без браузера, тож його можна імпортувати будь-де.

export type RatingKind = 'points' | 'academic' | 'olympiad' | 'overall';

export const RATING_LABELS: Record<RatingKind, string> = {
  points: 'Бали активності',
  academic: 'Навчальний',
  olympiad: 'Олімпіадний',
  overall: 'Загальний',
};

// Етапи олімпіад та МАН. Шкала балів за п. 10.7.6 Статуту ще не затверджена
// («ДОРОБИТИ»), тому значення живуть у базі й редагуються без зміни коду.
export const OLYMPIAD_LEVELS: { id: string; label: string; short: string }[] = [
  { id: 'school', label: 'Шкільний етап', short: 'Шкільний' },
  { id: 'city', label: 'Міський етап', short: 'Місто' },
  { id: 'region', label: 'Обласний етап', short: 'Область' },
  { id: 'national', label: 'Всеукраїнський етап', short: 'Україна' },
  { id: 'international', label: 'Міжнародний рівень', short: 'Міжнар.' },
  { id: 'man', label: 'МАН (конкурс-захист)', short: 'МАН' },
];

export const OLYMPIAD_PLACES: { value: number; label: string }[] = [
  { value: 1, label: 'I місце' },
  { value: 2, label: 'II місце' },
  { value: 3, label: 'III місце' },
  { value: 0, label: 'Участь' },
];

export function olympiadLevelLabel(id: string): string {
  return OLYMPIAD_LEVELS.find((l) => l.id === id)?.label ?? id;
}

export function olympiadPlaceLabel(place: number): string {
  return OLYMPIAD_PLACES.find((p) => p.value === place)?.label ?? `${place} місце`;
}

export function isOlympiadLevel(value: unknown): value is string {
  return typeof value === 'string' && OLYMPIAD_LEVELS.some((l) => l.id === value);
}

export function isOlympiadPlace(value: unknown): value is number {
  return typeof value === 'number' && OLYMPIAD_PLACES.some((p) => p.value === value);
}

// ---------------------------------------------------------------------
// Ранжування
// ---------------------------------------------------------------------

export type RankInput = { id: string; value: number | null };

/**
 * Класичне змагальне ранжування за спаданням значення: 1, 2, 2, 4.
 * Однакове значення — однакове місце, наступне місце «перестрибує».
 * null означає «даних немає» — такі опиняються в кінці й ділять останнє місце.
 */
export function rankByValue(rows: RankInput[]): Map<string, number> {
  const sorted = [...rows].sort((a, b) => {
    const av = a.value ?? Number.NEGATIVE_INFINITY;
    const bv = b.value ?? Number.NEGATIVE_INFINITY;
    return bv - av || a.id.localeCompare(b.id);
  });

  const places = new Map<string, number>();
  let lastValue: number | null | undefined;
  let lastPlace = 0;

  sorted.forEach((row, index) => {
    const value = row.value ?? Number.NEGATIVE_INFINITY;
    const previous = lastValue ?? Number.NEGATIVE_INFINITY;

    // Те саме значення, що й у попереднього — те саме місце.
    const place = index > 0 && value === previous ? lastPlace : index + 1;

    places.set(row.id, place);
    lastValue = value;
    lastPlace = place;
  });

  return places;
}

// ---------------------------------------------------------------------
// Загальний рейтинг
// ---------------------------------------------------------------------

export type CombineInput = {
  id: string;
  // Місця за трьома базовими рейтингами: навчальний, олімпіадний, баловий.
  academic: number;
  olympiad: number;
  points: number;
};

export type CombineResult = {
  sum: number;
  place: number;
};

/**
 * Загальний рейтинг = сума трьох місць, найменша сума — найвище місце
 * (пп. 10.7.4 та 10.11.5 Статуту).
 *
 * Нічия (пп. 10.7.5 і 10.11.6):
 *   1) за однакової суми вище стоїть той, у кого краще (менше) місце
 *      за будь-яким окремим критерієм;
 *   2) якщо всі три місця збігаються повністю — «ідеальна нічия»,
 *      обом присуджується однакове місце.
 *
 * Статут не описує випадок, коли суми й найкращі місця однакові, а набори
 * місць різні (напр. 1-5-9 проти 1-9-5). Тоді порівнюємо друге й третє
 * за якістю місця — це детерміновано й не залежить від порядку в базі.
 */
export function combinePlaces(rows: CombineInput[]): Map<string, CombineResult> {
  const enriched = rows.map((r) => ({
    ...r,
    sum: r.academic + r.olympiad + r.points,
    // Місця, відсортовані від найкращого до найгіршого — для розв'язання нічиєї.
    sortedPlaces: [r.academic, r.olympiad, r.points].sort((a, b) => a - b),
  }));

  const sorted = [...enriched].sort((a, b) => {
    if (a.sum !== b.sum) return a.sum - b.sum;
    for (let i = 0; i < 3; i++) {
      if (a.sortedPlaces[i] !== b.sortedPlaces[i]) {
        return a.sortedPlaces[i] - b.sortedPlaces[i];
      }
    }
    return a.id.localeCompare(b.id);
  });

  const result = new Map<string, CombineResult>();
  let lastKey: string | null = null;
  let lastPlace = 0;

  sorted.forEach((row, index) => {
    // Ідеальна нічия — усі три місця однакові, кожне за своїм критерієм.
    const key = `${row.academic}|${row.olympiad}|${row.points}`;
    const place = index > 0 && key === lastKey ? lastPlace : index + 1;

    result.set(row.id, { sum: row.sum, place });
    lastKey = key;
    lastPlace = place;
  });

  return result;
}

/**
 * Середнє арифметичне з масиву, ігноруючи порожні значення.
 * Потрібне для середнього бала класу (п. 10.11.2 Статуту).
 * Повертає null, якщо жодної оцінки немає.
 */
export function averageOf(values: (number | null | undefined)[]): number | null {
  const real = values.filter((v): v is number => typeof v === 'number' && Number.isFinite(v));
  if (real.length === 0) return null;
  const sum = real.reduce((acc, v) => acc + v, 0);
  return Math.round((sum / real.length) * 100) / 100;
}
