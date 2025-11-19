import { useEffect, useState } from "react";
import GenerationProgress from "@/components/GenerationProgress";

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
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return <GenerationProgress planId={planId} />;
}
