import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/server';
import ContactWithData from '@/components/ContactWithData';
import Footer from '@/components/Footer';

// ISR: сторінка кешується на CDN Vercel і оновлюється не частіше
// ніж раз на 5 хвилин (revalidate у секундах). Це офіційний підхід
// Next.js для сторінок з базою даних, що змінюється нечасто:
// https://nextjs.org/docs/app/building-your-application/data-fetching/incremental-static-regeneration
export const revalidate = 300;

// dynamicParams: true (за замовчуванням) — дозволяє відкривати
// сторінки нових новин "на льоту" навіть якщо вони не були відомі
// на момент білда; після першого відкриття Vercel закешує результат.
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

// generateMetadata — офіційний спосіб Next.js задати <title> та
// опис для соцмереж/пошукових систем окремо для кожної новини.
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

    // ---- Змінні для шаблону (замість "хардкоду" — усе з БД) ----
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
    // ---------------------------------------------------------------

    return (
        <main className="bg-background min-h-screen flex flex-col font-inter">
            {/* Mobile-first: базові відступи менші, на md: і більше — ширші */}
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

                {/* Mobile-first: text-2xl база, зростає до text-4xl на md */}
                <h1 className="font-grotesk font-bold text-primary text-2xl sm:text-3xl md:text-4xl tracking-tight leading-tight mb-5 md:mb-6">
                    {title}
                </h1>

                {mainImage && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={mainImage}
                        alt={title}
                        className="w-full aspect-[4/3] sm:aspect-[16/9] object-cover rounded-xl md:rounded-2xl mb-6 md:mb-8"
                    />
                )}

                <div className="flex flex-col gap-3.5 md:gap-4 text-[15px] md:text-base text-primary/80 leading-relaxed">
                    {paragraphs.map((paragraph, i) => (
                        <p key={i}>{paragraph}</p>
                    ))}
                </div>

                {galleryImages.length > 0 && (
                    // Mobile-first: 2 колонки на телефоні, 3 — від sm: і ширше
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

            <ContactWithData />
            <Footer />
        </main>
    );
}
