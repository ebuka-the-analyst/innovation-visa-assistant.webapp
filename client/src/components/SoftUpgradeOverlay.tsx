import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Lock, Sparkles, ArrowRight, Crown } from "lucide-react";
import { type ToolTier } from "@/hooks/useTierAccess";

interface SoftUpgradeOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  requiredTier: ToolTier;
  toolName: string;
  toolDescription?: string;
  userTier: string;
}

const tierPrices: Record<ToolTier, string> = {
  free: "£0",
  basic: "£29",
  premium: "£49",
  enterprise: "£89",
  ultimate: "£129",
};

const tierNames: Record<ToolTier, string> = {
  free: "Free",
  basic: "Basic",
  premium: "Premium",
  enterprise: "Enterprise",
  ultimate: "Ultimate",
};

const tierColors: Record<ToolTier, string> = {
  free: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  basic: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  premium: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
  enterprise: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
  ultimate: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
};

const tierGradients: Record<ToolTier, string> = {
  free: "from-gray-500 to-gray-600",
  basic: "from-blue-500 to-blue-600",
  premium: "from-purple-500 to-purple-600",
  enterprise: "from-orange-500 to-orange-600",
  ultimate: "from-amber-500 to-orange-500",
};

export function SoftUpgradeOverlay({
  isOpen,
  onClose,
  requiredTier,
  toolName,
  toolDescription,
  userTier,
}: SoftUpgradeOverlayProps) {
  const [, setLocation] = useLocation();

  const handleUpgrade = () => {
    onClose();
    setLocation("/pricing");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-50"
            data-testid="soft-upgrade-backdrop"
          />

          <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", duration: 0.4, bounce: 0.2 }}
              className="w-full max-w-md pointer-events-auto"
            >
              <Card className="relative overflow-hidden shadow-xl border">
                <button
                  onClick={onClose}
                  className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-muted/80 transition-colors z-10"
                  data-testid="button-close-soft-upgrade"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>

                <div className="p-6">
                  <div className="flex items-start gap-4 mb-5">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${tierGradients[requiredTier]} text-white shadow-lg`}>
                      <Lock className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg truncate" data-testid="text-tool-name">
                        {toolName}
                      </h3>
                      {toolDescription && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                          {toolDescription}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="bg-muted/50 rounded-lg p-4 mb-5">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-muted-foreground">Your plan</span>
                      <Badge variant="outline" className="capitalize">
                        {userTier}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Required</span>
                      <Badge className={tierColors[requiredTier]}>
                        {tierNames[requiredTier]} Plan
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10 mb-5">
                    <Sparkles className="w-5 h-5 text-primary flex-shrink-0" />
                    <p className="text-sm">
                      Upgrade to <strong>{tierNames[requiredTier]}</strong> for just{" "}
                      <span className="font-bold text-primary">{tierPrices[requiredTier]}</span> to unlock this tool and more.
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={handleUpgrade}
                      className="flex-1 gap-2"
                      data-testid="button-upgrade-plan"
                    >
                      <Crown className="w-4 h-4" />
                      View Plans
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={onClose}
                      variant="outline"
                      className="flex-shrink-0"
                      data-testid="button-continue-browsing"
                    >
                      Not Now
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
