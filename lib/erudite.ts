// Рейтинг клубу інтелектуальних ігор «Ерудит» — розділ 9 Положення.
//
// Рейтинг повністю окремий: він не бере даних з балового, навчального чи
// олімпіадного рейтингів і нічого в них не додає. Схема — у
// sql/0020_erudite_rating.sql та sql/0021_erudite_rosters_penalties.sql.
//
// Файл чистий: без бази й без браузера, тож ним користуються і сторінки,
// і клієнтські компоненти.

import { compareClasses, parallelOf } from './positions';

// ---------------------------------------------------------------------
// Доступ
// ---------------------------------------------------------------------

// Хто бачить рейтинг: учасники клубу, капітани команд і президент клубу.
export const ERUDITE_VIEW_POSITIONS = ['erudite-member', 'erudite-captain', 'erudite-president'];

// Хто рахується учасником клубу в статистиці: учасники разом із капітанами.
export const ERUDITE_PLAYER_POSITIONS = ['erudite-member', 'erudite-captain'];

export function canViewErudite(positions: string[], roles: string[]): boolean {
  if (roles.includes('owner') || roles.includes('moderator')) return true;
  return ERUDITE_VIEW_POSITIONS.some((p) => positions.includes(p));
}

// Пп. 3.1.5 та 9.4.2: загальний рейтинг веде президент клубу.
export function canManageErudite(positions: string[], roles: string[]): boolean {
  if (roles.includes('owner') || roles.includes('moderator')) return true;
  return positions.includes('erudite-president');
}

// ---------------------------------------------------------------------
// Правила з Положення
// ---------------------------------------------------------------------

// П. 9.4.2: бали загального рейтингу за місце в грі. 6 місце й нижче — 0.
export const PLACE_POINTS = [5, 4, 3, 2, 1];

export function placePoints(place: number | null): number {
  if (!place || place < 1) return 0;
  return PLACE_POINTS[place - 1] ?? 0;
}

// П. 9.5.1: додаткові (вікові) бали — команда отримує їх за кожну гру,
// в якій зіграла.
const AGE_BONUS: Record<string, number> = {
  '7': 5,
  '8': 4,
  '9': 3,
  '10': 1,
  '11': 0,
};

export function ageBonus(className: string | null | undefined): number {
  const grade = parallelOf(className);
  if (!grade) return 0;
  return AGE_BONUS[grade] ?? 0;
}

// П. 9.5.2: дві неявки за рік без штрафу, за кожну наступну — мінус 1 бал.
export const FREE_NO_SHOWS = 2;

export function noShowPenalty(noShows: number): number {
  return Math.max(0, noShows - FREE_NO_SHOWS);
}

// П. 9.3.1: команда класу на гру — 5 осіб разом із капітаном.
export const TEAM_SIZE = 5;

// ---------------------------------------------------------------------
// Навчальний рік (рейтинг — річний, п. 9.4.2)
// ---------------------------------------------------------------------

export function currentSeason(date: Date = new Date()): string {
  const year = date.getFullYear();
  // Навчальний рік починається у вересні.
  return date.getMonth() >= 8 ? `${year}/${year + 1}` : `${year - 1}/${year}`;
}

export function isSeason(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}\/\d{4}$/.test(value)) return false;
  const [a, b] = value.split('/').map(Number);
  return b === a + 1;
}

// ---------------------------------------------------------------------
// Дані
// ---------------------------------------------------------------------

export type EruditeTeam = {
  id: string;
  season: string;
  name: string;
  class_name: string | null;
  captain_id: string | null;
  members: string[];
};

// planned — гру заплановано, капітани подають заявки; played — внесено результати.
export type GameStatus = 'planned' | 'played';

export type EruditeGame = {
  id: string;
  season: string;
  title: string;
  played_on: string;
  status: GameStatus;
};

export type EruditeResult = {
  game_id: string;
  team_id: string;
  attended: boolean;
  // Ігрові очки — скільки команда набрала в самій грі.
  score: number;
  // Хто саме грав цього разу (для персонального рейтингу).
  players: string[];
};

export type RosterStatus = 'pending' | 'approved' | 'rejected';

export const ROSTER_STATUS_LABELS: Record<RosterStatus, string> = {
  pending: 'Очікує підтвердження',
  approved: 'Підтверджено',
  rejected: 'Відхилено',
};

// Заявка капітана на гру (склад команди), яку підтверджує президент клубу.
export type EruditeRoster = {
  game_id: string;
  team_id: string;
  players: string[];
  status: RosterStatus;
  note: string | null;
  submitted_at: string;
};

export type PenaltyReason = 'no_show' | 'roster' | 'other';

export const PENALTY_REASONS: Record<PenaltyReason, string> = {
  no_show: 'Неявка на гру',
  roster: 'Неправильно заявлені гравці',
  other: 'Інше порушення',
};

export function isPenaltyReason(value: unknown): value is PenaltyReason {
  return value === 'no_show' || value === 'roster' || value === 'other';
}

// Штраф, який президент клубу нараховує вручну.
export type EruditePenalty = {
  id: string;
  season: string;
  team_id: string;
  game_id: string | null;
  points: number;
  reason: PenaltyReason;
  note: string | null;
  created_at: string;
};

export type EruditePerson = {
  id: string;
  full_name: string | null;
  class: string | null;
};

// ---------------------------------------------------------------------
// Порядок і номери команд (стовпці таблиці)
// ---------------------------------------------------------------------

export function sortTeams(teams: EruditeTeam[]): EruditeTeam[] {
  return [...teams].sort(
    (a, b) =>
      compareClasses(a.class_name ?? '', b.class_name ?? '') ||
      a.name.localeCompare(b.name, 'uk')
  );
}

// ---------------------------------------------------------------------
// Підрахунок
// ---------------------------------------------------------------------

export type GameRow = {
  team_id: string;
  attended: boolean;
  score: number;
  place: number | null;
  points: number;
  players: string[];
};

/**
 * Місця в одній грі — за ігровими очками. Однакові очки — однакове місце
 * (п. 9.4.3): дві команди на 1-му місці, наступна — на 3-му.
 */
export function rankGame(results: EruditeResult[]): GameRow[] {
  const rows: GameRow[] = results.map((r) => ({
    team_id: r.team_id,
    attended: r.attended,
    score: r.attended ? r.score : 0,
    place: null,
    points: 0,
    players: r.players,
  }));

  const played = rows.filter((r) => r.attended).sort((a, b) => b.score - a.score);

  played.forEach((row, i) => {
    const place = i > 0 && row.score === played[i - 1].score ? played[i - 1].place : i + 1;
    row.place = place;
    row.points = placePoints(place);
  });

  return [...played, ...rows.filter((r) => !r.attended)];
}

export type GameCell = { attended: boolean; place: number | null; points: number };

export type TeamStanding = {
  team: EruditeTeam;
  // Номер команди — стовпець у таблиці рейтингу.
  number: number;
  place: number;
  // Бали за місця в іграх (п. 9.4.2).
  points: number;
  // Додаткові бали (п. 9.5.1) за всі зіграні ігри.
  bonus: number;
  // Автоматичний штраф за неявки (п. 9.5.2).
  autoPenalty: number;
  // Штрафи, нараховані президентом клубу.
  manualPenalty: number;
  penalty: number;
  total: number;
  games: number;
  noShows: number;
  firsts: number;
  seconds: number;
  // Місце команди в кожній грі — клітинки таблиці.
  cells: Record<string, GameCell>;
};

/**
 * Загальний річний рейтинг команд:
 * бали за місця + додаткові бали − штрафні бали.
 * Нічия вирішується кількістю перших місць (п. 10.13.4), далі — других.
 */
export function teamStandings(
  teams: EruditeTeam[],
  games: EruditeGame[],
  results: EruditeResult[],
  penalties: EruditePenalty[] = []
): TeamStanding[] {
  const ordered = sortTeams(teams);
  const played = games.filter((g) => g.status === 'played');

  const list: TeamStanding[] = ordered.map((team, i) => ({
    team,
    number: i + 1,
    place: 0,
    points: 0,
    bonus: 0,
    autoPenalty: 0,
    manualPenalty: 0,
    penalty: 0,
    total: 0,
    games: 0,
    noShows: 0,
    firsts: 0,
    seconds: 0,
    cells: {},
  }));
  const byId = new Map(list.map((s) => [s.team.id, s]));

  for (const game of played) {
    for (const row of rankGame(results.filter((r) => r.game_id === game.id))) {
      const s = byId.get(row.team_id);
      if (!s) continue;
      s.cells[game.id] = { attended: row.attended, place: row.place, points: row.points };
      if (!row.attended) {
        s.noShows += 1;
        continue;
      }
      s.games += 1;
      s.points += row.points;
      if (row.place === 1) s.firsts += 1;
      if (row.place === 2) s.seconds += 1;
    }
  }

  for (const p of penalties) {
    const s = byId.get(p.team_id);
    if (s) s.manualPenalty += p.points;
  }

  for (const s of list) {
    s.bonus = ageBonus(s.team.class_name) * s.games;
    s.autoPenalty = noShowPenalty(s.noShows);
    s.penalty = s.autoPenalty + s.manualPenalty;
    s.total = s.points + s.bonus - s.penalty;
  }

  const ranked = [...list].sort(
    (a, b) =>
      b.total - a.total ||
      b.firsts - a.firsts ||
      b.seconds - a.seconds ||
      a.number - b.number
  );

  ranked.forEach((row, i) => {
    const prev = ranked[i - 1];
    const tied = prev && prev.total === row.total && prev.firsts === row.firsts && prev.seconds === row.seconds;
    row.place = tied ? prev.place : i + 1;
  });

  // Повертаємо в порядку номерів: так стовпці таблиці не стрибають.
  return list;
}

export type PersonStanding = {
  person: EruditePerson;
  place: number;
  points: number;
  games: number;
  firsts: number;
  teams: string[];
};

/**
 * Персональний рейтинг. У Положенні його немає, тому правило просте й
 * прозоре: гравець отримує бали, які його команда здобула за місце в грі
 * (п. 9.4.2), — за кожну гру, в якій він справді грав. Додаткові та
 * штрафні бали командні й на персональний рейтинг не впливають.
 */
export function personalStandings(
  teams: EruditeTeam[],
  games: EruditeGame[],
  results: EruditeResult[],
  people: EruditePerson[]
): PersonStanding[] {
  const teamMap = new Map(teams.map((t) => [t.id, t]));
  const personMap = new Map(people.map((p) => [p.id, p]));
  const stats = new Map<string, { points: number; games: number; firsts: number; teams: Set<string> }>();

  for (const game of games.filter((g) => g.status === 'played')) {
    for (const row of rankGame(results.filter((r) => r.game_id === game.id))) {
      if (!row.attended) continue;
      const teamName = teamMap.get(row.team_id)?.name ?? '';
      for (const playerId of new Set(row.players)) {
        const s = stats.get(playerId) ?? { points: 0, games: 0, firsts: 0, teams: new Set<string>() };
        s.points += row.points;
        s.games += 1;
        if (row.place === 1) s.firsts += 1;
        if (teamName) s.teams.add(teamName);
        stats.set(playerId, s);
      }
    }
  }

  const list: PersonStanding[] = [...stats.entries()]
    .filter(([id]) => personMap.has(id))
    .map(([id, s]) => ({
      person: personMap.get(id)!,
      place: 0,
      points: s.points,
      games: s.games,
      firsts: s.firsts,
      teams: [...s.teams],
    }));

  list.sort(
    (a, b) =>
      b.points - a.points ||
      b.firsts - a.firsts ||
      (a.person.full_name ?? '').localeCompare(b.person.full_name ?? '', 'uk')
  );

  list.forEach((row, i) => {
    const prev = list[i - 1];
    const tied = prev && prev.points === row.points && prev.firsts === row.firsts;
    row.place = tied ? prev.place : i + 1;
  });

  return list;
}

/** Лідер рейтингу (1 місце). Якщо лідерів кілька — усі. */
export function leaders(standings: TeamStanding[]): TeamStanding[] {
  if (standings.every((s) => s.games === 0 && s.total === 0)) return [];
  return standings.filter((s) => s.place === 1);
}

// Три показники блоку клубу: ігор відбулося, учасників, лідер рейтингу.
export type EruditeStats = {
  gamesPlayed: number;
  participants: number;
  leaders: { name: string; className: string | null }[];
};

export function eruditeStats(
  standings: TeamStanding[],
  games: EruditeGame[],
  participants: number
): EruditeStats {
  return {
    gamesPlayed: games.filter((g) => g.status === 'played').length,
    participants,
    leaders: leaders(standings).map((s) => ({ name: s.team.name, className: s.team.class_name })),
  };
}
