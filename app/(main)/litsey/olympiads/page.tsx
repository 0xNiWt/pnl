import { getOlympiadTables } from "@/lib/olympiadStats";
import OlympiadsIntro from "@/components/litsey/OlympiadsIntro";
import OlympiadStats from "@/components/litsey/OlympiadStats";
import ContactWithData from "@/components/contact/ContactWithData";

export default async function OlympiadsPage() {
    const tables = await getOlympiadTables();

    return (
        <main className="bg-background min-h-screen flex flex-col">
            <OlympiadsIntro tables={tables} />
            <OlympiadStats tables={tables} />
            <ContactWithData />
        </main>
    )
}
