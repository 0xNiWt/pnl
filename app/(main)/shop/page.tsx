import { ShoppingCart } from 'lucide-react';
import { createClient } from '@/lib/server';
import { getPointsBalance } from '@/lib/roles';
import { PRODUCT_COLUMNS, type ShopProduct } from '@/lib/shop';
import ShopGrid from '@/components/shop/ShopGrid';
import ContactWithData from '@/components/contact/ContactWithData';

// Вітрина залежить від того, хто дивиться: баланс свій у кожного, а
// приховані товари видно лише адміністрації. Кешувати таке не можна.
export const dynamic = 'force-dynamic';

export const metadata = {
    title: 'Магазин мерчу — ПНЛ №145',
    description: 'Мерч ліцею за бали активності або за гроші.',
};

export default async function ShopPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // RLS сама сховає неактивні товари від усіх, крім адміністрації.
    const { data: products } = await supabase
        .from('shop_products')
        .select(PRODUCT_COLUMNS)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });

    const balance = user ? await getPointsBalance(user.id) : null;

    return (
        <main className="bg-background min-h-screen flex flex-col font-inter">
            <section className="w-full max-w-7xl mx-auto px-5 md:px-6 pt-10 md:pt-16">
                <div className="flex flex-col items-center text-center md:items-start md:text-left">
                    <span className="inline-flex items-center gap-2 font-manrope text-xs font-semibold uppercase tracking-[0.18em] text-secondary mb-4">
                        <span className="w-6 h-px bg-secondary" />
                        Магазин
                    </span>
                    <h1 className="font-manrope font-bold text-primary leading-[1.05] tracking-tight text-[clamp(2rem,1.6rem+2vw,3.6rem)]">
                        Мерч <span className="text-accent">ліцею</span>
                    </h1>
                    <p className="mt-5 text-base text-primary/70 max-w-[560px]">
                        Купуйте за бали, зароблені активністю в житті ліцею, або за гроші.
                        Бали списуються одразу, а мерч видає актив. Місце в рейтингу від
                        покупок не змінюється — він рахує зароблене.
                    </p>
                </div>
            </section>

            <section className="w-full max-w-7xl mx-auto px-5 md:px-6 py-10 md:py-14 flex-1">
                <h2 className="flex items-center gap-2 font-manrope font-bold text-primary text-sm uppercase tracking-wide mb-5">
                    <ShoppingCart size={16} className="text-secondary" />
                    Товари
                </h2>

                <ShopGrid
                    products={(products ?? []) as ShopProduct[]}
                    isLoggedIn={Boolean(user)}
                    balance={balance}
                />
            </section>

            <ContactWithData />
        </main>
    );
}
