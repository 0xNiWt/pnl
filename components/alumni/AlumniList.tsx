'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { ExternalLink, Search, X } from 'lucide-react';
import { initials, matchesQuery, type Alum } from '@/lib/alumni';

/**
 * Випускники — сітка карток, як у новинах: фото зверху, під ним імʼя,
 * ким людина є зараз і роки навчання в ліцеї.
 */
export default function AlumniList({ alumni }: { alumni: Alum[] }) {
    const [query, setQuery] = useState('');

    const found = useMemo(
        () => alumni.filter((a) => matchesQuery(a, query)),
        [alumni, query]
    );

    if (alumni.length === 0) {
        return (
            <section className="w-full max-w-7xl mx-auto px-5 md:px-6 py-16 text-center">
                <p className="text-primary/70">Список випускників скоро зʼявиться тут.</p>
            </section>
        );
    }

    return (
        <section className="w-full max-w-7xl mx-auto border-b border-secondary/70 px-5 md:px-6 py-10 md:py-16" id="alumni-list">
            <div className="relative max-w-md mb-8">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/45" />
                <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Пошук за імʼям чи фахом"
                    className="w-full rounded-none border border-secondary/70 bg-background pl-11 pr-10 py-2.5 text-sm text-primary placeholder:text-primary/40 outline-none focus:border-secondary-deep transition-colors"
                />
                {query && (
                    <button
                        type="button"
                        onClick={() => setQuery('')}
                        aria-label="Очистити пошук"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-primary/45 hover:text-primary"
                    >
                        <X size={16} />
                    </button>
                )}
            </div>

            {found.length === 0 ? (
                <p className="py-10 text-center text-sm text-primary/70">
                    За таким запитом нікого не знайшлося.
                </p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {found.map((alum) => <AlumCard key={alum.id} alum={alum} />)}
                </div>
            )}
        </section>
    );
}

function AlumCard({ alum }: { alum: Alum }) {
    return (
        <article className="group flex flex-col overflow-hidden rounded-none border border-secondary/70 bg-secondary/[0.3]">
            <div className="relative aspect-[16/10] w-full overflow-hidden bg-primary/5">
                {alum.photo_url ? (
                    <Image
                        src={alum.photo_url}
                        alt={alum.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
                        loading="lazy"
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center font-cormorant font-bold text-5xl text-primary/25">
                        {initials(alum.name)}
                    </div>
                )}
            </div>

            <div className="flex flex-1 flex-col gap-2.5 p-5">
                {alum.years && (
                    <span className="font-plex text-xs font-semibold uppercase tracking-wider text-secondary-deep">
                        Навчання в ліцеї · {alum.years}
                    </span>
                )}

                <h2 className="font-cormorant font-bold text-primary text-xl leading-snug">
                    {alum.name}
                </h2>

                {alum.headline && (
                    <p className="text-sm font-semibold text-primary/85 leading-snug">
                        {alum.headline}
                    </p>
                )}

                {alum.bio && (
                    <p className="text-sm text-primary/78 leading-relaxed">
                        {alum.bio}
                    </p>
                )}

                {alum.link_url && (
                    <a
                        href={alum.link_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-auto inline-flex items-center gap-1.5 pt-2 text-sm font-semibold text-primary/85 hover:text-primary transition-colors"
                    >
                        Докладніше
                        <ExternalLink size={14} />
                    </a>
                )}
            </div>
        </article>
    );
}
