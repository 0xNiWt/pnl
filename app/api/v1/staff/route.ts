import { NextRequest, NextResponse } from 'next/server';
import { canManageStaff, getCurrentUserWithRoles } from '@/lib/roles';

// POST — додати педагога. Нова кафедра з'являється сама: достатньо вписати
// її назву, і вчитель стане першим у ній.
export async function POST(request: NextRequest) {
  const { supabase, user, roles } = await getCurrentUserWithRoles();

  if (!user) {
    return NextResponse.json({ error: 'Потрібно увійти в акаунт' }, { status: 401 });
  }
  if (!canManageStaff(roles)) {
    return NextResponse.json({ error: 'Недостатньо прав' }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const { department, name, position, photoUrl } = body as {
    department?: string;
    name?: string;
    position?: string;
    photoUrl?: string;
  };

  if (!name?.trim()) {
    return NextResponse.json({ error: 'Вкажіть прізвище, ім’я та по батькові' }, { status: 400 });
  }
  if (!department?.trim()) {
    return NextResponse.json({ error: 'Оберіть або впишіть кафедру' }, { status: 400 });
  }

  // Порядок кафедри беремо в тих, хто в ній уже є; нова стає в кінець.
  const [{ data: sameDept }, { data: lastDept }] = await Promise.all([
    supabase
      .from('staff_members')
      .select('dept_order, sort_order')
      .eq('department', department.trim())
      .order('sort_order', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from('staff_members')
      .select('dept_order')
      .order('dept_order', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const { data, error } = await supabase
    .from('staff_members')
    .insert({
      department: department.trim(),
      dept_order: sameDept?.dept_order ?? (lastDept?.dept_order ?? 0) + 10,
      name: name.trim(),
      position: position?.trim() || '',
      photo_url: photoUrl?.trim() || null,
      sort_order: (sameDept?.sort_order ?? 0) + 10,
    })
    .select('id')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ id: data.id }, { status: 201 });
}
