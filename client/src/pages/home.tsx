import Header from "@/components/Header";
import NewsTicker from "@/components/NewsTicker";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import PlatformPillars from "@/components/PlatformPillars";
import AIAgents from "@/components/AIAgents";
import CompetitorFeatures from "@/components/CompetitorFeatures";
import StatsSection from "@/components/StatsSection";
import PricingSection from "@/components/PricingSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import LawyerCTA from "@/components/LawyerCTA";
import FAQSection from "@/components/FAQSection";
import Disclaimer from "@/components/Disclaimer";
import Footer from "@/components/Footer";
import ToolsFlywheel from "@/components/ToolsFlywheel";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Header />
      <NewsTicker />
      <ToolsFlywheel />
      <main>
        <HeroSection />
        <div id="features">
          <FeaturesSection />
        </div>
        <PlatformPillars />
        <AIAgents />
        <CompetitorFeatures />
        <StatsSection />
        <div id="pricing">
          <PricingSection />
        </div>
        <TestimonialsSection />
        <LawyerCTA />
        <div id="faq">
          <FAQSection />
        </div>
      </main>
      <Disclaimer />
      <Footer />
    </div>
  );
}
