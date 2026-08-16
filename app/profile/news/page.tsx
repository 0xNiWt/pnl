import { redirect } from 'next/navigation';
import Link from 'next/link';
import { FileEdit, ArrowLeft } from 'lucide-react';
import { getCurrentUserWithRoles, canManageNews } from '@/lib/roles';
import NewsAdminList from '@/components/news/NewsAdminList';
 
export default async function ProfileNewsPage() {
    const { supabase, user, roles } = await getCurrentUserWithRoles();
 
    if (!user) redirect('/auth/login');
    if (!canManageNews(roles)) redirect('/profile');
 
    const { data: news } = await supabase
        .from('news')
        .select('id, title, slug, published, published_at, created_at')
        .order('created_at', { ascending: false });
 
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
                <div className="flex items-center justify-between gap-4 mb-8">
                    <div>
                        <span className="inline-flex items-center gap-2 font-manrope text-xs font-semibold uppercase tracking-[0.18em] text-secondary mb-3">
                            <span className="w-5 h-px bg-secondary" />
                            Кабінет редактора
                        </span>
                        <h1 className="font-manrope font-bold text-3xl md:text-4xl text-primary tracking-tight">
                            Керування новинами
                        </h1>
                    </div>
 
                    <Link
                        href="/profile/news/new"
                        className="flex-shrink-0 flex items-center gap-2 rounded-xl bg-primary py-3 px-5 text-sm font-bold text-background tracking-wide hover:bg-primary/90 active:scale-[0.99] transition-all"
                    >
                        <FileEdit size={16} />
                        Створити
                    </Link>
                </div>
 
                <div className="bg-primary/[0.02] border border-primary/10 rounded-2xl px-6">
                    <NewsAdminList items={news ?? []} />
                </div>
            </div>
        </main>
    );
}
 