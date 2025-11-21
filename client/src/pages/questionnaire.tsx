import { useEffect, useState } from "react";
import { AuthHeader } from "@/components/AuthHeader";
import QuestionnaireForm from "@/components/QuestionnaireForm";
import EvidencePreparationGuide from "@/components/EvidencePreparationGuide";
import FeatureNavigation from "@/components/FeatureNavigation";

export default function Questionnaire() {
  const [tier, setTier] = useState('premium');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tierParam = params.get('tier');
    if (tierParam) {
      setTier(tierParam);
    }
  }, []);

  return (
    <div className="min-h-screen">
      <AuthHeader />
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <FeatureNavigation currentPage="questionnaire" />
          <div className="mb-6">
            <span className="text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">VISAPREP AI - INTELLIGENCE ENGINE</span>
            <h1 className="font-serif text-4xl md:text-5xl font-bold mt-4 mb-3">
              Generate Your Business Plan
            </h1>
            <p className="text-lg text-muted-foreground">
              Our PhD-level AI platform evaluates your innovation across all three visa criteria (Innovation, Viability, Scalability) and generates policy-aware business plans, financial projections, and pitch decks—all internally consistent and endorser-ready.
            </p>
          </div>
        </div>
        <EvidencePreparationGuide />
        <QuestionnaireForm tier={tier} />
      </div>
    </div>
  );
}
