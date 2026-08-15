import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserWithRoles } from '@/lib/roles';

// POST — віддати голос. Уся перевірка (чи відкрите, чи твоє коло,
// чи не голосував раніше) робиться в базі функцією cast_vote.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { supabase, user } = await getCurrentUserWithRoles();

  if (!user) {
    return NextResponse.json({ error: 'Потрібно увійти в акаунт' }, { status: 401 });
  }

  const body = await request.json();
  const optionId = body?.optionId;

  if (!optionId || typeof optionId !== 'string') {
    return NextResponse.json({ error: 'Обери варіант' }, { status: 400 });
  }

  const { error } = await supabase.rpc('cast_vote', {
    p_poll_id: id,
    p_option_id: optionId,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ ok: true }, { status: 201 });
}
