import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { REACTIONS, type ReactionId } from '@/lib/newsReactions';

type NewsCardProps = {
    slug: string;
    title: string;
    excerpt: string | null;
    coverUrl: string | null;
    publishedAt: string | null;
    reactions?: Record<ReactionId, number>;
};

export default function NewsCard({ slug, title, excerpt, coverUrl, publishedAt, reactions }: NewsCardProps) {
    const dateLabel = publishedAt
        ? new Date(publishedAt).toLocaleDateString('uk-UA', { day: 'numeric', month: 'long', year: 'numeric' })
        : null;

    return (
        <Link
            href={`/news/${slug}`}
            className="group flex flex-col overflow-hidden rounded-none border border-secondary/70 bg-secondary/[0.3] hover:border-secondary/60 transition-colors"
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
                    <div className="flex h-full w-full items-center justify-center font-cormorant text-4xl text-primary/15">
                        ПНЛ №145
                    </div>
                )}
            </div>

            <div className="flex flex-1 flex-col gap-2.5 p-5">
                {dateLabel && (
                    <span className="font-plex text-xs font-semibold uppercase tracking-wider text-primary">
                        {dateLabel}
                    </span>
                )}

                <h3 className="font-cormorant font-bold text-primary text-xl leading-snug">
                    {title}
                </h3>

                {excerpt && (
                    <p className="text-sm text-primary/78 leading-relaxed line-clamp-2">
                        {excerpt}
                    </p>
                )}

                <span className="mt-auto inline-flex items-center gap-1.5 pt-2 text-sm font-semibold text-primary/85 group-hover:text-primary transition-colors">
                    Читати
                    <ArrowUpRight size={15} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
            </div>

            {/* Реакції читачів — лише показ; поставити реакцію можна на сторінці новини. */}
            {reactions && (
                <div
                    className="flex items-center justify-between gap-1 border-t border-secondary/70 bg-background/60 px-4 py-2.5"
                    aria-label="Реакції читачів"
                >
                    {REACTIONS.map((r) => (
                        <span
                            key={r.id}
                            title={r.label}
                            className={`inline-flex items-center gap-1.5 ${reactions[r.id] ? 'text-primary' : 'text-primary/45'}`}
                        >
                            <span className="text-lg leading-none" aria-hidden>{r.emoji}</span>
                            <span className="font-plex text-sm font-bold tabular-nums">{reactions[r.id]}</span>
                        </span>
                    ))}
                </div>
            )}
        </Link>
    );
}
