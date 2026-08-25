import { Badge } from "@/components/ui/badge";
import { Shield, CheckCircle2, FileText, Lock } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ComplianceBadgesProps {
  variant?: "full" | "compact" | "footer";
  className?: string;
}

export function ComplianceBadges({ variant = "compact", className = "" }: ComplianceBadgesProps) {
  if (variant === "footer") {
    return (
      <div className={`flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground ${className}`}>
        <Tooltip>
          <TooltipTrigger asChild>
            <a href="/privacy" className="flex items-center gap-1 hover:text-foreground transition-colors" data-testid="link-privacy-badge">
              <Shield className="h-3 w-3" />
              <span>Privacy Information</span>
            </a>
          </TooltipTrigger>
          <TooltipContent><p>Read how the platform describes its data-handling practices</p></TooltipContent>
        </Tooltip>

        <span className="text-muted-foreground/50">|</span>

        <Tooltip>
          <TooltipTrigger asChild>
            <a href="/ai-transparency" className="flex items-center gap-1 hover:text-foreground transition-colors">
              <Lock className="h-3 w-3" />
              <span>AI Transparency</span>
            </a>
          </TooltipTrigger>
          <TooltipContent><p>See how AI providers and model routing are described</p></TooltipContent>
        </Tooltip>

        <span className="text-muted-foreground/50">|</span>

        <Tooltip>
          <TooltipTrigger asChild>
            <span className="flex items-center gap-1">
              <FileText className="h-3 w-3" />
              <span>Not Legal Advice</span>
            </span>
          </TooltipTrigger>
          <TooltipContent><p>The platform does not provide regulated immigration advice</p></TooltipContent>
        </Tooltip>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className={`flex flex-wrap gap-2 ${className}`}>
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800">
          <CheckCircle2 className="h-3 w-3 mr-1" /> Privacy Info
        </Badge>
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800">
          <Shield className="h-3 w-3 mr-1" /> AI Transparency
        </Badge>
        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800">
          <FileText className="h-3 w-3 mr-1" /> Not Legal Advice
        </Badge>
      </div>
    );
  }

  return (
    <div className={`grid md:grid-cols-3 gap-4 ${className}`}>
      <a href="/privacy" className="flex items-center gap-3 p-4 border rounded-lg bg-green-50/50 dark:bg-green-950/20 border-green-200 dark:border-green-800 hover:border-green-400 transition-colors">
        <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900"><Lock className="h-5 w-5 text-green-600 dark:text-green-400" /></div>
        <div>
          <p className="font-semibold text-green-800 dark:text-green-200">Privacy Information</p>
          <p className="text-xs text-green-600 dark:text-green-400">Read the platform privacy notice</p>
        </div>
      </a>

      <a href="/ai-transparency" className="flex items-center gap-3 p-4 border rounded-lg bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800 hover:border-blue-400 transition-colors">
        <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900"><Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" /></div>
        <div>
          <p className="font-semibold text-blue-800 dark:text-blue-200">AI Transparency</p>
          <p className="text-xs text-blue-600 dark:text-blue-400">Provider and model-routing information</p>
        </div>
      </a>

      <div className="flex items-center gap-3 p-4 border rounded-lg bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
        <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900"><FileText className="h-5 w-5 text-amber-600 dark:text-amber-400" /></div>
        <div>
          <p className="font-semibold text-amber-800 dark:text-amber-200">Not Legal Advice</p>
          <p className="text-xs text-amber-600 dark:text-amber-400">Use a regulated professional for individual advice</p>
        </div>
      </div>
    </div>
  );
}

export function ICORegistrationBadge({ className = "" }: { className?: string }) {
  return (
    <a
      href="/privacy"
      className={`inline-flex items-center gap-2 px-3 py-2 border rounded-lg bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 hover:border-blue-400 transition-colors ${className}`}
      data-testid="link-data-protection-information"
    >
      <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
      <div className="text-left">
        <p className="text-xs font-semibold text-blue-800 dark:text-blue-200">Data Protection Information</p>
        <p className="text-[10px] text-blue-600 dark:text-blue-400">Read our privacy notice</p>
      </div>
    </a>
  );
}
