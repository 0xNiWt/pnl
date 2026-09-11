import BuildingHero from "@/components/litsey/BuildingHero";
import LitseyNav from "@/components/litsey/LitseyNav";
import AboutHero from "@/components/litsey/AboutHero";
import History from "@/components/litsey/History";
import LegacyWithData from "@/components/litsey/LegacyWithData";
import Stages from "@/components/litsey/Stages";
import Science from "@/components/litsey/Science";
import Values from "@/components/litsey/Values";
import LifeGallery from "@/components/litsey/LifeGallery";
import Symbols from "@/components/litsey/Symbols";
import ContactWithData from "@/components/contact/ContactWithData";

// Головна сторінка сайту — це сторінка про ліцей: усі її блоки, у тому
// самому порядку. /litsey веде сюди ж.
export default function Home() {
    return (
        <main className="paper-grid bg-background min-h-screen flex flex-col">
            <BuildingHero />
            <LitseyNav />
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
    );
}
