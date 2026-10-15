import { X } from "lucide-react";
import FounderMembershipPlans from "@/components/FounderMembershipPlans";

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
}
/** Single live catalogue used by /pricing and every modal upsell. */
export default function PricingModal({ isOpen, onClose }: PricingModalProps) {
  if (!isOpen) return null;
  return <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true" aria-label="Membership pricing">
    <div className="fixed inset-0 bg-black/60" onClick={onClose} />
    <div className="fixed inset-y-0 right-0 w-full max-w-5xl overflow-y-auto bg-background shadow-2xl">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-background p-4 sm:px-6">
        <div>
          <h2 className="text-lg font-semibold">Founder membership options</h2>
          <p className="text-sm text-muted-foreground">The same packages and payment conditions shown on our pricing page.</p>
        </div>
        <button type="button" onClick={onClose} className="rounded-lg p-2 hover:bg-secondary"
          aria-label="Close membership pricing" data-testid="button-close-pricing-modal">
          <X className="h-5 w-5"/>
        </button>
      </div>
      <div className="px-4 sm:px-6"><FounderMembershipPlans/></div>
    </div>
  </div>;
}
