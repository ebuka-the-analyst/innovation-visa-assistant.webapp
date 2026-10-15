import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Lock, ArrowRight } from "lucide-react";
import { type ToolTier } from "@/hooks/useTierAccess";
import { memberUpgradeDescription } from "@shared/memberToolPlan";

interface SoftUpgradeOverlayProps {
  isOpen:boolean;onClose:()=>void;
  requiredTier:ToolTier;toolName:string;toolDescription?:string;userTier:string;
}
/** Public paid membership benefits and prices are owned by /pricing.
 * Don't quote retired Basic/Premium/Ultimate one-time prices or promises here.
 */
export function SoftUpgradeOverlay({
  isOpen,onClose,requiredTier,toolName,toolDescription,
}:SoftUpgradeOverlayProps){
  const [,setLocation]=useLocation();
  const handleUpgrade=()=>{onClose();setLocation("/pricing");};
  return <AnimatePresence>
    {isOpen&&<>
      <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
        onClick={onClose} className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-50"
        data-testid="soft-upgrade-backdrop"/>
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
        <motion.div initial={{opacity:0,scale:0.95,y:10}}
          animate={{opacity:1,scale:1,y:0}} exit={{opacity:0,scale:0.95,y:10}}
          className="w-full max-w-md pointer-events-auto">
          <Card className="relative overflow-hidden shadow-xl border p-6">
            <button type="button" onClick={onClose}
              className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-muted/80"
              data-testid="button-close-soft-upgrade" aria-label="Close">
              <X className="w-4 h-4 text-muted-foreground"/>
            </button>
            <div className="flex items-start gap-3 mb-4">
              <div className="rounded-lg bg-primary/10 p-3"><Lock className="w-5 h-5 text-primary"/></div>
              <div>
                <h3 className="font-semibold text-lg" data-testid="text-tool-name">{toolName}</h3>
                {toolDescription&&<p className="text-sm text-muted-foreground mt-1">{toolDescription}</p>}
              </div>
            </div>
            <p className="text-sm mb-3">This tool requires a verified, active paid membership.</p>
            <p className="text-sm text-muted-foreground mb-5">
              Compare {memberUpgradeDescription(requiredTier)}.
              Membership access starts only after successful payment verification.
            </p>
            <div className="flex gap-3">
              <Button onClick={handleUpgrade} className="flex-1 gap-2" data-testid="button-upgrade-plan">
                View memberships <ArrowRight className="w-4 h-4"/>
              </Button>
              <Button onClick={onClose} variant="outline" data-testid="button-continue-browsing">Not Now</Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </>}
  </AnimatePresence>;
}
