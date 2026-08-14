import AboutHero from "@/components/AboutHero";
import History from "@/components/History";
import Values from "@/components/Values";
import ContactWithData from "@/components/ContactWithData";
import Footer from "@/components/Footer";

export const dynamic = 'force-dynamic';

export default function RegisterPage() {
    return (
        <main className="bg-background min-h-screen flex flex-col">
            <AboutHero />
            <History />
            <Values />
            <ContactWithData />
            <Footer />
        </main>
      
    )
}