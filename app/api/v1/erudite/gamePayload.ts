import { isSeason } from '@/lib/erudite';

type ResultInput = { team_id: string; attended: boolean; score: number; players: string[] };

type GameInput = { season: string; title: string; playedOn: string; results: ResultInput[] };

// Спільна перевірка тіла запиту для створення й зміни гри.
export function parseGamePayload(body: unknown): { ok: true; value: GameInput } | { ok: false; error: string } {
  const b = (body ?? {}) as Record<string, unknown>;

  const title = typeof b.title === 'string' ? b.title.trim() : '';
  if (!title) return { ok: false, error: 'Вкажіть назву гри' };

  if (!isSeason(b.season)) return { ok: false, error: 'Некоректний навчальний рік' };

  const playedOn = typeof b.playedOn === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(b.playedOn) ? b.playedOn : '';
  if (!playedOn) return { ok: false, error: 'Вкажіть дату гри' };

  if (!Array.isArray(b.results) || b.results.length === 0) {
    return { ok: false, error: 'Додайте результати хоча б однієї команди' };
  }

  const results: ResultInput[] = [];
  for (const raw of b.results as Record<string, unknown>[]) {
    if (typeof raw.team_id !== 'string') continue;
    const attended = raw.attended !== false;
    const score = Number(raw.score);
    if (attended && (!Number.isFinite(score) || score < 0)) {
      return { ok: false, error: 'Очки команди мають бути невідʼємним числом' };
    }
    const players = Array.isArray(raw.players)
      ? [...new Set(raw.players.filter((p): p is string => typeof p === 'string' && p.length > 0))]
      : [];
    results.push({
      team_id: raw.team_id,
      attended,
      score: attended ? score : 0,
      players: attended ? players : [],
    });
  }

  return { ok: true, value: { season: b.season, title, playedOn, results } };
}
