'use client';

import { useMemo, useState } from "react";
import Image from "next/image";
import { Download, FlaskConical, GraduationCap, Search, User, X } from "lucide-react";
import { fileLabel, matchesQuery, type ManWork } from "@/lib/manWorks";

/**
 * Роботи МАН — як книга пам'яті: картка на кожну роботу з фото з
 * дослідження, автором, коротким описом і посиланням на сам текст.
 */
export default function ManWorks({ works }: { works: ManWork[] }) {
    const [query, setQuery] = useState('');

    const found = useMemo(
        () => works.filter((w) => matchesQuery(w, query)),
        [works, query]
    );

    return (
        <>
            <section
                className="w-full max-w-7xl mx-auto border-b border-secondary/70 px-5 md:px-6 py-10 md:py-20"
                id="man-intro"
            >
                <span className="inline-flex items-center gap-2 font-plex text-[clamp(1rem,0.7rem+1vw,1.5rem)] font-bold uppercase tracking-[0.14em] text-secondary-deep mb-4">
                    <span className="w-10 h-0.5 bg-secondary" />
                    Мала академія наук
                </span>

                <h1 className="font-cormorant font-bold text-primary leading-[0.95] tracking-[-0.02em] text-[clamp(2.3rem,1.4rem+3.6vw,4.6rem)] max-w-3xl">
                    Наукові роботи ліцеїстів
                </h1>

                <p className="mt-5 text-base text-primary/80 max-w-2xl leading-relaxed">
                    Дослідження, які наші учні захищають у Малій академії наук:
                    хімія, фізика, техніка. Кожна робота — це місяці в лабораторії
                    поруч із науковим керівником, власний експеримент і результат,
                    який можна перевірити.
                </p>

                {works.length > 0 && (
                    <p className="mt-6 font-cormorant text-2xl text-primary tracking-wide">
                        {works.length} {works.length === 1 ? 'робота' : 'роботи'} у збірці
                    </p>
                )}
            </section>

            {works.length === 0 ? (
                <section className="w-full max-w-7xl mx-auto px-5 md:px-6 py-16 text-center">
                    <p className="text-primary/70">
                        Роботи скоро з’являться тут.
                    </p>
                </section>
            ) : (
                <section className="w-full max-w-7xl mx-auto px-5 md:px-6 py-10 md:py-16" id="man-list">
                    <div className="relative max-w-md mb-8">
                        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/45" />
                        <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Пошук за темою, автором чи секцією"
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
                            За таким запитом нічого не знайшлося.
                        </p>
                    ) : (
                        <div className="flex flex-col gap-6">
                            {found.map((work) => <WorkCard key={work.id} work={work} />)}
                        </div>
                    )}
                </section>
            )}
        </>
    );
}

function WorkCard({ work }: { work: ManWork }) {
    return (
        <article className="grid grid-cols-1 md:grid-cols-[320px_1fr] border border-secondary/70 bg-secondary/[0.3] overflow-hidden">
            <div className="relative aspect-[4/3] md:aspect-auto md:min-h-[260px] bg-primary/5">
                {work.photo_url ? (
                    <Image
                        src={work.photo_url}
                        alt={`Фото з роботи «${work.title}»`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 320px"
                        loading="lazy"
                    />
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-primary/30">
                        <FlaskConical size={32} />
                        <span className="font-plex text-[13px] uppercase tracking-[0.14em]">
                            Без фото
                        </span>
                    </div>
                )}
            </div>

            <div className="p-6 md:p-8 flex flex-col">
                {(work.section || work.year) && (
                    <p className="font-plex text-[13px] font-semibold uppercase tracking-[0.14em] text-secondary-deep">
                        {[work.section, work.year].filter(Boolean).join(' · ')}
                    </p>
                )}

                <h2 className="mt-2 font-cormorant font-bold text-primary text-2xl md:text-3xl leading-tight">
                    {work.title}
                </h2>

                {work.summary && (
                    <p className="mt-3 text-base text-primary/85 leading-relaxed">
                        {work.summary}
                    </p>
                )}

                <div className="mt-5 flex flex-col gap-2 border-y border-secondary/70 py-4">
                    <p className="flex items-start gap-2.5 text-sm text-primary">
                        <User size={16} className="mt-0.5 shrink-0 text-secondary-deep" />
                        <span>
                            <span className="font-semibold">{work.author}</span>
                            {work.author_info && (
                                <span className="block text-primary/78">{work.author_info}</span>
                            )}
                        </span>
                    </p>

                    {work.supervisor && (
                        <p className="flex items-start gap-2.5 text-sm text-primary/78">
                            <GraduationCap size={16} className="mt-0.5 shrink-0 text-secondary-deep" />
                            <span>{work.supervisor}</span>
                        </p>
                    )}
                </div>

                {work.description && (
                    <p className="mt-4 text-sm text-primary/85 leading-relaxed">
                        {work.description}
                    </p>
                )}

                {work.file_url && (
                    <a
                        href={work.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-5 self-start inline-flex items-center gap-2 bg-primary px-5 py-2.5 font-manrope text-sm font-semibold text-background hover:bg-primary/90 transition-colors"
                    >
                        <Download size={15} />
                        {fileLabel(work.file_url)}
                    </a>
                )}
            </div>
        </article>
    );
}
