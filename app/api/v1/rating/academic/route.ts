import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserWithRoles, canManageUsers } from '@/lib/roles';

// PATCH — записати середній бал учня (навчальний рейтинг, п. 10.7.2 Статуту).
// Тіло: { studentId: string, score: number | null }
// score = null означає «оцінку прибрано».
export async function PATCH(request: NextRequest) {
  const { supabase, user, roles } = await getCurrentUserWithRoles();

  if (!user) {
    return NextResponse.json({ error: 'Потрібно увійти в акаунт' }, { status: 401 });
  }
  if (!canManageUsers(roles)) {
    return NextResponse.json({ error: 'Недостатньо прав' }, { status: 403 });
  }

  const body = await request.json();
  const { studentId, score } = body as { studentId?: string; score?: number | null };

  if (!studentId || typeof studentId !== 'string') {
    return NextResponse.json({ error: 'Не вказано учня' }, { status: 400 });
  }

  if (score !== null && score !== undefined) {
    if (typeof score !== 'number' || !Number.isFinite(score)) {
      return NextResponse.json({ error: 'Середній бал має бути числом' }, { status: 400 });
    }
    if (score < 0 || score > 12) {
      return NextResponse.json({ error: 'Середній бал має бути від 0 до 12' }, { status: 400 });
    }
  }

  // Округлюємо до сотих: 10,853 → 10,85.
  const clean =
    score === null || score === undefined ? null : Math.round(score * 100) / 100;

  const { data, error } = await supabase.rpc('set_academic_score', {
    p_target_user_id: studentId,
    p_score: clean,
  });

  if (error) {
    console.error('Academic score error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ score: data ?? clean }, { status: 200 });
}
