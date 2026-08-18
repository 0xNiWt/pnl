import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Coins, ShoppingBag } from 'lucide-react';
import { createClient } from '@/lib/server';
import { getPointsBalance } from '@/lib/roles';
import { formatPoints, ORDER_STATUS_LABELS, type OrderStatus, type ShopOrder } from '@/lib/shop';

export const dynamic = 'force-dynamic';

const STATUS_STYLES: Record<OrderStatus, string> = {
    new: 'bg-accent/12 text-accent',
    issued: 'bg-secondary/15 text-secondary',
    cancelled: 'bg-primary/8 text-primary/40',
};

export default async function MyOrdersPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect('/auth/login');

    // RLS віддасть лише власні замовлення.
    const { data: orders } = await supabase
        .from('shop_orders')
        .select('id, product_id, student_id, product_title, points_spent, status, created_at, handled_at')
        .order('created_at', { ascending: false });

    const rows = (orders ?? []) as ShopOrder[];
    const balance = await getPointsBalance(user.id);
    const spent = rows
        .filter((o) => o.status !== 'cancelled')
        .reduce((sum, o) => sum + o.points_spent, 0);

    return (
        <main className="bg-background min-h-screen flex flex-col font-inter">
            <div className="w-full max-w-3xl mx-auto px-5 py-10 md:py-16">
                <Link
                    href="/profile"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-primary/60 hover:text-primary transition-colors mb-6"
                >
                    <ArrowLeft size={15} />
                    Назад до профілю
                </Link>

                <div className="mb-8">
                    <span className="inline-flex items-center gap-2 font-manrope text-xs font-semibold uppercase tracking-[0.18em] text-secondary mb-3">
                        <span className="w-5 h-px bg-secondary" />
                        Магазин
                    </span>
                    <h1 className="font-manrope font-bold text-3xl md:text-4xl text-primary tracking-tight">
                        Мої замовлення
                    </h1>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-8">
                    <div className="bg-primary/[0.02] border border-primary/10 rounded-2xl p-5">
                        <p className="flex items-center gap-1.5 text-[11px] font-manrope font-semibold uppercase tracking-wider text-primary/50">
                            <Coins size={12} className="text-accent" />
                            Баланс
                        </p>
                        <p className="text-2xl font-manrope font-bold text-primary mt-1">{balance}</p>
                    </div>
                    <div className="bg-primary/[0.02] border border-primary/10 rounded-2xl p-5">
                        <p className="flex items-center gap-1.5 text-[11px] font-manrope font-semibold uppercase tracking-wider text-primary/50">
                            <ShoppingBag size={12} className="text-secondary" />
                            Витрачено
                        </p>
                        <p className="text-2xl font-manrope font-bold text-primary mt-1">{spent}</p>
                    </div>
                </div>

                {rows.length === 0 ? (
                    <div className="bg-primary/[0.02] border border-primary/10 rounded-2xl px-6 py-12 text-center">
                        <p className="text-sm text-primary/50 mb-4">Ви ще нічого не замовляли.</p>
                        <Link
                            href="/shop"
                            className="inline-flex items-center gap-2 bg-primary text-background font-manrope font-semibold text-sm rounded-full px-5 py-2.5 hover:bg-primary/90 transition-colors"
                        >
                            <ShoppingBag size={15} />
                            До магазину
                        </Link>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {rows.map((order) => (
                            <div
                                key={order.id}
                                className="flex items-center gap-4 bg-primary/[0.02] border border-primary/10 rounded-2xl p-4"
                            >
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-semibold text-primary truncate">
                                        {order.product_title}
                                    </p>
                                    <p className="text-xs text-primary/45 mt-1">
                                        {new Date(order.created_at).toLocaleDateString('uk-UA', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric',
                                        })}
                                        {' · '}
                                        {formatPoints(order.points_spent)}
                                    </p>
                                </div>

                                <span
                                    className={`shrink-0 text-[11px] font-manrope font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full ${STATUS_STYLES[order.status]}`}
                                >
                                    {ORDER_STATUS_LABELS[order.status]}
                                </span>
                            </div>
                        ))}
                    </div>
                )}

                <p className="text-xs text-primary/40 mt-6 px-1">
                    Скасоване замовлення повертає бали на баланс. Мерч видає актив ліцею.
                </p>
            </div>
        </main>
    );
}
