import Image from "next/image";
import Hero from "@/components/Hero";
import Footer from "@/components/Footer";
import Contact from "@/components/Contact";

export default function Home() {
  return (
    <main className="bg-background min-h-screen flex flex-col">
      <Hero />
      <Contact />
      <Footer />
    </main>
  );
}
