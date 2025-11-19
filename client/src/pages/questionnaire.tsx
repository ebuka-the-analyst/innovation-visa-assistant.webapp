import { useEffect, useState } from "react";
import Header from "@/components/Header";
import QuestionnaireForm from "@/components/QuestionnaireForm";

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
      <Header />
      <QuestionnaireForm tier={tier} />
    </div>
  );
}
