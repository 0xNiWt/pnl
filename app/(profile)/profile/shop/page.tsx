import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ClipboardList } from 'lucide-react';
import { getCurrentUserWithRoles, canManageShop } from '@/lib/roles';
import { PRODUCT_COLUMNS, type ShopProduct } from '@/lib/shop';
import ShopProductsManager from '@/components/shop/ShopProductsManager';

export const dynamic = 'force-dynamic';

export default async function ProfileShopPage() {
    const { supabase, user, roles } = await getCurrentUserWithRoles();

    if (!user) redirect('/auth/login');
    if (!canManageShop(roles)) redirect('/profile');

    const { data: products } = await supabase
        .from('shop_products')
        .select(PRODUCT_COLUMNS)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });

    return (
        <main className="bg-background min-h-screen flex flex-col font-inter">
            <div className="w-full max-w-4xl mx-auto px-5 py-10 md:py-16">
                <Link
                    href="/profile"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-primary/60 hover:text-primary transition-colors mb-6"
                >
                    <ArrowLeft size={15} />
                    Назад до профілю
                </Link>

                <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
                    <div>
                        <span className="inline-flex items-center gap-2 font-manrope text-xs font-semibold uppercase tracking-[0.18em] text-secondary mb-3">
                            <span className="w-5 h-px bg-secondary" />
                            Магазин
                        </span>
                        <h1 className="font-manrope font-bold text-3xl md:text-4xl text-primary tracking-tight">
                            Товари магазину
                        </h1>
                        <p className="text-sm text-primary/50 mt-2 max-w-xl">
                            Товар може продаватися за бали, за гроші або двома способами
                            одразу. Порожня ціна означає, що цим способом товар не продається.
                        </p>
                    </div>

                    <Link
                        href="/profile/shop/orders"
                        className="inline-flex items-center gap-2 rounded-full border border-primary/20 px-5 py-2.5 text-sm font-manrope font-semibold text-primary hover:bg-primary/5 transition-colors"
                    >
                        <ClipboardList size={15} />
                        Замовлення
                    </Link>
                </div>

                <ShopProductsManager initialProducts={(products ?? []) as ShopProduct[]} />
            </div>
        </main>
    );
}
