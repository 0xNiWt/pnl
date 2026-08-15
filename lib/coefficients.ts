// Система коефіцієнтів залученості — пп. 12.2.3–12.2.5 Статуту.
//
// Цей файл навмисно "чистий": тут немає жодного звернення до бази даних
// чи до браузера. Тому його можна імпортувати і в клієнтський компонент
// (для живого підрахунку в формі), і в API-роут (для перерахунку на сервері).

export type CoefficientLevel = 1 | 2 | 3;

// Три рівні залученості з п. 12.2.3.3 Статуту.
export const COEFFICIENT_LEVELS: {
  value: CoefficientLevel;
  title: string;
  hint: string;
}[] = [
  {
    value: 3,
    title: 'Головні організатори',
    hint: 'Сценарій, головні ведучі, координатори, режисери',
  },
  {
    value: 2,
    title: 'Активні виконавці',
    hint: 'Окремі номери, технічне забезпечення, монтаж відео',
  },
  {
    value: 1,
    title: 'Допоміжний склад',
    hint: 'Реквізит, оформлення зали, дрібні доручення',
  },
];

export function isCoefficientLevel(value: unknown): value is CoefficientLevel {
  return value === 1 || value === 2 || value === 3;
}

export function coefficientTitle(value: number): string {
  return COEFFICIENT_LEVELS.find((l) => l.value === value)?.title ?? `К = ${value}`;
}

export type CoefficientParticipant = {
  studentId: string;
  coefficient: number;
};

export type CoefficientShare = {
  studentId: string;
  coefficient: number;
  points: number;
};

export type CoefficientDistribution = {
  // Загальна сума коефіцієнтів усіх учасників.
  totalCoefficient: number;
  // Вартість одного базового коефіцієнта (може бути дробовою).
  baseRate: number;
  // Скільки балів реально роздано (завжди дорівнює бюджету, якщо є учасники).
  distributed: number;
  shares: CoefficientShare[];
};

/**
 * Розподіляє бюджет заходу між учасниками за їхніми коефіцієнтами.
 *
 * Алгоритм зі Статуту (п. 12.2.5.1):
 *   1. Рахуємо загальну суму коефіцієнтів усіх учасників.
 *   2. Бюджет ділимо на цю суму — отримуємо базову ставку.
 *   3. Базову ставку множимо на особистий коефіцієнт учня.
 *
 * Оскільки бали цілі, після ділення майже завжди лишається залишок.
 * Ми роздаємо його по одному балу — спочатку тим, у кого найбільша
 * дробова частина, потім тим, у кого більший коефіцієнт. Завдяки цьому
 * сума виданих балів завжди точно дорівнює бюджету заходу.
 */
export function distributeByCoefficients(
  budget: number,
  participants: CoefficientParticipant[]
): CoefficientDistribution {
  const totalCoefficient = participants.reduce((sum, p) => sum + p.coefficient, 0);

  // Нема кого нагороджувати або бюджет некоректний — усім по нулю.
  if (participants.length === 0 || totalCoefficient <= 0 || !Number.isFinite(budget)) {
    return {
      totalCoefficient,
      baseRate: 0,
      distributed: 0,
      shares: participants.map((p) => ({
        studentId: p.studentId,
        coefficient: p.coefficient,
        points: 0,
      })),
    };
  }

  // Рахуємо на додатному бюджеті, а знак повертаємо в кінці —
  // так формула однаково працює і для штрафу (від'ємний бюджет).
  const sign = budget < 0 ? -1 : 1;
  const absBudget = Math.abs(Math.round(budget));
  const baseRate = absBudget / totalCoefficient;

  // Крок 1: кожному — його частка, округлена вниз.
  const rows = participants.map((p, index) => {
    const exact = baseRate * p.coefficient;
    const floor = Math.floor(exact);
    return { ...p, index, floor, remainder: exact - floor };
  });

  // Крок 2: скільки балів лишилося нерозданими через округлення.
  let left = absBudget - rows.reduce((sum, r) => sum + r.floor, 0);

  const queue = [...rows].sort(
    (a, b) =>
      b.remainder - a.remainder ||
      b.coefficient - a.coefficient ||
      a.index - b.index
  );

  const gotBonus = new Set<number>();
  for (const row of queue) {
    if (left <= 0) break;
    gotBonus.add(row.index);
    left -= 1;
  }

  const shares: CoefficientShare[] = rows.map((r) => ({
    studentId: r.studentId,
    coefficient: r.coefficient,
    points: sign * (r.floor + (gotBonus.has(r.index) ? 1 : 0)),
  }));

  return {
    totalCoefficient,
    baseRate,
    distributed: shares.reduce((sum, s) => sum + s.points, 0),
    shares,
  };
}
