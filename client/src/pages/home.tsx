import { useState, useEffect } from "react";
import Header from "@/components/Header";
import NewsTicker from "@/components/NewsTicker";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import PlatformPillars from "@/components/PlatformPillars";
import AIAgents from "@/components/AIAgents";
import AI2040Showcase from "@/components/AI2040Showcase";
import CompetitorFeatures from "@/components/CompetitorFeatures";
import StatsSection from "@/components/StatsSection";
import PricingSection from "@/components/PricingSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import LawyerCTA from "@/components/LawyerCTA";
import FAQSection from "@/components/FAQSection";
import Disclaimer from "@/components/Disclaimer";
import Footer from "@/components/Footer";
import { SEOHead } from "@/components/SEOHead";
import { organizationSchema, softwareApplicationSchema, visaFAQSchema, websiteSchema } from "@/lib/seo-schemas";
import { GlobalNavButton } from "@/components/global-nav-button";
import { CountryLoading } from "@/components/country-loading";

export default function Home() {
  const [showLoading, setShowLoading] = useState(false);
  const [loadingComplete, setLoadingComplete] = useState(false);

  useEffect(() => {
    const fromGlobal = sessionStorage.getItem("navigating_from_global");
    if (fromGlobal === "uk") {
      setShowLoading(true);
      sessionStorage.removeItem("navigating_from_global");
    } else {
      setLoadingComplete(true);
    }
  }, []);

  const handleLoadingComplete = () => {
    setShowLoading(false);
    setLoadingComplete(true);
  };

  const combinedSchema = {
    "@context": "https://schema.org",
    "@graph": [
      organizationSchema,
      softwareApplicationSchema,
      websiteSchema,
      visaFAQSchema
    ]
  };

  if (showLoading && !loadingComplete) {
    return (
      <CountryLoading 
        countryName="United Kingdom" 
        countryCode="uk" 
        onComplete={handleLoadingComplete} 
      />
    );
  }

  return (
    <div className="min-h-screen">
      <GlobalNavButton />
      <SEOHead
        title="UK Innovator Founder Visa Assistant | 100+ Professional Tools & Expert Guidance"
        description="Get approved with our AI-powered UK Innovator Founder Visa platform. 100+ professional-level tools covering compliance, business plans, financial modeling, and endorsement preparation. Start your journey today."
        canonical="https://innovatorfoundervisaassistant.co.uk/"
        keywords="UK Innovator Founder Visa, Innovator Founder Visa, UK business visa, visa for entrepreneurs UK, innovator founder visa requirements, UK visa application, business plan for visa, endorsement UK visa"
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
        <AI2040Showcase />
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
