import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ComingSoonOverlayProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function ComingSoonOverlay({ title, description, children }: ComingSoonOverlayProps) {
  return (
    <div className="relative w-full h-full">
      <div className="pointer-events-none select-none opacity-30 grayscale blur-[1px]">
        {children}
      </div>
      
      <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none">
        <div className="bg-card border rounded-xl p-8 max-w-md mx-4 shadow-2xl pointer-events-auto text-center">
          <div className="w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8 text-rose-500" />
          </div>
          
          <h2 className="text-xl font-bold mb-2 flex items-center justify-center gap-2">
            {title}
            <span className="text-xs font-semibold px-2 py-1 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
              Coming Soon
            </span>
          </h2>
          
          {description && (
            <p className="text-muted-foreground text-sm mb-6">
              {description}
            </p>
          )}
          
          <Button 
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white"
            disabled
          >
            <Lock className="w-4 h-4 mr-2" />
            Launching Soon
          </Button>
        </div>
      </div>
    </div>
  );
}
