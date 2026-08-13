import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/server';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';

export const revalidate = 300;
export const dynamicParams = true;

type PageParams = { params: Promise<{ slug: string }> };

async function getArticle(slug: string) {
    const supabase = await createClient();

    // Приводимо кириличний slug до єдиної "нормальної" форми Unicode
    // (NFC). Без цього однаково виглядні літери (наприклад "і") можуть
    // зберігатись по-різному в URL і в базі даних, і порівняння
    // .eq('slug', slug) мовчки не спрацює навіть для правильного slug.
    const normalizedSlug = decodeURIComponent(slug).normalize('NFC');

    const { data } = await supabase
        .from('news')
        .select('title, excerpt, content, cover_url, images, published, published_at')
        .eq('slug', normalizedSlug)
        .single();

    return data;
}

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
    const { slug } = await params;
    const article = await getArticle(slug);

    if (!article || !article.published) {
        return { title: 'Новину не знайдено — ПНЛ №145' };
    }

    return {
        title: `${article.title} — ПНЛ №145`,
        description: article.excerpt ?? undefined,
        openGraph: {
            title: article.title,
            description: article.excerpt ?? undefined,
            images: article.cover_url ? [article.cover_url] : undefined,
        },
    };
}

export default async function NewsArticlePage({ params }: PageParams) {
    const { slug } = await params;
    const article = await getArticle(slug);

    if (!article || !article.published) {
        notFound();
    }

    const title = article.title;
    const dateLabel = article.published_at
        ? new Date(article.published_at).toLocaleDateString('uk-UA', { day: 'numeric', month: 'long', year: 'numeric' })
        : null;
    const paragraphs = article.content.split('\n').filter(Boolean);
    const images: string[] = (article.images && article.images.length > 0)
        ? article.images
        : article.cover_url
            ? [article.cover_url]
            : [];
    const [mainImage, ...galleryImages] = images;

    return (
        <main className="bg-background min-h-screen flex flex-col font-inter">
            <article className="max-w-3xl mx-auto w-full px-4 py-8 sm:px-5 md:px-6 md:py-16">
                <Link
                    href="/news"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary/60 hover:text-primary transition-colors mb-6 md:mb-8"
                >
                    <ArrowLeft size={15} />
                    Усі новини
                </Link>

                {dateLabel && (
                    <span className="inline-flex items-center gap-2 font-grotesk text-xs font-semibold uppercase tracking-wider text-secondary mb-2 md:mb-3">
                        {dateLabel}
                    </span>
                )}

                <h1 className="font-grotesk font-bold text-primary text-2xl sm:text-3xl md:text-4xl tracking-tight leading-tight mb-5 md:mb-6">
                    {title}
                </h1>

                {mainImage && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={mainImage}
                        alt={title}
                        className="w-full h-auto object-cover rounded-xl md:rounded-2xl mb-6 md:mb-8"
                    />
                )}

                <div className="flex flex-col gap-3.5 md:gap-4 text-[15px] md:text-base text-primary/80 leading-relaxed">
                 {paragraphs.map((paragraph: string, i: number) => (
                        <p key={i}>{paragraph}</p>
                    ))}
                </div>

                {galleryImages.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 md:gap-3 mt-6 md:mt-8">
                        {galleryImages.map((src, i) => (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                key={i}
                                src={src}
                                alt={`${title} — фото ${i + 2}`}
                                className="w-full aspect-square object-cover rounded-lg md:rounded-xl"
                            />
                        ))}
                    </div>
                )}
            </article>

            <Contact />
            <Footer />
        </main>
    );
}