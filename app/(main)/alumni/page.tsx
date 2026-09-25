import type { Metadata } from "next";
import { getAlumni } from "@/lib/alumniData";
import AlumniList from "@/components/alumni/AlumniList";
import ContactWithData from "@/components/contact/ContactWithData";

export const metadata: Metadata = {
    title: "Випускники — ПНЛ №145",
    description: "Випускники Природничо-наукового ліцею №145: ким вони стали й коли навчалися в ліцеї.",
};

export default async function AlumniPage() {
    const alumni = await getAlumni();

    return (
        <main className="paper-grid bg-background min-h-screen flex flex-col">
            <section className="w-full max-w-7xl mx-auto border-b border-secondary/70 px-5 md:px-6 py-10 md:py-16">
                <span className="inline-flex items-center gap-2 font-plex text-[clamp(1rem,0.7rem+1vw,1.5rem)] font-bold uppercase tracking-[0.14em] text-secondary-deep mb-4">
                    <span className="w-10 h-0.5 bg-secondary" />
                    Наші люди
                </span>

                <h1 className="font-cormorant font-bold text-primary leading-[0.95] tracking-[-0.02em] text-[clamp(2.3rem,1.4rem+3.6vw,4.6rem)] max-w-3xl">
                    Випускники ліцею
                </h1>

                <p className="mt-5 text-base text-primary/80 max-w-2xl leading-relaxed">
                    Математики й дипломати, підприємці та науковці — усі вони
                    колись сиділи за партами ліцею № 145. Тут коротко про те,
                    ким вони стали і коли в нас навчалися.
                </p>
            </section>

            <AlumniList alumni={alumni} />

            <ContactWithData />
        </main>
    )
}
