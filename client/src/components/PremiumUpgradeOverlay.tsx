import { SoftUpgradeOverlay } from "@/components/SoftUpgradeOverlay";
import type { ToolTier } from "@/hooks/useTierAccess";

/** Compatibility wrapper for older tool pages. All offers are managed by /pricing. */
interface PremiumUpgradeOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  requiredTier: ToolTier;
  requiredTierName: string;
  requiredTierPrice: string;
  toolName: string;
}
export function PremiumUpgradeOverlay({
  isOpen, onClose, requiredTier, toolName,
}: PremiumUpgradeOverlayProps) {
  return <SoftUpgradeOverlay
    isOpen={isOpen}
    onClose={onClose}
    requiredTier={requiredTier}
    toolName={toolName}
    userTier="free"
  />;
}
