import HeroesIntro from "@/components/litsey/HeroesIntro";
import HeroesRoll from "@/components/litsey/HeroesRoll";
import MemorialBoards from "@/components/litsey/MemorialBoards";
import ContactWithData from "@/components/contact/ContactWithData";

export default function HeroesPage() {
    return (
        <main className="paper-grid bg-background min-h-screen flex flex-col">
            <HeroesIntro />
            <HeroesRoll />
            <MemorialBoards />
            <ContactWithData />
        </main>
    )
}
