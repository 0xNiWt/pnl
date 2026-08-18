// Голосування — розділ 3 Статуту («Електронні форми»).
//
// Права на створення беруться з посад активу, а не з окремих ролей:
//   староста / представник РСЛ — голосування в межах свого класу;
//   ПРСЛ                        — увесь ліцей і будь-яка група активу;
//   голова старостату / фізоргів / пресцентру — своя група активу
//                                 (усі старости, усі фізорги, усі редактори).
// Модератор і адміністрація можуть створювати будь-які.
//
// Усі голосування — таємні: вибору «відкрите/анонімне» немає ні у формі,
// ні в API, а поіменний список не показується нікому (див. міграцію
// sql/0007_polls_secret_only.sql).
//
// Файл чистий: без бази й без браузера.

import { POSITIONS, positionGroupLabel } from './positions';

export type PollScope = 'class' | 'lyceum' | 'position';
export type PollStatus = 'open' | 'closed';

export const POLL_SCOPE_LABELS: Record<PollScope, string> = {
  class: 'Клас',
  lyceum: 'Увесь ліцей',
  position: 'Група активу',
};

// Які посади що дозволяють (id — з довідника lib/positions.ts).
export const CLASS_POLL_POSITIONS = ['starosta', 'rsl-rep'];
export const LYCEUM_POLL_POSITIONS = ['prsl'];

/**
 * Голосування для групи активу можна проводити серед тих, хто обіймає
 * класну посаду: «усі фізорги ліцею», «усі старости». Ліцейські посади сюди
 * не потрапляють — вони одиничні, голосувати самому із собою немає сенсу.
 */
export const POSITION_POLL_TARGETS: string[] = POSITIONS
  .filter((p) => p.scope === 'class-main' || p.scope === 'class-secondary')
  .map((p) => p.id);

/**
 * Хто якою групою активу керує — той і скликає її голосування.
 * Ключ — посада голови, значення — посади, серед яких він може голосувати.
 */
export const POSITION_POLL_RIGHTS: Record<string, string[]> = {
  'head-starostat': ['starosta', 'starosta-deputy'],
  'head-fizorg': ['fizorg', 'fizorg-deputy'],
  'head-presscenter': ['redactor', 'redactor-deputy', 'photographer'],
  'erudite-president': ['erudite-captain'],
};

/**
 * Серед яких груп активу ця людина може скликати голосування.
 * ПРСЛ, модератор і адміністрація — серед будь-якої.
 */
export function pollTargetPositionsFor(positions: string[], roles: string[]): string[] {
  if (
    roles.includes('owner') ||
    roles.includes('moderator') ||
    positions.includes('prsl')
  ) {
    return POSITION_POLL_TARGETS;
  }

  const allowed = new Set<string>();
  for (const [head, targets] of Object.entries(POSITION_POLL_RIGHTS)) {
    if (positions.includes(head)) {
      for (const target of targets) allowed.add(target);
    }
  }

  // Порядок беремо з довідника, щоб список не стрибав.
  return POSITION_POLL_TARGETS.filter((id) => allowed.has(id));
}

export function canCreatePollForPosition(
  positions: string[],
  roles: string[],
  target: string
): boolean {
  return pollTargetPositionsFor(positions, roles).includes(target);
}

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
  if (pollTargetPositionsFor(positions, roles).length > 0) {
    scopes.add('position');
  }

  // Сталий порядок: клас, ліцей, група активу.
  return (['class', 'lyceum', 'position'] as PollScope[]).filter((s) => scopes.has(s));
}

export function canCreatePolls(positions: string[], roles: string[]): boolean {
  return pollScopesFor(positions, roles).length > 0;
}

/**
 * Підпис голосування у списку та в шапці: «Клас 10-А», «Увесь ліцей»,
 * «Фізорги». Один на весь застосунок, щоб назви не розповзалися.
 */
export function pollAudienceLabel(poll: {
  scope: PollScope;
  class_name: string | null;
  position_id: string | null;
}): string {
  if (poll.scope === 'class') return `Клас ${poll.class_name ?? '—'}`;
  if (poll.scope === 'position') {
    return poll.position_id ? positionGroupLabel(poll.position_id) : POLL_SCOPE_LABELS.position;
  }
  return POLL_SCOPE_LABELS.lyceum;
}

export function isPollScope(value: unknown): value is PollScope {
  return value === 'class' || value === 'lyceum' || value === 'position';
}

// Мінімальна явка за п. 3.6 Статуту: 70% для класу, 50% для ліцею.
// Для групи активу Статут явки не називає — беремо класні 70%.
export const QUORUM: Record<PollScope, number> = {
  class: 0.7,
  lyceum: 0.5,
  // Група активу невелика й зібрана — вимагаємо ту саму явку, що й для класу.
  position: 0.7,
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
