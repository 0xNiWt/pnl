import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/server';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';

export const dynamic = 'force-dynamic';

type PageParams = { params: Promise<{ slug: string }> };

export default async function NewsArticlePage({ params }: PageParams) {
    const { slug } = await params;
    const supabase = await createClient();

    const { data: article } = await supabase
        .from('news')
        .select('title, excerpt, content, cover_url, images, published, published_at')
        .eq('slug', slug)
        .single();

    if (!article || !article.published) {
        notFound();
    }

    const dateLabel = article.published_at
        ? new Date(article.published_at).toLocaleDateString('uk-UA', { day: 'numeric', month: 'long', year: 'numeric' })
        : null;

    const images: string[] = (article.images && article.images.length > 0)
        ? article.images
        : article.cover_url
            ? [article.cover_url]
            : [];

    const [mainImage, ...galleryImages] = images;

    return (
        <main className="bg-background min-h-screen flex flex-col font-inter">
            <article className="max-w-3xl mx-auto w-full px-5 md:px-6 py-10 md:py-16">
                <Link
                    href="/news"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary/60 hover:text-primary transition-colors mb-8"
                >
                    <ArrowLeft size={15} />
                    Усі новини
                </Link>

                {dateLabel && (
                    <span className="inline-flex items-center gap-2 font-grotesk text-xs font-semibold uppercase tracking-wider text-secondary mb-3">
                        {dateLabel}
                    </span>
                )}

                <h1 className="font-grotesk font-bold text-primary text-3xl md:text-4xl tracking-tight leading-tight mb-6">
                    {article.title}
                </h1>

                {mainImage && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={mainImage}
                        alt={article.title}
                        className="w-full aspect-[16/9] object-cover rounded-2xl mb-8"
                    />
                )}

                <div className="flex flex-col gap-4 text-base text-primary/80 leading-relaxed">
                    {article.content.split('\n').filter(Boolean).map((paragraph: string, i: number) => (
                        <p key={i}>{paragraph}</p>
                    ))}
                </div>

                {galleryImages.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-8">
                        {galleryImages.map((src, i) => (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                key={i}
                                src={src}
                                alt={`${article.title} — фото ${i + 2}`}
                                className="w-full aspect-square object-cover rounded-xl"
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
