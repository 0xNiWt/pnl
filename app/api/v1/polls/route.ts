import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserWithRoles } from '@/lib/roles';
import { isPositionId } from '@/lib/positions';
import { isPollScope, POSITION_POLL_TARGETS } from '@/lib/voting';

// POST — створити голосування.
// Права перевіряє сама база (функція create_poll): староста і представник РСЛ
// можуть лише свій клас, ПРСЛ — увесь ліцей і будь-яку групу активу, голова
// старостату/фізоргів/пресцентру — свою групу, модератор і адміністрація — будь-яке.
export async function POST(request: NextRequest) {
  const { supabase, user } = await getCurrentUserWithRoles();

  if (!user) {
    return NextResponse.json({ error: 'Потрібно увійти в акаунт' }, { status: 401 });
  }

  const body = await request.json();
  const { title, description, scope, className, positionId, options } = body as {
    title?: string;
    description?: string;
    scope?: string;
    className?: string | null;
    positionId?: string | null;
    options?: string[];
  };

  if (!title?.trim()) {
    return NextResponse.json({ error: 'Напиши питання' }, { status: 400 });
  }
  if (!isPollScope(scope)) {
    return NextResponse.json({ error: 'Обери, для кого голосування' }, { status: 400 });
  }
  if (scope === 'class' && !className) {
    return NextResponse.json({ error: 'Не вказано клас' }, { status: 400 });
  }
  if (scope === 'position') {
    if (!positionId || !isPositionId(positionId)) {
      return NextResponse.json({ error: 'Обери групу активу' }, { status: 400 });
    }
    // Ліцейські посади одиничні — голосування серед них не має сенсу.
    if (!POSITION_POLL_TARGETS.includes(positionId)) {
      return NextResponse.json(
        { error: 'Серед цієї посади голосування не проводять' },
        { status: 400 }
      );
    }
  }

  const clean = (options ?? []).map((o) => o.trim()).filter(Boolean);
  if (clean.length < 2) {
    return NextResponse.json(
      { error: 'Потрібно щонайменше два варіанти відповіді' },
      { status: 400 }
    );
  }
  if (clean.length > 20) {
    return NextResponse.json({ error: 'Забагато варіантів (максимум 20)' }, { status: 400 });
  }

  const { data, error } = await supabase.rpc('create_poll', {
    p_title: title,
    p_description: description ?? null,
    p_scope: scope,
    p_class: scope === 'class' ? className : null,
    p_position: scope === 'position' ? positionId : null,
    // Таємність не обговорюється: клієнт її не вибирає, тому підсунути
    // відкрите голосування запитом в обхід форми не вийде.
    p_is_anonymous: true,
    p_options: clean,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ id: data }, { status: 201 });
}
