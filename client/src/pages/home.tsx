import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import AIAgents from "@/components/AIAgents";
import PricingSection from "@/components/PricingSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import FAQSection from "@/components/FAQSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <HeroSection />
        <div id="features">
          <FeaturesSection />
        </div>
        <AIAgents />
        <div id="pricing">
          <PricingSection />
        </div>
        <TestimonialsSection />
        <div id="faq">
          <FAQSection />
        </div>
      </main>
      <Footer />
    </div>
  );
}
