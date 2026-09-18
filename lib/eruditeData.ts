// Читання даних клубу «Ерудит» з бази. Окремо від lib/erudite.ts, бо той
// файл імпортують клієнтські компоненти, а тут — серверний Supabase.

import { createClient } from './server';
import { hasRatingConsent } from './consent';
import { isRatingConsentEnforced } from './appSettings';
import {
  ERUDITE_PLAYER_POSITIONS,
  canManageErudite,
  canViewErudite,
  currentSeason,
  isPenaltyReason,
  type EruditeGame,
  type EruditePenalty,
  type EruditePerson,
  type EruditeResult,
  type EruditeRoster,
  type EruditeTeam,
  type GameStatus,
  type RosterStatus,
} from './erudite';

export type EruditeSeasonData = {
  season: string;
  seasons: string[];
  teams: EruditeTeam[];
  games: EruditeGame[];
  results: EruditeResult[];
  rosters: EruditeRoster[];
  penalties: EruditePenalty[];
  // Усі учні — щоб підписати гравців і заповнити списки в редакторі.
  people: EruditePerson[];
  // Учні, яких можна показувати в персональному рейтингу (п. 10.1.2).
  rankablePeopleIds: string[];
  // Учасники клубу разом із капітанами (за посадами в активі).
  participantsCount: number;
};

/**
 * Усе про один навчальний рік клубу. Доступ перевіряє RLS: хто не має
 * права бачити клуб, отримає порожні списки.
 */
export async function getEruditeSeason(season: string): Promise<EruditeSeasonData> {
  const supabase = await createClient();
  const enforceConsent = await isRatingConsentEnforced();

  const peopleQuery = enforceConsent
    ? supabase
        .from('profiles')
        .select('id, full_name, class, rating_consent_at, rating_consent_version, rating_consent_revoked_at')
        .not('class', 'is', null)
    : supabase.from('profiles').select('id, full_name, class').not('class', 'is', null);

  const [teamsRes, games, seasonsTeamsRes, seasonsGamesRes, peopleRes, participantsRes, penaltiesRes] =
    await Promise.all([
      supabase
        .from('erudite_teams')
        .select('id, season, name, class_name, captain_id, members')
        .eq('season', season)
        .order('name', { ascending: true }),
      loadGames(supabase, season),
      supabase.from('erudite_teams').select('season'),
      supabase.from('erudite_games').select('season'),
      peopleQuery,
      supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .overlaps('positions', ERUDITE_PLAYER_POSITIONS),
      // До міграції 0021 таблиці штрафів немає — тоді просто без штрафів.
      supabase
        .from('erudite_penalties')
        .select('id, season, team_id, game_id, points, reason, note, created_at')
        .eq('season', season)
        .order('created_at', { ascending: true }),
    ]);

  const teams = (teamsRes.data ?? []).map((t) => ({
    ...t,
    members: (t.members ?? []) as string[],
  })) as EruditeTeam[];

  const gameIds = games.map((g) => g.id);
  const [resultsRes, rostersRes] = gameIds.length
    ? await Promise.all([
        supabase
          .from('erudite_results')
          .select('game_id, team_id, attended, score, players')
          .in('game_id', gameIds),
        supabase
          .from('erudite_rosters')
          .select('game_id, team_id, players, status, note, submitted_at')
          .in('game_id', gameIds),
      ])
    : [{ data: [] }, { data: [] }];

  const results: EruditeResult[] = (resultsRes.data ?? []).map((r) => ({
    game_id: r.game_id,
    team_id: r.team_id,
    attended: r.attended,
    score: Number(r.score) || 0,
    players: (r.players ?? []) as string[],
  }));

  const rosters: EruditeRoster[] = (rostersRes.data ?? []).map((r) => ({
    game_id: r.game_id,
    team_id: r.team_id,
    players: (r.players ?? []) as string[],
    status: r.status as RosterStatus,
    note: r.note ?? null,
    submitted_at: r.submitted_at,
  }));

  const penalties: EruditePenalty[] = (penaltiesRes.data ?? [])
    .filter((p) => isPenaltyReason(p.reason))
    .map((p) => ({
      id: p.id,
      season: p.season,
      team_id: p.team_id,
      game_id: p.game_id ?? null,
      points: Number(p.points) || 0,
      reason: p.reason,
      note: p.note ?? null,
      created_at: p.created_at,
    }));

  type PersonRow = EruditePerson & {
    rating_consent_at?: string | null;
    rating_consent_version?: string | null;
    rating_consent_revoked_at?: string | null;
  };
  const peopleRows = (peopleRes.data ?? []) as PersonRow[];

  const people: EruditePerson[] = peopleRows.map(({ id, full_name, class: cls }) => ({
    id,
    full_name,
    class: cls,
  }));

  const rankablePeopleIds = enforceConsent
    ? peopleRows
        .filter((p) =>
          hasRatingConsent({
            consentedAt: p.rating_consent_at ?? null,
            version: p.rating_consent_version ?? null,
            revokedAt: p.rating_consent_revoked_at ?? null,
          })
        )
        .map((p) => p.id)
    : people.map((p) => p.id);

  const seasons = new Set<string>([currentSeason(), season]);
  for (const row of [...(seasonsTeamsRes.data ?? []), ...(seasonsGamesRes.data ?? [])]) {
    if (row.season) seasons.add(row.season);
  }

  return {
    season,
    seasons: [...seasons].sort().reverse(),
    teams,
    games,
    results,
    rosters,
    penalties,
    people,
    rankablePeopleIds,
    participantsCount: participantsRes.count ?? 0,
  };
}

type Supabase = Awaited<ReturnType<typeof createClient>>;

// Колонка status з'являється в міграції 0021. Поки її немає, усі ігри
// вважаємо зіграними — так сторінка працює і до оновлення бази.
async function loadGames(supabase: Supabase, season: string): Promise<EruditeGame[]> {
  const withStatus = await supabase
    .from('erudite_games')
    .select('id, season, title, played_on, status')
    .eq('season', season)
    .order('played_on', { ascending: true });

  if (!withStatus.error) {
    return (withStatus.data ?? []).map((g) => ({
      ...g,
      status: (g.status === 'planned' ? 'planned' : 'played') as GameStatus,
    }));
  }

  const legacy = await supabase
    .from('erudite_games')
    .select('id, season, title, played_on')
    .eq('season', season)
    .order('played_on', { ascending: true });

  return (legacy.data ?? []).map((g) => ({ ...g, status: 'played' as GameStatus }));
}

/**
 * Хто зайшов і що йому можна в клубі. Права клубу залежать від посад
 * (учасник, капітан, президент), а не лише від ролей.
 */
export async function getEruditeAccess() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { supabase, user: null, roles: [] as string[], positions: [] as string[], className: null as string | null, canView: false, canManage: false };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('roles, positions, class')
    .eq('id', user.id)
    .single();

  const roles = (profile?.roles ?? []) as string[];
  const positions = (profile?.positions ?? []) as string[];

  return {
    supabase,
    user,
    roles,
    positions,
    className: (profile?.class ?? null) as string | null,
    canView: canViewErudite(positions, roles),
    canManage: canManageErudite(positions, roles),
  };
}
