import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { canManageManWorks, getCurrentUserWithRoles } from '@/lib/roles';
import { getManWorks } from '@/lib/manWorksData';
import ManWorksManager from '@/components/profile/ManWorksManager';

export const dynamic = 'force-dynamic';

export default async function ManAdminPage() {
    const { user, roles } = await getCurrentUserWithRoles();
    if (!user) redirect('/auth/login?redirectTo=/profile/man');
    if (!canManageManWorks(roles)) redirect('/profile');

    const works = await getManWorks();

    return (
        <main className="paper-grid bg-background min-h-screen flex flex-col font-inter">
            <div className="w-full max-w-7xl mx-auto px-5 py-10 md:py-16">

                <Link
                    href="/profile"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-primary/78 hover:text-primary transition-colors mb-6"
                >
                    <ArrowLeft size={15} />
                    Назад до профілю
                </Link>

                <div className="mb-8">
                    <span className="inline-flex items-center gap-2 font-plex text-[12px] font-semibold uppercase tracking-[0.22em] text-secondary-deep mb-3">
                        <span className="w-5 h-px bg-secondary" />
                        Розділ «Ліцей»
                    </span>
                    <h1 className="font-manrope font-bold text-3xl md:text-4xl text-primary tracking-tight">
                        Роботи МАН
                    </h1>
                    <p className="mt-3 text-sm text-primary/78 max-w-2xl leading-relaxed">
                        Тут можна додати нову наукову роботу, змінити опис чи фото,
                        переставити роботи місцями або прибрати зі сторінки. Файли
                        робіт і фото спершу покладіть у папку сайту public/man.
                    </p>
                </div>

                <ManWorksManager works={works} />
            </div>
        </main>
    );
}
