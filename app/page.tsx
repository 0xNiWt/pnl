import Hero from "@/components/home/Hero";
import ContactWithData from "@/components/contact/ContactWithData";

export const dynamic = 'force-dynamic';

export default function Home() {
  return (
    <main className="bg-background min-h-screen flex flex-col">
      <Hero />
      <ContactWithData />
    </main>
  );
}
