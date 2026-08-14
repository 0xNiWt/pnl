import ContactWithData from "@/components/ContactWithData";
import Footer from "@/components/Footer";

export const dynamic = 'force-dynamic';

export default function RegisterPage() {
    return (
        <main className="bg-background min-h-screen flex flex-col">
            <ContactWithData />
            <Footer />
        </main>
    )
}