import AboutHero from "@/components/litsey/AboutHero";
import History from "@/components/litsey/History";
import Values from "@/components/litsey/Values";
import ContactWithData from "@/components/contact/ContactWithData";

export default function LitseyPage() {
    return (
        <main className="bg-background min-h-screen flex flex-col">
            <AboutHero />
            <History />
            <Values />
            <ContactWithData />
        </main>
      
    )
}