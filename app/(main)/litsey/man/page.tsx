import type { Metadata } from "next";
import { getManWorks } from "@/lib/manWorksData";
import ManWorks from "@/components/litsey/ManWorks";
import ContactWithData from "@/components/contact/ContactWithData";

export const metadata: Metadata = {
    title: "Роботи МАН — ПНЛ №145",
    description: "Наукові роботи ліцеїстів, захищені в Малій академії наук України.",
};

export default async function ManPage() {
    const works = await getManWorks();

    return (
        <main className="paper-grid bg-background min-h-screen flex flex-col">
            <ManWorks works={works} />
            <ContactWithData />
        </main>
    )
}
