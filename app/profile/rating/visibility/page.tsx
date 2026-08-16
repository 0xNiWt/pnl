import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { canManageRatingVisibility, getCurrentUserWithRoles } from '@/lib/roles';
import { getRatingVisibility } from '@/lib/ratingVisibility';
import RatingVisibilityManager from '@/components/profile/RatingVisibilityManager';

export const dynamic = 'force-dynamic';

export default async function RatingVisibilityPage() {
    const { user, roles } = await getCurrentUserWithRoles();

    if (!user) redirect('/auth/login');
    if (!canManageRatingVisibility(roles)) redirect('/profile');

    const hidden = await getRatingVisibility();

    return (
        <main className="bg-background min-h-screen font-inter">
            <div className="w-full flex flex-col max-w-3xl mx-auto px-5 py-10 md:py-16">
                <Link
                    href="/profile"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-primary/60 hover:text-primary transition-colors mb-6"
                >
                    <ArrowLeft size={15} />
                    Назад до профілю
                </Link>
                <span className="inline-flex items-center gap-2 font-manrope text-xs font-semibold uppercase tracking-[0.18em] text-secondary mb-3">
                    <span className="w-5 h-px bg-secondary" />
                    Керування
                </span>
                <h1 className="font-manrope font-bold text-3xl md:text-4xl text-primary tracking-tight mb-8">
                    Видимість рейтингів
                </h1>

                <RatingVisibilityManager initial={hidden} />
            </div>
        </main>
    );
}
