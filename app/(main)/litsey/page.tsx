import AboutHero from "@/components/litsey/AboutHero";
import History from "@/components/litsey/History";
import LegacyWithData from "@/components/litsey/LegacyWithData";
import Stages from "@/components/litsey/Stages";
import Science from "@/components/litsey/Science";
import Values from "@/components/litsey/Values";
import LifeGallery from "@/components/litsey/LifeGallery";
import Symbols from "@/components/litsey/Symbols";
import ContactWithData from "@/components/contact/ContactWithData";

export default function LitseyPage() {
    return (
        <main className="bg-background min-h-screen flex flex-col">
            <AboutHero />
            <History />
            <LegacyWithData />
            <Stages />
            <Science />
            <Values />
            <LifeGallery />
            <Symbols />
            <ContactWithData />
        </main>

    )
}
