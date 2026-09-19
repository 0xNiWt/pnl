import { Suspense } from "react";
import BuildingHero from "@/components/litsey/BuildingHero";
import LitseyNav from "@/components/litsey/LitseyNav";
import AboutHero from "@/components/litsey/AboutHero";
import History from "@/components/litsey/History";
import LegacyWithData from "@/components/litsey/LegacyWithData";
import Stages from "@/components/litsey/Stages";
import Science from "@/components/litsey/Science";
import Values from "@/components/litsey/Values";
import LifeGallery from "@/components/litsey/LifeGallery";
import Volunteering from "@/components/litsey/Volunteering";
import Symbols from "@/components/litsey/Symbols";
import ContactWithData from "@/components/contact/ContactWithData";

// Головна сторінка сайту — це сторінка про ліцей: усі її блоки, у тому
// самому порядку. /litsey веде сюди ж.
// Блоки з даними з бази загорнуто в Suspense: верх сторінки з’являється
// одразу, не чекаючи відповіді Supabase.
export default function Home() {
    return (
        <main className="paper-grid bg-background min-h-screen flex flex-col">
            <BuildingHero />
            <LitseyNav />
            <AboutHero />
            <History />
            <Suspense fallback={<div className="min-h-[60vh]" />}>
                <LegacyWithData />
            </Suspense>
            <Stages />
            <Science />
            <Values />
            <LifeGallery />
            <Volunteering />
            <Symbols />
            <Suspense fallback={<div className="min-h-[40vh]" />}>
                <ContactWithData />
            </Suspense>
        </main>
    );
}
