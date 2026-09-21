import { HEROES } from "./heroesData";

export default function HeroesIntro() {
    return (
        <section
            className="w-full max-w-7xl mx-auto border-b border-secondary/70 px-5 md:px-6 py-10 md:py-20"
            id="heroes-intro"
        >
            <span className="inline-flex items-center gap-2 font-plex text-[clamp(1rem,0.7rem+1vw,1.5rem)] font-bold uppercase tracking-[0.14em] text-secondary-deep mb-4">
                <span className="w-10 h-0.5 bg-secondary" />
                Пам’ять
            </span>

            <h1 className="font-cormorant font-bold text-primary leading-[0.95] tracking-[-0.02em] text-[clamp(2.3rem,1.4rem+3.6vw,4.6rem)] max-w-3xl">
                Герої ліцею
            </h1>

            <p className="mt-4 font-manrope font-semibold text-lg md:text-xl text-primary/90 max-w-2xl">
                Випускники ліцею, які загинули, захищаючи незалежність України
            </p>

            <p className="mt-5 text-base text-primary/80 max-w-2xl leading-relaxed">
                Вони сиділи за тими самими партами, писали ті самі контрольні й бігали
                тими самими коридорами. Кожен обрав свою справу — науку, медицину,
                інженерію, спорт — і кожен став на захист країни, коли це стало
                потрібно. Тут їхні імена та їхні історії.
            </p>

            <p className="mt-8 font-cormorant text-2xl text-accent tracking-wide">
                {HEROES.length} імен · вічна пам’ять
            </p>
        </section>
    );
}
