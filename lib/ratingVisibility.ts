import { cache } from 'react';
import { createClient } from './server';
import { NOTHING_HIDDEN, RATING_KINDS, isRatingKind, type RatingVisibility } from './ratings';

// Стан «показувати / приховати» для кожного з чотирьох рейтингів лежить
// у таблиці rating_visibility (міграція sql/0006_rating_visibility.sql).
// Писати в неї можна лише через функцію set_rating_visibility, яка сама
// перевіряє ролі — див. коментар у міграції.
export const getRatingVisibility = cache(async function getRatingVisibility(): Promise<RatingVisibility> {
  const supabase = await createClient();

  const { data, error } = await supabase.from('rating_visibility').select('kind, hidden');

  // Міграція ще не запущена — вважаємо, що нічого не приховано.
  if (error || !data) return { ...NOTHING_HIDDEN };

  const result: RatingVisibility = { ...NOTHING_HIDDEN };
  for (const row of data) {
    if (isRatingKind(row.kind)) result[row.kind] = Boolean(row.hidden);
  }
  return result;
});

export function anyRatingHidden(visibility: RatingVisibility): boolean {
  return RATING_KINDS.some((kind) => visibility[kind]);
}
