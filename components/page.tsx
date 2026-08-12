import AboutHero from "@/components/AboutHero";
import History from "@/components/History";
import Values from "@/components/Values";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export default function LitseyPage() {
    return (
        <main className="bg-background min-h-screen flex flex-col">
            <AboutHero />
            <History />
            <Values />
            <Contact />
            <Footer />
        </main>
    );
}
