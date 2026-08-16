import ContactWithData from "@/components/contact/ContactWithData";
import RatingBoard from "@/components/rating/RatingBoard";

export const revalidate = 60;

export default function RatingPage() {
    return (
        <main className="bg-background min-h-screen flex flex-col font-inter">
            <section className="w-full max-w-7xl mx-auto px-5 md:px-6 pt-10 md:pt-16">
                <div className="flex flex-col items-center md:items-start">
                    <span className="inline-flex items-center gap-2 font-manrope text-xs font-semibold uppercase tracking-[0.18em] text-secondary mb-4">
                        <span className="w-6 h-px bg-secondary" />
                        Рейтинг
                    </span>
                    <h1 className="font-manrope font-bold text-primary leading-[1.05] tracking-tight text-[clamp(2rem,1.6rem+2vw,3.6rem)]">
                        Рейтинг <span className="text-accent">ліцею</span>
                    </h1>
                    <p className="mt-5 text-base text-primary/70 max-w-[520px]">
                        Бали учнів і класів за активність у житті ліцею.
                    </p>
                </div>
            </section>

            <RatingBoard />

            <div className="mt-auto">
                <ContactWithData />
            </div>
        </main>
    );
}
