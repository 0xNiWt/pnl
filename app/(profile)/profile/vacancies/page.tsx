import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/server';
import { getCurrentUserWithRoles, canManageUsers } from '@/lib/roles';
import VacanciesManager from '@/components/profile/VacanciesManager';

export default async function VacanciesAdminPage() {
    const { user, roles } = await getCurrentUserWithRoles();

    if (!user) redirect('/auth/login');
    if (!canManageUsers(roles)) redirect('/profile');

    const supabase = await createClient();
    const { data: vacancies } = await supabase
        .from('vacancies')
        .select('id, title, url, sort_order')
        .order('sort_order', { ascending: true });

    return (
        <main className="paper-grid bg-background min-h-screen font-inter">
            <div className="w-full max-w-7xl mx-auto px-5 py-10 md:py-16">
                <div className="flex flex-col mb-8">
                    <Link
                        href="/profile"
                        className="inline-flex items-center gap-2 text-sm font-semibold text-primary/78 hover:text-primary transition-colors mb-6"
                    >
                        <ArrowLeft size={15} />
                        Назад до профілю
                    </Link>
                    <span className="inline-flex items-center gap-2 font-plex text-[clamp(1rem,0.7rem+1vw,1.5rem)] font-bold uppercase tracking-[0.14em] text-secondary-deep mb-3">
                        <span className="w-10 h-0.5 bg-secondary" />
                        Керування
                    </span>
                    <h1 className="font-manrope font-bold text-3xl md:text-4xl text-primary tracking-tight">
                        Вакансії
                    </h1>
                    <p className="text-sm text-primary/78 mt-2">
                        Ці вакансії показуються в блоці &quot;Вакансії&quot; на головній сторінці сайту.
                    </p>
                </div>

                <VacanciesManager initialVacancies={vacancies ?? []} />
            </div>
        </main>
    );
}
