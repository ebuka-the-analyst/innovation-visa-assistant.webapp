import { useEffect, useState } from "react";
import { AuthHeader } from "@/components/AuthHeader";
import QuestionnaireForm from "@/components/QuestionnaireForm";
import EvidencePreparationGuide from "@/components/EvidencePreparationGuide";

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
        <EvidencePreparationGuide />
        <QuestionnaireForm tier={tier} />
      </div>
    </div>
  );
}
