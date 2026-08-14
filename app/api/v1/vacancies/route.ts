import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserWithRoles, canManageUsers } from '@/lib/roles';

export async function GET() {
  const { supabase } = await getCurrentUserWithRoles();

  const { data, error } = await supabase
    .from('vacancies')
    .select('id, title, url, sort_order, created_at')
    .order('sort_order', { ascending: true });

  if (error) {
    return NextResponse.json({ error: 'Не вдалося завантажити вакансії' }, { status: 500 });
  }

  return NextResponse.json({ vacancies: data });
}

export async function POST(request: NextRequest) {
  const { supabase, user, roles } = await getCurrentUserWithRoles();

  if (!user) {
    return NextResponse.json({ error: 'Потрібна авторизація' }, { status: 401 });
  }

  if (!canManageUsers(roles)) {
    return NextResponse.json({ error: 'Недостатньо прав' }, { status: 403 });
  }

  const body = await request.json();
  const { title, url, sortOrder } = body as { title?: string; url?: string; sortOrder?: number };

  if (!title || !url) {
    return NextResponse.json({ error: "Назва та посилання обов'язкові" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('vacancies')
    .insert({ title, url, sort_order: sortOrder ?? 0 })
    .select('id, title, url, sort_order')
    .single();

  if (error) {
    return NextResponse.json({ error: 'Не вдалося створити вакансію' }, { status: 500 });
  }

  return NextResponse.json({ vacancy: data }, { status: 201 });
}
