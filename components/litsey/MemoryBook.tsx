'use client';

import { useMemo, useState } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { Download, ExternalLink, Search, User, X } from "lucide-react";
import {
    MEMORY_BOOK_PDF,
    MEMORY_BOOK_TITLE,
    matchesQuery,
    type MemoryEntry,
} from "@/lib/memory";

const smoothOut = [0.16, 1, 0.3, 1] as const;
const PAGE_SIZE = 24;

export default function MemoryBook({ entries }: { entries: MemoryEntry[] }) {
    const [query, setQuery] = useState('');
    const [shown, setShown] = useState(PAGE_SIZE);

    const found = useMemo(
        () => entries.filter((e) => matchesQuery(e, query)),
        [entries, query]
    );

    const visible = found.slice(0, shown);

    return (
        <>
            <motion.section
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.85, ease: smoothOut }}
                className="w-full max-w-7xl mx-auto border-b border-secondary/30 px-5 md:px-6 py-10 md:py-20"
                id="memory-intro"
            >
                <span className="inline-flex items-center gap-2 font-plex text-[10px] font-semibold uppercase tracking-[0.22em] text-secondary-deep mb-4">
                    <span className="w-6 h-px bg-secondary" />
                    Книга пам’яті
                </span>

                <h1 className="font-cormorant font-bold text-primary leading-[0.95] tracking-[-0.02em] text-[clamp(2.3rem,1.4rem+3.6vw,4.6rem)] max-w-3xl">
                    {MEMORY_BOOK_TITLE}
                </h1>

                <p className="mt-5 text-base text-primary/80 max-w-2xl leading-relaxed">
                    Прадіди, діди й батьки наших учнів та вчителів — учасники Другої
                    світової війни. Кожну історію принесла до ліцею родина: хтось
                    зберіг фронтові фото, хтось — нагородні листи й спогади.
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                    <a
                        href={MEMORY_BOOK_PDF}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-none border border-primary/15 px-5 py-2.5 font-manrope text-sm font-semibold text-primary/85 hover:bg-primary hover:text-background hover:border-primary transition-colors"
                    >
                        <ExternalLink size={15} />
                        Відкрити презентацію
                    </a>

                    <a
                        href={MEMORY_BOOK_PDF}
                        download
                        className="inline-flex items-center gap-2 rounded-none bg-primary px-5 py-2.5 font-manrope text-sm font-semibold text-background hover:bg-primary/90 transition-colors"
                    >
                        <Download size={15} />
                        Завантажити
                    </a>
                </div>

                {entries.length > 0 && (
                    <p className="mt-6 font-cormorant text-2xl text-accent tracking-wide">
                        {entries.length} імен у книзі
                    </p>
                )}
            </motion.section>

            {entries.length > 0 && (
                <section className="w-full max-w-7xl mx-auto px-5 md:px-6 py-10 md:py-16" id="memory-list">
                    <div className="relative max-w-md mb-8">
                        <Search
                            size={16}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/35"
                        />
                        <input
                            value={query}
                            onChange={(e) => {
                                setQuery(e.target.value);
                                setShown(PAGE_SIZE);
                            }}
                            placeholder="Пошук за прізвищем або текстом"
                            className="w-full rounded-none border border-primary/15 bg-white/60 pl-11 pr-10 py-2.5 text-sm text-primary placeholder:text-primary/40 outline-none focus:border-accent transition-colors"
                        />
                        {query && (
                            <button
                                onClick={() => setQuery('')}
                                aria-label="Очистити пошук"
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-primary/35 hover:text-primary transition-colors"
                            >
                                <X size={15} />
                            </button>
                        )}
                    </div>

                    {query && (
                        <p className="text-sm text-primary/70 mb-5">
                            {found.length === 0
                                ? 'Нічого не знайдено'
                                : `Знайдено ${found.length} ${found.length === 1 ? 'запис' : 'записів'}`}
                        </p>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {visible.map((entry) => (
                            <MemoryCard key={entry.id} entry={entry} />
                        ))}
                    </div>

                    {shown < found.length && (
                        <div className="mt-8 text-center">
                            <button
                                onClick={() => setShown(shown + PAGE_SIZE)}
                                className="inline-flex items-center gap-2 rounded-none border border-primary/15 px-6 py-3 font-manrope text-sm font-semibold text-primary/85 hover:bg-primary/5 hover:text-primary transition-colors"
                            >
                                Показати ще
                                <span className="text-primary/60">
                                    {found.length - shown}
                                </span>
                            </button>
                        </div>
                    )}
                </section>
            )}
        </>
    );
}

function MemoryCard({ entry }: { entry: MemoryEntry }) {
    const [expanded, setExpanded] = useState(false);

    const text = entry.biography ?? '';
    const isLong = text.length > 260;
    const shortText = isLong && !expanded ? text.slice(0, 260).trimEnd() + '…' : text;

    return (
        <article className="rounded-none border border-secondary/30 bg-secondary/[0.07] overflow-hidden flex flex-col">
            <div className="relative w-full aspect-[3/4] bg-secondary/[0.08]">
                {entry.photo_url ? (
                    <Image
                        src={entry.photo_url}
                        alt={entry.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
                        loading="lazy"
                    />
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-primary/25">
                        <User size={32} />
                        <span className="font-plex text-[11px] uppercase tracking-[0.14em]">
                            Фото не збереглося
                        </span>
                    </div>
                )}
            </div>

            <div className="p-5 flex flex-col flex-1">
                <h2 className="font-cormorant font-bold text-primary text-lg leading-snug">
                    {entry.name}
                </h2>

                {entry.relation && (
                    <p className="mt-1 text-sm text-accent">{entry.relation}</p>
                )}

                {text && (
                    <>
                        <p className="mt-3 text-sm text-primary/80 leading-relaxed">
                            {shortText}
                        </p>

                        {isLong && (
                            <button
                                onClick={() => setExpanded(!expanded)}
                                className="mt-2 self-start font-manrope text-xs font-semibold text-accent hover:text-primary transition-colors"
                            >
                                {expanded ? 'Згорнути' : 'Читати далі'}
                            </button>
                        )}
                    </>
                )}
            </div>
        </article>
    );
}
