import { redirect, notFound } from 'next/navigation';
import { getCurrentUserWithRoles, canManageNews } from '@/lib/roles';
import NewsForm from '@/components/news/NewsForm';

type PageParams = { params: Promise<{ id: string }> };

export default async function EditNewsPage({ params }: PageParams) {
    const { id } = await params;
    const { supabase, user, roles } = await getCurrentUserWithRoles();

    if (!user) redirect('/auth/login');
    if (!canManageNews(roles)) redirect('/profile');

    const { data: article } = await supabase
        .from('news')
        .select('title, excerpt, content, cover_url, images, published')
        .eq('id', id)
        .single();

    if (!article) notFound();

    return (
        <main className="bg-background min-h-screen flex flex-col font-inter">
            <div className="w-full max-w-2xl mx-auto px-5 py-10 md:py-16">
                <span className="inline-flex items-center gap-2 font-manrope text-xs font-semibold uppercase tracking-[0.18em] text-secondary mb-3">
                    <span className="w-5 h-px bg-secondary" />
                    Кабінет редактора
                </span>
                <h1 className="font-manrope font-bold text-3xl md:text-4xl text-primary tracking-tight mb-8">
                    Редагування новини
                </h1>

                <div className="bg-primary/[0.02] border border-primary/10 rounded-2xl p-6 md:p-8">
                    <NewsForm mode="edit" newsId={id} initialData={article} />
                </div>
            </div>
        </main>
    );
}
