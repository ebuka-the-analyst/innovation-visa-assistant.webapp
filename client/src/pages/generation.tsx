import { useEffect, useState } from "react";
import GenerationProgress from "@/components/GenerationProgress";
import ChatBot from "@/components/ChatBot";

export default function Generation() {
  const [planId, setPlanId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("plan_id");
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
    <div className="generation-page-viewport h-full min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain">
      <GenerationProgress planId={planId} />
      <ChatBot planId={planId} />

      <style>{`
        /*
         * AppLayout already constrains this route to the available application viewport.
         * Never force GenerationProgress itself to that fixed height: completed plans and
         * shorter laptop viewports can legitimately need more vertical space. The route
         * owns scrolling so every control/result remains reachable from top to bottom.
         */
        .generation-page-viewport > div.min-h-screen {
          height: auto !important;
          min-height: 100% !important;
          overflow-x: hidden !important;
          overflow-y: visible !important;
        }

        @media (min-width: 768px) and (max-height: 950px) {
          .generation-page-viewport > div.min-h-screen {
            padding: 0.75rem !important;
          }

          .generation-page-viewport > div.min-h-screen > div.relative.w-full.max-w-3xl {
            max-width: 56rem !important;
            gap: 0.75rem !important;
          }

          .generation-page-viewport > div.min-h-screen > div.relative.w-full.max-w-3xl > div:first-child {
            padding: 1.25rem 2rem !important;
          }

          .generation-page-viewport > div.min-h-screen > div.relative.w-full.max-w-3xl > div:first-child > div:first-child {
            margin-bottom: 0.75rem !important;
          }

          .generation-page-viewport > div.min-h-screen > div.relative.w-full.max-w-3xl > div:first-child > div:first-child > div:first-child {
            width: 9rem !important;
            height: 9rem !important;
            margin-bottom: 0.5rem !important;
          }

          .generation-page-viewport > div.min-h-screen > div.relative.w-full.max-w-3xl > div:first-child > div:first-child > div:first-child div[class*="w-28"] {
            width: 5.25rem !important;
            height: 5.25rem !important;
          }

          .generation-page-viewport > div.min-h-screen > div.relative.w-full.max-w-3xl > div:first-child > div:first-child > div:nth-child(2) {
            gap: 0.25rem !important;
          }

          .generation-page-viewport > div.min-h-screen > div.relative.w-full.max-w-3xl > div:first-child > div:nth-child(2) {
            gap: 0.5rem !important;
            margin-bottom: 0.75rem !important;
          }

          .generation-page-viewport > div.min-h-screen > div.relative.w-full.max-w-3xl > div:first-child > div:nth-child(2) > p {
            font-size: 1rem !important;
            line-height: 1.4 !important;
            min-height: 0 !important;
          }

          .generation-page-viewport > div.min-h-screen > div.relative.w-full.max-w-3xl > div:first-child > div:nth-child(3) {
            padding-top: 0.75rem !important;
          }

          .generation-page-viewport > div.min-h-screen > div.relative.w-full.max-w-3xl > div:first-child + div {
            padding: 0.75rem 1rem !important;
          }

          .generation-page-viewport > div.min-h-screen > div.relative.w-full.max-w-3xl > div:first-child + div > div:first-child {
            align-items: center !important;
            gap: 0.75rem !important;
          }

          .generation-page-viewport > div.min-h-screen > div.relative.w-full.max-w-3xl > div:first-child + div > div:first-child > div:first-child {
            padding: 0.5rem !important;
          }

          .generation-page-viewport > div.min-h-screen > div.relative.w-full.max-w-3xl > div:first-child + div > div:first-child > div:nth-child(2) {
            min-height: 0 !important;
          }

          .generation-page-viewport > div.min-h-screen > div.relative.w-full.max-w-3xl > div:first-child + div > div:last-child {
            margin-top: 0.5rem !important;
          }

          .generation-page-viewport > div.min-h-screen > div.relative.w-full.max-w-3xl > div:last-child.text-center {
            line-height: 1.25 !important;
          }

          .generation-page-viewport > div.min-h-screen > div.relative.w-full.max-w-3xl > div:last-child.text-center p {
            display: inline;
          }

          .generation-page-viewport > div.min-h-screen > div.relative.w-full.max-w-3xl > div:last-child.text-center p + p::before {
            content: "  ";
          }
        }

        @media (min-width: 768px) and (max-height: 760px) {
          .generation-page-viewport > div.min-h-screen {
            align-items: flex-start !important;
            padding-top: 0.5rem !important;
            padding-bottom: 1rem !important;
          }

          .generation-page-viewport > div.min-h-screen > div.relative.w-full.max-w-3xl > div:first-child {
            padding-top: 0.875rem !important;
            padding-bottom: 0.875rem !important;
          }

          .generation-page-viewport > div.min-h-screen > div.relative.w-full.max-w-3xl > div:first-child > div:first-child > div:first-child {
            width: 7.5rem !important;
            height: 7.5rem !important;
          }

          .generation-page-viewport > div.min-h-screen > div.relative.w-full.max-w-3xl > div:first-child > div:first-child > div:first-child div[class*="w-28"] {
            width: 4.5rem !important;
            height: 4.5rem !important;
          }
        }
      `}</style>
    </div>
  );
}
