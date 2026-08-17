// Голосування — розділ 3 Статуту («Електронні форми»).
//
// Права на створення беруться з посад активу, а не з окремих ролей:
//   староста / представник РСЛ — голосування в межах свого класу;
//   ПРСЛ                        — голосування в межах усього ліцею.
// Модератор і адміністрація можуть створювати будь-які.
//
// Усі голосування — таємні: вибору «відкрите/анонімне» немає ні у формі,
// ні в API, а поіменний список не показується нікому (див. міграцію
// sql/0007_polls_secret_only.sql).
//
// Файл чистий: без бази й без браузера.

export type PollScope = 'class' | 'lyceum';
export type PollStatus = 'open' | 'closed';

export const POLL_SCOPE_LABELS: Record<PollScope, string> = {
  class: 'Клас',
  lyceum: 'Увесь ліцей',
};

// Які посади що дозволяють (id — з довідника lib/positions.ts).
export const CLASS_POLL_POSITIONS = ['starosta', 'rsl-rep'];
export const LYCEUM_POLL_POSITIONS = ['prsl'];

/**
 * Які масштаби голосувань доступні цій людині.
 * Порожній масив означає «створювати не може».
 */
export function pollScopesFor(positions: string[], roles: string[]): PollScope[] {
  const scopes = new Set<PollScope>();

  if (roles.includes('owner') || roles.includes('moderator')) {
    scopes.add('lyceum');
    scopes.add('class');
  }
  if (LYCEUM_POLL_POSITIONS.some((p) => positions.includes(p))) {
    scopes.add('lyceum');
  }
  if (CLASS_POLL_POSITIONS.some((p) => positions.includes(p))) {
    scopes.add('class');
  }

  // Сталий порядок: спершу клас, потім ліцей.
  return (['class', 'lyceum'] as PollScope[]).filter((s) => scopes.has(s));
}

export function canCreatePolls(positions: string[], roles: string[]): boolean {
  return pollScopesFor(positions, roles).length > 0;
}

export function isPollScope(value: unknown): value is PollScope {
  return value === 'class' || value === 'lyceum';
}

// Мінімальна явка за п. 3.6 Статуту: 70% для класу, 50% для ліцею.
export const QUORUM: Record<PollScope, number> = {
  class: 0.7,
  lyceum: 0.5,
};

export function turnoutPercent(voted: number, eligible: number): number {
  if (eligible <= 0) return 0;
  return Math.round((voted / eligible) * 100);
}

export function hasQuorum(scope: PollScope, voted: number, eligible: number): boolean {
  if (eligible <= 0) return false;
  return voted / eligible >= QUORUM[scope];
}

export type PollOptionResult = {
  option_id: string;
  label: string;
  votes: number;
};

/**
 * Переможці голосування. Повертає масив, бо за нічиєї їх може бути кілька
 * (п. 4.2.2 Статуту: нічия вирішується окремим голосуванням активу).
 */
export function pollWinners(results: PollOptionResult[]): PollOptionResult[] {
  const max = results.reduce((best, r) => Math.max(best, r.votes), 0);
  if (max === 0) return [];
  return results.filter((r) => r.votes === max);
}

// Скільки відсотків голосів набрав варіант.
export function optionPercent(votes: number, totalVotes: number): number {
  if (totalVotes <= 0) return 0;
  return Math.round((votes / totalVotes) * 100);
}
