import { NextRequest, NextResponse } from 'next/server';
import { getEruditeAccess } from '@/lib/eruditeData';
import { parseTeamPayload } from '../../teamPayload';

type Params = { params: Promise<{ id: string }> };

// PATCH — змінити команду.
export async function PATCH(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const { supabase, user, canManage } = await getEruditeAccess();

  if (!user) return NextResponse.json({ error: 'Потрібно увійти в акаунт' }, { status: 401 });
  if (!canManage) return NextResponse.json({ error: 'Недостатньо прав' }, { status: 403 });

  const parsed = parseTeamPayload(await request.json());
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

  const { error, count } = await supabase
    .from('erudite_teams')
    .update(parsed.value, { count: 'exact' })
    .eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  if (!count) return NextResponse.json({ error: 'Команду не знайдено' }, { status: 404 });
  return NextResponse.json({ ok: true });
}

// DELETE — прибрати команду разом з її результатами в іграх.
export async function DELETE(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  const { supabase, user, canManage } = await getEruditeAccess();

  if (!user) return NextResponse.json({ error: 'Потрібно увійти в акаунт' }, { status: 401 });
  if (!canManage) return NextResponse.json({ error: 'Недостатньо прав' }, { status: 403 });

  const { error, count } = await supabase
    .from('erudite_teams')
    .delete({ count: 'exact' })
    .eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  if (!count) return NextResponse.json({ error: 'Команду не знайдено' }, { status: 404 });
  return NextResponse.json({ ok: true });
}
