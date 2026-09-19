import { createClient } from '@/lib/server';
import NewsHero from '@/components/news/NewsHero';
import NewsListWithFilter from '@/components/news/NewsListWithFilter';
import ContactWithData from '@/components/contact/ContactWithData';
import { emptyCounts, isReactionId, type ReactionId } from '@/lib/newsReactions';

export default async function NewsPage() {
    const supabase = await createClient();

    const { data: news } = await supabase
        .from('news')
        .select('id, title, slug, excerpt, cover_url, published_at')
        .eq('published', true)
        .order('published_at', { ascending: false });

    // Лічильники реакцій для карток. Якщо таблицю ще не створено — просто нулі.
    const ids = (news ?? []).map((n) => n.id);
    const { data: reactionRows } = ids.length
        ? await supabase.from('news_reactions').select('news_id, emoji').in('news_id', ids)
        : { data: [] };

    const reactions: Record<string, Record<ReactionId, number>> = {};
    for (const row of reactionRows ?? []) {
        if (!isReactionId(row.emoji)) continue;
        (reactions[row.news_id] ??= emptyCounts())[row.emoji] += 1;
    }
    const newsWithReactions = (news ?? []).map((n) => ({
        ...n,
        reactions: reactions[n.id] ?? emptyCounts(),
    }));

    return (
        <main className="paper-grid bg-background min-h-screen flex flex-col">
            <NewsHero />

            <section className="max-w-7xl mx-auto border-b border-secondary/70 px-5 md:px-6 py-10 md:py-16 w-full">
                <NewsListWithFilter initialNews={newsWithReactions} />
            </section>

            <ContactWithData />
        </main>
    );
}
