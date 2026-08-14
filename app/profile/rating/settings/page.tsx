import { redirect } from 'next/navigation';
import { getCurrentUserWithRoles, canManagePoints } from '@/lib/roles';
import PointsAwardPanel from '@/components/PointsAwardPanel';

export default async function ProfileRatingPage() {
    const { user, roles } = await getCurrentUserWithRoles();

    if (!user) redirect('/auth/login');
    if (!canManagePoints(roles)) redirect('/profile');

    return (
        <main className="bg-background min-h-screen flex flex-col font-inter">
            <div className="w-full max-w-3xl mx-auto px-5 py-10 md:py-16">
                <span className="inline-flex items-center gap-2 font-grotesk text-xs font-semibold uppercase tracking-[0.18em] text-secondary mb-3">
                    <span className="w-5 h-px bg-secondary" />
                    Кабінет редактора
                </span>
                <h1 className="font-grotesk font-bold text-3xl md:text-4xl text-primary tracking-tight mb-8">
                    Нарахування балів
                </h1>

                <PointsAwardPanel />
            </div>
        </main>
    );
}
