import ContactWithData from "@/components/ContactWithData";
import Footer from "@/components/Footer";
import StaffDirectory from "@/components/StaffDirectory";

export const dynamic = 'force-dynamic';

export default function PedagogyPage() {
    return (
        <main className="bg-background min-h-screen flex flex-col">
            <section className="max-w-4xl mx-auto px-5 md:px-6 pt-10 md:pt-16 text-center md:text-left">
                <span className="inline-flex items-center gap-2 font-grotesk text-xs font-semibold uppercase tracking-[0.18em] text-secondary mb-4">
                    <span className="w-6 h-px bg-secondary" />
                    Ліцей №145
                </span>
                <h1 className="font-grotesk font-bold text-primary leading-[1.05] tracking-tight text-[clamp(2rem,1.6rem+2vw,3.6rem)]">
                    Педагогічний колектив
                </h1>
                <p className="mt-5 text-base text-primary/70 max-w-[560px] mx-auto md:mx-0">
                    Досвідчені вчителі, методисти та заслужені педагоги України, які щодня працюють
                    заради якісної освіти учнів ліцею.
                </p>
            </section>

            <StaffDirectory />

            <ContactWithData />
            <Footer />
        </main>
    )
}
