import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Download } from "lucide-react";
import ContactWithData from "@/components/contact/ContactWithData";
import PolozhenniaText from "@/components/litsey/PolozhenniaText";

export const metadata: Metadata = {
    title: "Положення про учнівське самоврядування",
    description:
        "Повний текст Положення про учнівське самоврядування природничо-наукового ліцею № 145: структура активу, вибори, рейтинги, система балів і традиції.",
};

export default function PolozhenniaPage() {
    return (
        <main className="paper-grid bg-background min-h-screen flex flex-col">
            <section className="w-full max-w-3xl mx-auto px-5 md:px-6 pt-10 md:pt-16 pb-8 md:pb-10">
                <Link
                    href="/litsey/documents"
                    className="inline-flex items-center gap-1.5 font-plex text-xs font-semibold uppercase tracking-[0.14em] text-primary/50 hover:text-primary transition-colors"
                >
                    <ArrowLeft size={14} />
                    Нормативна база
                </Link>

                <h1 className="mt-5 font-cormorant font-semibold text-primary leading-[1] tracking-[-0.02em] text-[clamp(2.1rem,1.4rem+2.8vw,3.8rem)]">
                    Положення про учнівське самоврядування
                </h1>

                <p className="mt-4 text-base text-primary/65 leading-relaxed">
                    Документ, на який спирається робота активу: структура посад, вибори,
                    рейтинги, система балів, нагороди та щорічні події ліцею. Саме з ним
                    погоджуються учні під час реєстрації на сайті.
                </p>

                <a
                    href="/docs/polozhennia.docx"
                    download
                    className="mt-7 inline-flex items-center gap-1.5 rounded-none bg-primary px-4 py-2 font-manrope text-xs font-semibold text-background hover:bg-primary/90 transition-colors"
                >
                    <Download size={13} />
                    Завантажити DOCX
                </a>
            </section>

            <PolozhenniaText />

            <div className="mt-auto">
                <ContactWithData />
            </div>
        </main>
    );
}
