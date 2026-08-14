import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import RatingBoard from "@/components/RatingBoard";

export const revalidate = 60;

export default function RatingPage() {
    return (
        <main className="bg-background min-h-screen flex flex-col font-inter">
            <section className="max-w-4xl mx-auto px-5 md:px-6 pt-10 md:pt-16">
                <span className="inline-flex items-center gap-2 font-grotesk text-xs font-semibold uppercase tracking-[0.18em] text-secondary mb-4">
                    <span className="w-6 h-px bg-secondary" />
                    Рейтинг
                </span>
                <h1 className="font-grotesk font-bold text-primary leading-[1.05] tracking-tight text-[clamp(2rem,1.6rem+2vw,3.6rem)]">
                    Рейтинг <span className="text-accent">ліцею</span>
                </h1>
                <p className="mt-5 text-base text-primary/70 max-w-[520px]">
                    Бали учнів і класів за активність у житті ліцею.
                </p>
            </section>

            <RatingBoard />

            <div className="mt-auto">
                <Contact />
                <Footer />
            </div>
        </main>
    );
}