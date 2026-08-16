import { NextResponse } from 'next/server';
import { getRatingSnapshot } from '@/lib/points';
import { getRatingVisibility } from '@/lib/ratingVisibility';
import { canManageRatingVisibility, getCurrentUserWithRoles } from '@/lib/roles';

// Один запит віддає обидва рейтинги — і учнів, і класів. Перемикання
// «учні ↔ класи» та пошук працюють у браузері, без походу на сервер.
export async function GET() {
  const [snapshot, hidden, { roles }] = await Promise.all([
    getRatingSnapshot(),
    getRatingVisibility(),
    getCurrentUserWithRoles(),
  ]);

  const canSeeHidden = canManageRatingVisibility(roles);

  return NextResponse.json({
    students: snapshot.students,
    classes: snapshot.classes,
    hidden,
    canSeeHidden,
  });
}
