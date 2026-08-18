import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserWithRoles } from '@/lib/roles';

// POST — купити товар за бали.
//
// Уся перевірка (чи активний товар, чи є залишок, чи вистачає балів)
// робиться в базі функцією buy_for_points: вона ж блокує рядок товару,
// щоб дві одночасні покупки останньої футболки не пройшли обидві.
export async function POST(request: NextRequest) {
  const { supabase, user } = await getCurrentUserWithRoles();

  if (!user) {
    return NextResponse.json({ error: 'Потрібно увійти в акаунт' }, { status: 401 });
  }

  const body = await request.json();
  const productId = body?.productId;

  if (!productId || typeof productId !== 'string') {
    return NextResponse.json({ error: 'Не вказано товар' }, { status: 400 });
  }

  const { data, error } = await supabase.rpc('buy_for_points', {
    p_product_id: productId,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // Новий баланс віддаємо одразу, щоб сторінка оновила цифру без перезавантаження.
  const { data: balance } = await supabase.rpc('points_balance', { p_user: user.id });

  return NextResponse.json({ orderId: data, balance: balance ?? 0 }, { status: 201 });
}
