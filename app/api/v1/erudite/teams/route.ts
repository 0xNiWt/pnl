import { NextRequest, NextResponse } from 'next/server';
import { getEruditeAccess } from '@/lib/eruditeData';
import { parseTeamPayload } from '../teamPayload';

// POST — створити команду. Право перевіряє і цей роут, і RLS у базі.
export async function POST(request: NextRequest) {
  const { supabase, user, canManage } = await getEruditeAccess();

  if (!user) return NextResponse.json({ error: 'Потрібно увійти в акаунт' }, { status: 401 });
  if (!canManage) return NextResponse.json({ error: 'Недостатньо прав' }, { status: 403 });

  const parsed = parseTeamPayload(await request.json());
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

  const { data, error } = await supabase
    .from('erudite_teams')
    .insert(parsed.value)
    .select('id')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ id: data.id }, { status: 201 });
}
