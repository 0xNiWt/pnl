import Image from "next/image";
import { HEROES, type Hero } from "./heroesData";
export default function HeroesRoll() {
    return (
        <section className="w-full max-w-7xl mx-auto px-5 md:px-6" id="heroes">
            <div className="flex flex-col">
                {HEROES.map((hero) => (
                    <HeroCard key={hero.id} hero={hero} />
                ))}
            </div>

            <p
                className="border-t border-secondary/70 py-14 md:py-20 text-center font-manrope font-bold text-xl md:text-2xl text-primary tracking-tight"
            >
                Повік не забудемо безмежний геройський чин.
                <br />
                <span className="text-accent">Вічна слава і пам’ять Героям!</span>
            </p>
        </section>
    );
}

function HeroCard({ hero }: { hero: Hero }) {
    return (
        <article
            className="border-b border-secondary/70 py-10 md:py-16 grid grid-cols-1 md:grid-cols-[280px_1fr] gap-7 md:gap-12"
            id={hero.id}
        >
            <div className="md:sticky md:top-28 md:self-start">
                <div className="relative w-full max-w-[280px] mx-auto md:mx-0 aspect-[3/4] overflow-hidden rounded-none bg-secondary/[0.3]">
                    <Image
                        src={hero.photo}
                        alt={hero.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 280px, 280px"
                        placeholder="blur"
                    />
                </div>

                <div className="mt-4 max-w-[280px] mx-auto md:mx-0 text-sm text-primary/78">
                    <span className="leading-snug">{hero.fell}</span>
                </div>
            </div>

            <div>
                <span className="inline-flex items-center gap-2 font-plex text-xs font-semibold uppercase tracking-[0.16em] text-accent mb-3">
                    <span className="w-10 h-0.5 bg-secondary" />
                    {hero.graduation}
                </span>

                <h2 className="font-cormorant font-bold text-primary text-[clamp(1.6rem,1.1rem+1.9vw,2.6rem)] leading-[1.05] tracking-[-0.015em]">
                    {hero.name}
                    {hero.callsign && (
                        <span className="text-primary/65 font-medium"> «{hero.callsign}»</span>
                    )}
                </h2>

                {(hero.lifespan || hero.note) && (
                    <p className="mt-1.5 text-sm text-primary/70">
                        {[hero.lifespan, hero.note].filter(Boolean).join(" · ")}
                    </p>
                )}

                <div className="mt-5 flex flex-col gap-3.5 max-w-3xl">
                    {hero.paragraphs.map((p) => (
                        <p key={p.slice(0, 32)} className="text-base text-primary/85 leading-relaxed">
                            {p}
                        </p>
                    ))}
                </div>

                {hero.awards && hero.awards.length > 0 && (
                    <div className="mt-6 max-w-3xl rounded-none border border-secondary/70 bg-secondary/[0.3] p-5">
                        <p className="flex items-center gap-2 font-plex text-xs font-semibold uppercase tracking-[0.14em] text-primary/70 mb-3">
                            Нагороджений посмертно
                        </p>

                        <ul className="flex flex-col gap-2">
                            {hero.awards.map((award) => (
                                <li key={award} className="flex gap-3 text-sm text-primary/85 leading-relaxed">
                                    <span className="mt-2 h-1.5 w-1.5 rounded-none bg-current shrink-0" />
                                    {award}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </article>
    );
}
