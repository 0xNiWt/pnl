import Image from "next/image";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Footer from "@/components/Footer";
import Preloader from "@/components/Preloader";
import Contact from "@/components/Contact";

export default function Home() {
  return (
    <main className="bg-background min-h-screen flex flex-col">
      {/* <Preloader /> */}
      <Header />
      <Hero />
      <Contact />
      <Footer />
    </main>
  );
}
