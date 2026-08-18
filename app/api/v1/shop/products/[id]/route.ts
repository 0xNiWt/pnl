import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserWithRoles, canManageShop } from '@/lib/roles';
import { cleanProduct, PRODUCT_COLUMNS } from '@/lib/shop';

type RouteParams = { params: Promise<{ id: string }> };

// PATCH — змінити картку товару.
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const { supabase, user, roles } = await getCurrentUserWithRoles();

  if (!user) {
    return NextResponse.json({ error: 'Потрібно увійти в акаунт' }, { status: 401 });
  }
  if (!canManageShop(roles)) {
    return NextResponse.json({ error: 'Недостатньо прав' }, { status: 403 });
  }

  const cleaned = cleanProduct(await request.json());
  if ('error' in cleaned) {
    return NextResponse.json({ error: cleaned.error }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('shop_products')
    .update({ ...cleaned.row, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select(PRODUCT_COLUMNS)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: `Не вдалося зберегти: ${error.message}` }, { status: 400 });
  }
  if (!data) {
    return NextResponse.json({ error: 'Товар не знайдено' }, { status: 404 });
  }

  return NextResponse.json({ product: data });
}

// DELETE — прибрати товар із магазину.
//
// Замовлення на нього лишаються: у них збережені назва й ціна на момент
// покупки, тому історія не псується (product_id просто стає порожнім).
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const { supabase, user, roles } = await getCurrentUserWithRoles();

  if (!user) {
    return NextResponse.json({ error: 'Потрібно увійти в акаунт' }, { status: 401 });
  }
  if (!canManageShop(roles)) {
    return NextResponse.json({ error: 'Недостатньо прав' }, { status: 403 });
  }

  const { data: deleted, error } = await supabase
    .from('shop_products')
    .delete()
    .eq('id', id)
    .select('id');

  if (error) {
    return NextResponse.json({ error: `Не вдалося видалити: ${error.message}` }, { status: 400 });
  }
  if (!deleted || deleted.length === 0) {
    return NextResponse.json({ error: 'Товар не знайдено' }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
