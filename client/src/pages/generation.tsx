import { useEffect, useState } from "react";
import { AuthHeader } from "@/components/AuthHeader";
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
      <div className="min-h-screen">
        <AuthHeader />
        <div className="flex items-center justify-center py-20">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <AuthHeader />
      <GenerationProgress planId={planId} />
    </div>
  );
}
