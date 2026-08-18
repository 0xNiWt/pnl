import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserWithRoles, canManageShop } from '@/lib/roles';
import { cleanProduct, PRODUCT_COLUMNS } from '@/lib/shop';

// GET — список товарів. Приховані бачить лише адміністрація: про це дбає RLS.
export async function GET() {
  const { supabase } = await getCurrentUserWithRoles();

  const { data, error } = await supabase
    .from('shop_products')
    .select(PRODUCT_COLUMNS)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: 'Не вдалося завантажити товари' }, { status: 500 });
  }

  return NextResponse.json({ products: data });
}

// POST — додати товар (адміністрація або модератор).
export async function POST(request: NextRequest) {
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

  // Новий товар стає в кінець вітрини.
  const { data: last } = await supabase
    .from('shop_products')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data, error } = await supabase
    .from('shop_products')
    .insert({ ...cleaned.row, sort_order: (last?.sort_order ?? 0) + 1 })
    .select(PRODUCT_COLUMNS)
    .single();

  if (error) {
    return NextResponse.json({ error: `Не вдалося додати товар: ${error.message}` }, { status: 400 });
  }

  return NextResponse.json({ product: data }, { status: 201 });
}
