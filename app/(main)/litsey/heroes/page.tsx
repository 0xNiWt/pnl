import HeroesIntro from "@/components/litsey/HeroesIntro";
import HeroesRoll from "@/components/litsey/HeroesRoll";
import ContactWithData from "@/components/contact/ContactWithData";

export default function HeroesPage() {
    return (
        <main className="bg-background min-h-screen flex flex-col">
            <HeroesIntro />
            <HeroesRoll />
            <ContactWithData />
        </main>
    )
}
