import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserWithRoles, canManageShop } from '@/lib/roles';
import { isOrderStatus } from '@/lib/shop';

// PATCH — позначити замовлення виданим, скасованим або повернути в чергу.
//
// Скасування повертає бали саме собою: баланс рахує лише незаскасовані
// замовлення, тож окремої зворотної операції не потрібно.
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { supabase, user, roles } = await getCurrentUserWithRoles();

  if (!user) {
    return NextResponse.json({ error: 'Потрібно увійти в акаунт' }, { status: 401 });
  }
  if (!canManageShop(roles)) {
    return NextResponse.json({ error: 'Недостатньо прав' }, { status: 403 });
  }

  const body = await request.json();
  const status = body?.status;

  if (!isOrderStatus(status)) {
    return NextResponse.json({ error: 'Невідомий статус замовлення' }, { status: 400 });
  }

  const { error } = await supabase.rpc('set_shop_order_status', {
    p_order_id: id,
    p_status: status,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, status });
}
