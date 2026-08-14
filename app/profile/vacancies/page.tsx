import { redirect } from 'next/navigation';
import { createClient } from '@/lib/server';
import { getCurrentUserWithRoles, canManageUsers } from '@/lib/roles';
import VacanciesManager from '@/components/VacanciesManager';

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
        <main className="bg-background min-h-screen flex flex-col font-inter">
            <div className="w-full max-w-3xl mx-auto px-5 py-10 md:py-16">
                <div className="mb-8">
                    <span className="inline-flex items-center gap-2 font-grotesk text-xs font-semibold uppercase tracking-[0.18em] text-secondary mb-3">
                        <span className="w-5 h-px bg-secondary" />
                        Керування
                    </span>
                    <h1 className="font-grotesk font-bold text-3xl md:text-4xl text-primary tracking-tight">
                        Вакансії
                    </h1>
                    <p className="text-sm text-primary/60 mt-2">
                        Ці вакансії показуються в блоці &quot;Вакансії&quot; на головній сторінці сайту.
                    </p>
                </div>

                <VacanciesManager initialVacancies={vacancies ?? []} />
            </div>
        </main>
    );
}
