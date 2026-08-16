import { NextRequest, NextResponse } from 'next/server';
import { getRatingVisibility } from '@/lib/ratingVisibility';
import { isRatingKind } from '@/lib/ratings';
import { canManageRatingVisibility, getCurrentUserWithRoles } from '@/lib/roles';

// GET — поточний стан видимості рейтингів. Потрібен і сторінці /rating,
// і кабінету, тому доступний усім.
export async function GET() {
  const hidden = await getRatingVisibility();
  return NextResponse.json({ hidden });
}

// PATCH — приховати або повернути один рейтинг. Права перевіряються двічі:
// тут і всередині SQL-функції set_rating_visibility.
export async function PATCH(request: NextRequest) {
  const { supabase, user, roles } = await getCurrentUserWithRoles();

  if (!user) {
    return NextResponse.json({ error: 'Потрібно увійти в акаунт' }, { status: 401 });
  }
  if (!canManageRatingVisibility(roles)) {
    return NextResponse.json({ error: 'Недостатньо прав' }, { status: 403 });
  }

  const body = await request.json();
  const { kind, hidden } = body as { kind?: string; hidden?: boolean };

  if (!isRatingKind(kind)) {
    return NextResponse.json({ error: 'Невідомий рейтинг' }, { status: 400 });
  }
  if (typeof hidden !== 'boolean') {
    return NextResponse.json({ error: 'Не вказано, ховати чи показувати' }, { status: 400 });
  }

  const { error } = await supabase.rpc('set_rating_visibility', {
    p_kind: kind,
    p_hidden: hidden,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, kind, hidden });
}
