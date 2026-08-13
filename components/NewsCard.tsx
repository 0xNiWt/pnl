import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

type NewsCardProps = {
    slug: string;
    title: string;
    excerpt: string | null;
    coverUrl: string | null;
    publishedAt: string | null;
};

export default function NewsCard({ slug, title, excerpt, coverUrl, publishedAt }: NewsCardProps) {
    const dateLabel = publishedAt
        ? new Date(publishedAt).toLocaleDateString('uk-UA', { day: 'numeric', month: 'long', year: 'numeric' })
        : null;

    return (
        <Link
            href={`/news/${slug}`}
            className="group flex flex-col overflow-hidden rounded-2xl border border-primary/10 bg-primary/[0.02] hover:border-primary/20 transition-colors"
        >
            <div className="relative aspect-[16/10] w-full overflow-hidden bg-primary/5">
                {coverUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={coverUrl}
                        alt={title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center font-bebas text-4xl text-primary/15">
                        ПНЛ №145
                    </div>
                )}
            </div>

            <div className="flex flex-1 flex-col gap-2.5 p-5">
                {dateLabel && (
                    <span className="font-grotesk text-xs font-semibold uppercase tracking-wider text-secondary">
                        {dateLabel}
                    </span>
                )}

                <h3 className="font-grotesk font-bold text-primary text-lg leading-snug">
                    {title}
                </h3>

                {excerpt && (
                    <p className="text-sm text-primary/60 leading-relaxed line-clamp-2">
                        {excerpt}
                    </p>
                )}

                <span className="mt-auto inline-flex items-center gap-1.5 pt-2 text-sm font-semibold text-primary/70 group-hover:text-primary transition-colors">
                    Читати
                    <ArrowUpRight size={15} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
            </div>
        </Link>
    );
}
