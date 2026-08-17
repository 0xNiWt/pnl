import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { canManageOlympiadStats, getCurrentUserWithRoles } from '@/lib/roles';
import { getOlympiadTables } from '@/lib/olympiadStats';
import OlympiadStatsManager from '@/components/profile/OlympiadStatsManager';

export const dynamic = 'force-dynamic';

export default async function OlympiadStatsPage() {
    const { user, roles } = await getCurrentUserWithRoles();
    if (!user) redirect('/auth/login');
    if (!canManageOlympiadStats(roles)) redirect('/profile');

    const tables = await getOlympiadTables();

    return (
        <main className="bg-background min-h-screen flex flex-col font-inter">
            <div className="w-full max-w-7xl mx-auto px-5 py-10 md:py-16">

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
                        Сторінка «Про ліцей»
                    </span>
                    <h1 className="font-manrope font-bold text-3xl md:text-4xl text-primary tracking-tight">
                        Перемоги на олімпіадах
                    </h1>
                    <p className="mt-3 text-sm text-primary/60 max-w-2xl leading-relaxed">
                        Ці таблиці показуються на сторінці «Про ліцей». Можна змінювати
                        числа, додавати предмети та навчальні роки. Зміни зберігаються
                        окремо для кожної таблиці.
                    </p>
                </div>

                <OlympiadStatsManager tables={tables} />
            </div>
        </main>
    );
}
