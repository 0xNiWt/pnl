import Image from "next/image";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="bg-background min-h-screen flex flex-col">
      <Header />
      <Hero />
      <Footer />
    </div>
  );
}
