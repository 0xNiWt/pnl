import { redirect } from 'next/navigation';
import { getCurrentUserWithRoles, canManageNews } from '@/lib/roles';
import NewsForm from '@/components/NewsForm';
 
export default async function NewNewsPage() {
    const { user, roles } = await getCurrentUserWithRoles();
 
    if (!user) redirect('/auth/login');
    if (!canManageNews(roles)) redirect('/profile');
 
    return (
        <main className="bg-background min-h-screen flex flex-col font-inter">
            <div className="w-full max-w-2xl mx-auto px-5 py-10 md:py-16">
                <span className="inline-flex items-center gap-2 font-grotesk text-xs font-semibold uppercase tracking-[0.18em] text-secondary mb-3">
                    <span className="w-5 h-px bg-secondary" />
                    Кабінет редактора
                </span>
                <h1 className="font-grotesk font-bold text-3xl md:text-4xl text-primary tracking-tight mb-8">
                    Нова новина
                </h1>
 
                <div className="bg-primary/[0.02] border border-primary/10 rounded-2xl p-6 md:p-8">
                    <NewsForm mode="create" />
                </div>
            </div>
        </main>
    );
}
 