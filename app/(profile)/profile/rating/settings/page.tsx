import { redirect } from 'next/navigation';
import { getCurrentUserWithRoles, canManagePoints } from '@/lib/roles';
import PointsAwardPanel from '@/components/profile/PointsAwardPanel';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default async function ProfileRatingPage() {
    const { user, roles } = await getCurrentUserWithRoles();

    if (!user) redirect('/auth/login');
    if (!canManagePoints(roles)) redirect('/profile');

    return (
        <main className="paper-grid bg-background min-h-screen font-inter">
            <div className="w-full flex flex-col max-w-7xl mx-auto px-5 py-10 md:py-16">
                <Link
                    href="/profile"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-primary/78 hover:text-primary transition-colors mb-6"
                >
                    <ArrowLeft size={15} />
                    Назад до профілю
                </Link>
                <span className="inline-flex items-center gap-2 font-plex text-[clamp(1rem,0.7rem+1vw,1.5rem)] font-bold uppercase tracking-[0.14em] text-secondary-deep mb-3">
                    <span className="w-10 h-0.5 bg-secondary" />
                    Кабінет нарахувань
                </span>
                <h1 className="font-manrope font-bold text-3xl md:text-4xl text-primary tracking-tight mb-8">
                    Нарахування балів
                </h1>

                <PointsAwardPanel />
            </div>
        </main>
    );
}
