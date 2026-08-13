import { createClient } from '@/lib/server';
import NewsHero from '@/components/NewsHero';
import NewsCard from '@/components/NewsCard';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';

export const revalidate = 60;

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
                {news && news.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {news.map((item) => (
                            <NewsCard
                                key={item.id}
                                slug={item.slug}
                                title={item.title}
                                excerpt={item.excerpt}
                                coverUrl={item.cover_url}
                                publishedAt={item.published_at}
                            />
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-primary/50 py-16">
                        Поки що немає опублікованих новин. Зазирніть пізніше.
                    </p>
                )}
            </section>

            <Contact />
            <Footer />
        </main>
    );
}
