import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Lock, Zap, Crown, CheckCircle2 } from "lucide-react";
import { type ToolTier } from "@/hooks/useTierAccess";

interface PremiumUpgradeOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  requiredTier: ToolTier;
  requiredTierName: string;
  requiredTierPrice: string;
  toolName: string;
}

const tierIcons = {
  free: Lock,
  basic: Zap,
  premium: Crown,
  enterprise: Crown,
  ultimate: Crown,
};

const tierColors = {
  free: "from-gray-600 to-gray-800",
  basic: "from-blue-600 to-blue-800",
  premium: "from-purple-600 to-purple-800",
  enterprise: "from-orange-600 to-orange-800",
  ultimate: "from-amber-600 to-orange-800",
};

const tierBenefits: Record<ToolTier, string[]> = {
  free: ["Essential tools access", "Basic Innovator Founder Visa guidance", "Email support"],
  basic: ["Extended tools access", "Standard business planning", "48-hour delivery", "PDF downloads"],
  premium: ["Comprehensive tools access", "Full analysis suite", "24-hour delivery", "Industry frameworks", "Market research"],
  enterprise: ["Full tools access", "Expert modeling", "12-hour priority", "Risk analysis", "Global roadmaps"],
  ultimate: ["Complete access to 100+ professional-level tools", "24/7 VIP support", "Personal strategist", "Unlimited revisions", "Success guarantee"],
};

export function PremiumUpgradeOverlay({
  isOpen,
  onClose,
  requiredTier,
  requiredTierName,
  requiredTierPrice,
  toolName,
}: PremiumUpgradeOverlayProps) {
  const [, setLocation] = useLocation();
  const TierIcon = tierIcons[requiredTier];
  const benefits = tierBenefits[requiredTier];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            data-testid="upgrade-overlay-backdrop"
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="w-full max-w-lg"
            >
              <Card className="relative overflow-hidden border-2 border-primary/20 shadow-2xl">
                {/* Close button */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 rounded-lg hover:bg-muted/80 transition-colors z-10"
                  data-testid="button-close-upgrade-overlay"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Gradient header */}
                <div className={`bg-gradient-to-r ${tierColors[requiredTier]} p-8 text-white`}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                      <TierIcon className="w-8 h-8" />
                    </div>
                    <div>
                      <Badge className="bg-white/20 text-white border-white/30 mb-2">
                        {requiredTierName} Required
                      </Badge>
                      <h2 className="text-lg font-bold">Unlock {toolName}</h2>
                    </div>
                  </div>
                  <p className="text-white/90">
                    This tool requires the <strong>{requiredTierName} Plan</strong> to access. Upgrade now to unlock this and many more powerful features.
                  </p>
                </div>

                {/* Content */}
                <div className="p-8">
                  {/* Price */}
                  <div className="text-center mb-8">
                    <div className="text-2xl font-bold text-foreground mb-2">
                      {requiredTierPrice}
                    </div>
                    <div className="text-sm text-muted-foreground">one-time payment</div>
                  </div>

                  {/* Benefits */}
                  <div className="mb-8">
                    <h3 className="font-semibold mb-4 text-lg">What you'll get:</h3>
                    <ul className="space-y-3">
                      {benefits.map((benefit, index) => (
                        <motion.li
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-start gap-3"
                        >
                          <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-sm">{benefit}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>

                  {/* Actions */}
                  <div className="space-y-3">
                    <Button
                      onClick={() => setLocation("/pricing")}
                      className="w-full h-12 text-base font-semibold"
                      size="lg"
                      data-testid="button-upgrade-now"
                    >
                      <Crown className="w-5 h-5 mr-2" />
                      Upgrade to {requiredTierName}
                    </Button>
                    <Button
                      onClick={onClose}
                      variant="outline"
                      className="w-full"
                      data-testid="button-maybe-later"
                    >
                      Maybe Later
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
