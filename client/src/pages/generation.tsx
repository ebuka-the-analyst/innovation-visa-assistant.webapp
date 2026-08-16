import { useEffect, useState } from "react";
import GenerationProgress from "@/components/GenerationProgress";
import ChatBot from "@/components/ChatBot";

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
    <div className="generation-page-viewport h-full min-h-0 overflow-visible">
      <GenerationProgress planId={planId} />
      <ChatBot planId={planId} />

      <style>{`
        /*
         * GenerationProgress lives inside AppLayout's already height-constrained main area.
         * On laptop/desktop-height viewports, fit only the active-generation dashboard into
         * the available first viewport. Once the completed result expands, it must return to
         * normal document flow so every action remains reachable from top to bottom.
         */
        @media (min-width: 768px) and (max-height: 950px) {
          .generation-page-viewport > div.min-h-screen {
            min-height: 100% !important;
            height: 100%;
            padding: 0.5rem !important;
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
            width: 9.5rem !important;
            height: 9.5rem !important;
            margin-bottom: 0.5rem !important;
          }

          .generation-page-viewport > div.min-h-screen > div.relative.w-full.max-w-3xl > div:first-child > div:first-child > div:first-child div[class*="w-28"] {
            width: 5.5rem !important;
            height: 5.5rem !important;
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
          .generation-page-viewport > div.min-h-screen > div.relative.w-full.max-w-3xl > div:first-child {
            padding-top: 0.875rem !important;
            padding-bottom: 0.875rem !important;
          }

          .generation-page-viewport > div.min-h-screen > div.relative.w-full.max-w-3xl > div:first-child > div:first-child > div:first-child {
            width: 8rem !important;
            height: 8rem !important;
          }

          .generation-page-viewport > div.min-h-screen > div.relative.w-full.max-w-3xl > div:first-child > div:first-child > div:first-child div[class*="w-28"] {
            width: 4.75rem !important;
            height: 4.75rem !important;
          }
        }

        /*
         * The completed panel is much taller than the generation dashboard. It contains the
         * full-plan action, downloads, sharing, revision/dashboard actions, quick actions and
         * next steps. The former fixed 100% height plus overflow-hidden combination clipped
         * those controls on laptop-height viewports. :has() lets us identify the completed
         * state from its stable primary-action test id without coupling to transient status
         * text or modifying the generation state machine.
         */
        .generation-page-viewport > div.min-h-screen:has([data-testid="button-view-full-plan"]) {
          min-height: 100% !important;
          height: auto !important;
          align-items: flex-start !important;
          overflow: visible !important;
          padding-top: 1rem !important;
          padding-bottom: 5rem !important;
        }

        .generation-page-viewport > div.min-h-screen:has([data-testid="button-view-full-plan"]) > div.relative.w-full.max-w-3xl {
          margin-top: 0 !important;
          margin-bottom: 0 !important;
        }

        @media (max-width: 767px) {
          .generation-page-viewport > div.min-h-screen:has([data-testid="button-view-full-plan"]) {
            padding-top: 0.75rem !important;
            padding-bottom: 6rem !important;
          }
        }
      `}</style>
    </div>
  );
}