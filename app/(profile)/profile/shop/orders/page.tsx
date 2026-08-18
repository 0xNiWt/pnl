import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Package } from 'lucide-react';
import { getCurrentUserWithRoles, canManageShop } from '@/lib/roles';
import type { ShopOrder } from '@/lib/shop';
import ShopOrdersList, { type OrderRow } from '@/components/shop/ShopOrdersList';

export const dynamic = 'force-dynamic';

export default async function ShopOrdersPage() {
    const { supabase, user, roles } = await getCurrentUserWithRoles();

    if (!user) redirect('/auth/login');
    if (!canManageShop(roles)) redirect('/profile');

    const { data: orders } = await supabase
        .from('shop_orders')
        .select('id, product_id, student_id, product_title, points_spent, status, created_at, handled_at')
        .order('created_at', { ascending: false });

    const rows = (orders ?? []) as ShopOrder[];

    // Імена покупців тягнемо окремим запитом: у замовленні лежить лише id.
    const studentIds = Array.from(new Set(rows.map((o) => o.student_id)));
    const { data: profiles } = studentIds.length
        ? await supabase.from('profiles').select('id, full_name, class').in('id', studentIds)
        : { data: [] };

    const byId = new Map(
        (profiles ?? []).map((p) => [p.id, { name: p.full_name as string | null, cls: p.class as string | null }])
    );

    const withNames: OrderRow[] = rows.map((order) => ({
        ...order,
        student_name: byId.get(order.student_id)?.name ?? 'Невідомий учень',
        student_class: byId.get(order.student_id)?.cls ?? null,
    }));

    return (
        <main className="bg-background min-h-screen flex flex-col font-inter">
            <div className="w-full max-w-4xl mx-auto px-5 py-10 md:py-16">
                <Link
                    href="/profile/shop"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-primary/60 hover:text-primary transition-colors mb-6"
                >
                    <ArrowLeft size={15} />
                    Назад до товарів
                </Link>

                <div className="mb-8">
                    <span className="inline-flex items-center gap-2 font-manrope text-xs font-semibold uppercase tracking-[0.18em] text-secondary mb-3">
                        <span className="w-5 h-px bg-secondary" />
                        Магазин
                    </span>
                    <h1 className="flex items-center gap-2.5 font-manrope font-bold text-3xl md:text-4xl text-primary tracking-tight">
                        <Package size={28} className="text-secondary" />
                        Замовлення за бали
                    </h1>
                    <p className="text-sm text-primary/50 mt-2 max-w-xl">
                        Покупки за гроші сюди не потрапляють — вони йдуть через Google-форму.
                    </p>
                </div>

                <ShopOrdersList initialOrders={withNames} />
            </div>
        </main>
    );
}
