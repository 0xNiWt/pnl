import Hero from "@/components/Hero";
import Footer from "@/components/Footer";
import ContactWithData from "@/components/ContactWithData";

export const dynamic = 'force-dynamic';

export default function Home() {
  return (
    <main className="bg-background min-h-screen flex flex-col">
      <Hero />
      <ContactWithData />
      <Footer />
    </main>
  );
}
