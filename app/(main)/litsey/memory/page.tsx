import { getMemoryEntries } from "@/lib/memoryBook";
import MemoryBook from "@/components/litsey/MemoryBook";
import ContactWithData from "@/components/contact/ContactWithData";

export default async function MemoryPage() {
    const entries = await getMemoryEntries();

    return (
        <main className="paper-grid bg-background min-h-screen flex flex-col">
            <MemoryBook entries={entries} />
            <ContactWithData />
        </main>
    )
}
