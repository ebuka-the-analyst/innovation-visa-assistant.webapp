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
import { SEOHead } from "@/components/SEOHead";
import { organizationSchema, softwareApplicationSchema, visaFAQSchema } from "@/lib/seo-schemas";

export default function Home() {
  const combinedSchema = {
    "@context": "https://schema.org",
    "@graph": [
      organizationSchema,
      softwareApplicationSchema,
      visaFAQSchema
    ]
  };

  return (
    <div className="min-h-screen">
      <SEOHead
        title="UK Innovator Founder Visa Assistant | 109 Expert Tools & PhD-Level Guidance"
        description="Get approved with our AI-powered UK Innovator Founder Visa platform. 109 PhD-level tools covering compliance, business plans, financial modeling, and endorsement preparation. Start your journey today."
        canonical="https://innovatorfoundervisaassistant.co.uk/"
        keywords="UK Innovator Founder Visa, innovator visa, UK business visa, visa for entrepreneurs UK, innovator founder visa requirements, UK visa application, business plan for visa, endorsement UK visa"
        schema={combinedSchema}
      />
      <Header />
      <NewsTicker />
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
