import ContactWithData from "@/components/contact/ContactWithData";
import StaffDirectory from "@/components/profile/StaffDirectory";

// export const dynamic = 'force-dynamic';

export default function PedagogyPage() {
    return (
        <main className="paper-grid bg-background min-h-screen flex flex-col">
            <section className="w-full max-w-7xl mx-auto px-5 md:px-6 pt-10 md:pt-16 text-center md:text-left">
                <span className="inline-flex items-center gap-2 font-plex text-[10px] uppercase tracking-[0.22em] text-primary/45 mb-4">
                    <span className="w-6 h-px bg-accent" />
                    Ліцей №145
                </span>
                <h1 className="font-cormorant font-semibold text-primary leading-[0.95] tracking-[-0.02em] text-[clamp(2.3rem,1.4rem+3.6vw,4.6rem)]">
                    Педагогічний колектив
                </h1>
                <p className="mt-5 text-base text-primary/70 max-w-[560px] mx-auto md:mx-0">
                    Досвідчені вчителі, методисти та заслужені педагоги України, які щодня працюють
                    заради якісної освіти учнів ліцею.
                </p>
            </section>

            <StaffDirectory />

            <ContactWithData />
        </main>
    )
}
