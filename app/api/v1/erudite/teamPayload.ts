import { isSeason } from '@/lib/erudite';

type TeamInput = {
  season: string;
  name: string;
  class_name: string | null;
  captain_id: string | null;
  members: string[];
};

// Спільна перевірка тіла запиту для створення й зміни команди.
export function parseTeamPayload(body: unknown): { ok: true; value: TeamInput } | { ok: false; error: string } {
  const b = (body ?? {}) as Record<string, unknown>;

  const name = typeof b.name === 'string' ? b.name.trim() : '';
  if (!name) return { ok: false, error: 'Вкажіть назву команди' };

  if (!isSeason(b.season)) return { ok: false, error: 'Некоректний навчальний рік' };

  const className = typeof b.className === 'string' && b.className.trim() ? b.className.trim() : null;
  const captainId = typeof b.captainId === 'string' && b.captainId ? b.captainId : null;

  const members = Array.isArray(b.members)
    ? [...new Set(b.members.filter((m): m is string => typeof m === 'string' && m.length > 0))]
    : [];

  // Капітан завжди входить до складу своєї команди.
  if (captainId && !members.includes(captainId)) members.unshift(captainId);

  return {
    ok: true,
    value: { season: b.season, name, class_name: className, captain_id: captainId, members },
  };
}
