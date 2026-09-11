import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { canManageRatingVisibility, getCurrentUserWithRoles } from '@/lib/roles';
import { getRatingVisibility } from '@/lib/ratingVisibility';
import { isRatingConsentEnforced } from '@/lib/appSettings';
import { createClient } from '@/lib/server';
import RatingVisibilityManager from '@/components/profile/RatingVisibilityManager';
import RatingConsentPolicy from '@/components/profile/RatingConsentPolicy';

export const dynamic = 'force-dynamic';

export default async function RatingVisibilityPage() {
    const { user, roles } = await getCurrentUserWithRoles();

    if (!user) redirect('/auth/login');
    if (!canManageRatingVisibility(roles)) redirect('/profile');

    const supabase = await createClient();

    const [hidden, enforced, totalRes, consentedRes] = await Promise.all([
        getRatingVisibility(),
        isRatingConsentEnforced(),
        supabase
            .from('profiles')
            .select('id', { count: 'exact', head: true })
            .not('class', 'is', null),
        // Порахувати згоди можна лише після міграції 0016 — доти запит
        // поверне помилку, і ми просто покажемо нуль.
        supabase
            .from('profiles')
            .select('id', { count: 'exact', head: true })
            .not('class', 'is', null)
            .not('rating_consent_at', 'is', null)
            .is('rating_consent_revoked_at', null),
    ]);

    return (
        <main className="paper-grid bg-background min-h-screen font-inter">
            <div className="w-full flex flex-col max-w-3xl mx-auto px-5 py-10 md:py-16">
                <Link
                    href="/profile"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-primary/60 hover:text-primary transition-colors mb-6"
                >
                    <ArrowLeft size={15} />
                    Назад до профілю
                </Link>
                <span className="inline-flex items-center gap-2 font-plex text-[10px] uppercase tracking-[0.22em] text-primary/45 mb-3">
                    <span className="w-5 h-px bg-accent" />
                    Керування
                </span>
                <h1 className="font-manrope font-bold text-3xl md:text-4xl text-primary tracking-tight mb-8">
                    Видимість рейтингів
                </h1>

                <RatingVisibilityManager initial={hidden} />

                <h2 className="font-manrope font-bold text-2xl text-primary tracking-tight mt-12 mb-2">
                    Згода на участь у рейтингах
                </h2>
                <p className="text-sm text-primary/60 mb-6 max-w-2xl">
                    П. 10.1.2 Положення: обробка даних і включення учня до будь-яких
                    ліцейських рейтингів можливі лише за його добровільною згодою.
                </p>

                <RatingConsentPolicy
                    initialEnforced={enforced}
                    consented={consentedRes.count ?? 0}
                    totalStudents={totalRes.count ?? 0}
                />
            </div>
        </main>
    );
}
