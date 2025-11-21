import { useEffect, useState } from "react";
import GenerationProgress from "@/components/GenerationProgress";
import Chatbot from "@/components/Chatbot";

export default function Generation() {
  const [planId, setPlanId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('plan_id');
    if (id) {
      setPlanId(id);
    }
  }, []);

  if (!planId) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div>
      <GenerationProgress planId={planId} />
      <Chatbot planId={planId} />
    </div>
  );
}
