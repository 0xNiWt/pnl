import { createClient } from '@/lib/server';
import NewsHero from '@/components/news/NewsHero';
import NewsListWithFilter from '@/components/news/NewsListWithFilter';
import ContactWithData from '@/components/contact/ContactWithData';

export const dynamic = 'force-dynamic';

export default async function NewsPage() {
    const supabase = await createClient();

    const { data: news } = await supabase
        .from('news')
        .select('id, title, slug, excerpt, cover_url, published_at')
        .eq('published', true)
        .order('published_at', { ascending: false });

    return (
        <main className="bg-background min-h-screen flex flex-col">
            <NewsHero />

            <section className="max-w-7xl mx-auto border-b border-gray-800/20 px-5 md:px-6 py-10 md:py-16 w-full">
                <NewsListWithFilter initialNews={news ?? []} />
            </section>

            <ContactWithData />
        </main>
    );
}
