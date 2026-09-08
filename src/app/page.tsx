import { Navbar } from "@/components/farmer/Navbar";
import { Hero } from "@/components/farmer/Hero";
import { Features } from "@/components/farmer/Features";
import { HowItWorks } from "@/components/farmer/HowItWorks";
import { LanguageSection } from "@/components/farmer/LanguageSection";
import { Footer } from "@/components/farmer/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <LanguageSection />
      </main>

      <Footer />
    </div>
  );
}