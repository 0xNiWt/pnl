import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/server';
import ContactWithData from '@/components/contact/ContactWithData';
import NewsReactions from '@/components/news/NewsReactions';
export const revalidate = 300;
export const dynamicParams = true;
type PageParams = { params: Promise<{ slug: string }> };

async function getArticle(slug: string) {
    const supabase = await createClient();
    const normalizedSlug = decodeURIComponent(slug).normalize('NFC');

    const { data } = await supabase
        .from('news')
        .select('id, title, excerpt, content, cover_url, images, published, published_at')
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
        <main className="paper-grid bg-background min-h-screen flex flex-col font-inter">
            <article className="max-w-3xl mx-auto w-full px-4 py-8 sm:px-5 md:px-6 md:py-16">
                
                <div className="flex justify-between items-center mb-6 md:mb-8">
                    <Link
                        href="/news"
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary/78 hover:text-primary transition-colors"
                    >
                        <ArrowLeft size={15} />
                        Усі новини
                    </Link>

                    {dateLabel && (
                        <span className="inline-flex items-center gap-2 font-plex text-xs font-semibold uppercase tracking-wider text-accent">
                            {dateLabel}
                        </span>
                    )}
                </div>

                <h1 className="font-manrope font-bold text-primary text-2xl sm:text-3xl md:text-4xl tracking-tight leading-tight mb-5 md:mb-6">
                    {title}
                </h1>

                {mainImage && (
                    // width/height задають лише пропорцію до завантаження; далі
                    // h-auto віддає висоту самому знімку, тож кадр не ріжеться.
                    <Image
                        src={mainImage}
                        alt={title}
                        width={1600}
                        height={1200}
                        className="mb-6 h-auto w-full bg-primary/5 md:mb-8"
                        sizes="(max-width: 768px) 100vw, 768px"
                        priority
                    />
                )}

                <div className="flex flex-col gap-3.5 md:gap-4 text-[15px] md:text-base text-primary/90 leading-relaxed">
                    {paragraphs.map((paragraph: string, i: number) => (
                        <p key={i}>{paragraph}</p>
                    ))}
                </div>

                {galleryImages.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 items-start gap-2.5 md:gap-3 mt-6 md:mt-8">
                        {galleryImages.map((src, i) => (
                            <Image
                                key={i}
                                src={src}
                                alt={`${title} — фото ${i + 2}`}
                                width={1200}
                                height={900}
                                className="h-auto w-full bg-primary/5"
                                sizes="(max-width: 640px) 50vw, 33vw"
                            />
                        ))}
                    </div>
                )}

                <NewsReactions newsId={article.id} />
            </article>

            <ContactWithData />
        </main>
    );
}
