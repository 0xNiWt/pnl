import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { canManageMemoryBook, getCurrentUserWithRoles } from '@/lib/roles';
import { getMemoryEntries } from '@/lib/memoryBook';
import MemoryBookManager from '@/components/profile/MemoryBookManager';

export const dynamic = 'force-dynamic';

export default async function MemoryBookPage() {
    const { user, roles } = await getCurrentUserWithRoles();
    if (!user) redirect('/auth/login');
    if (!canManageMemoryBook(roles)) redirect('/profile');

    const entries = await getMemoryEntries();

    return (
        <main className="bg-background min-h-screen flex flex-col font-inter">
            <div className="w-full max-w-5xl mx-auto px-5 py-10 md:py-16">

                <Link
                    href="/profile"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-primary/60 hover:text-primary transition-colors mb-6"
                >
                    <ArrowLeft size={15} />
                    Назад до профілю
                </Link>

                <div className="mb-8">
                    <span className="inline-flex items-center gap-2 font-manrope text-xs font-semibold uppercase tracking-[0.18em] text-secondary mb-3">
                        <span className="w-5 h-px bg-secondary" />
                        Сторінка «Книга пам’яті»
                    </span>
                    <h1 className="font-manrope font-bold text-3xl md:text-4xl text-primary tracking-tight">
                        Книга пам’яті
                    </h1>
                    <p className="mt-3 text-sm text-primary/60 max-w-2xl leading-relaxed">
                        Записи показуються на сторінці ліцею. Можна додавати нових людей,
                        правити історії та прибирати помилкові записи.
                    </p>
                </div>

                <MemoryBookManager entries={entries} />
            </div>
        </main>
    );
}
