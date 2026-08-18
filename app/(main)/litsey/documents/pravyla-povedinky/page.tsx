import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Download } from "lucide-react";
import ContactWithData from "@/components/contact/ContactWithData";
import RulesOfConduct from "@/components/litsey/RulesOfConduct";

export const metadata: Metadata = {
    title: "Правила поведінки учнів ліцею",
    description:
        "Пам’ятка для батьків та учнів природничо-наукового ліцею № 145: загальні правила, зовнішній вигляд, поведінка на уроках і перервах.",
};

export default function RulesPage() {
    return (
        <main className="bg-background min-h-screen flex flex-col">
            <section className="w-full max-w-3xl mx-auto px-5 md:px-6 pt-10 md:pt-16 pb-8 md:pb-10">
                <Link
                    href="/litsey/documents"
                    className="inline-flex items-center gap-1.5 font-manrope text-xs font-semibold uppercase tracking-[0.14em] text-primary/50 hover:text-primary transition-colors"
                >
                    <ArrowLeft size={14} />
                    Нормативна база
                </Link>

                <h1 className="mt-5 font-manrope font-bold text-primary leading-[1.1] tracking-tight text-[clamp(1.75rem,1.45rem+1.8vw,3rem)]">
                    Правила поведінки учнів ліцею
                </h1>

                <p className="mt-4 text-base text-primary/65 leading-relaxed">
                    Пам’ятка для батьків та учнів: загальні правила, зовнішній вигляд,
                    поведінка на уроках і перервах.
                </p>

                <a
                    href="/docs/pravyla_povedinky.docx"
                    download
                    className="mt-7 inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 font-manrope text-xs font-semibold text-background hover:bg-primary/90 transition-colors"
                >
                    <Download size={13} />
                    Завантажити DOCX
                </a>
            </section>

            <RulesOfConduct />

            <div className="mt-auto">
                <ContactWithData />
            </div>
        </main>
    );
}
