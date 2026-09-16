import { useId } from "react";
import { Plane } from "lucide-react";

type VisaAssistantBrandProps = {
  routeLabel?: string;
  routeFlag?: string;
  compact?: boolean;
  className?: string;
};

export default function VisaAssistantBrand({
  routeLabel,
  routeFlag,
  compact = false,
  className = "",
}: VisaAssistantBrandProps) {
  const rawId = useId();
  const gradientId = `visa-assistant-v-${rawId.replace(/:/g, "")}`;
  const markSize = compact ? "h-9 w-10" : "h-11 w-12";
  const wordSize = compact ? "text-[14px]" : "text-[17px]";

  return (
    <div
      className={`inline-flex flex-col justify-center ${className}`}
      aria-label={routeLabel ? `Visa Assistant — ${routeLabel}` : "Visa Assistant"}
    >
      <div className="flex items-center gap-2">
        <div className={`relative shrink-0 ${markSize}`} aria-hidden="true">
          <svg viewBox="0 0 76 70" className="h-full w-full" focusable="false">
            <defs>
              <linearGradient id={gradientId} x1="5" y1="5" x2="68" y2="65" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#0B63F6" />
                <stop offset="100%" stopColor="#22C1F6" />
              </linearGradient>
            </defs>
            <path
              d="M6 8h18.5L38 41 53 8h17L48 61.5C46 66 42.5 68 38 68c-4.6 0-8.2-2.2-10.1-6.4L6 8Z"
              fill={`url(#${gradientId})`}
            />
            <path
              d="M38 41 53 8h17L48 61.5C46 66 42.5 68 38 68c-3.1 0-5.8-1-7.8-3L38 41Z"
              fill="#22C1F6"
              opacity="0.88"
            />
          </svg>
          <Plane className="absolute -right-1 -top-0.5 h-4 w-4 -rotate-[18deg] text-[#0B63F6] stroke-[2.5]" />
        </div>

        <div className={`flex flex-col font-extrabold tracking-tight leading-[0.88] ${wordSize}`}>
          <span className="text-[#0F172A] dark:text-white">Visa</span>
          <span className="text-[#0B63F6] dark:text-[#41B6E6]">Assistant</span>
        </div>
      </div>

      {routeLabel && (
        <div className={`mt-1 flex items-center gap-1.5 pl-1 font-semibold text-muted-foreground ${compact ? "text-[8px]" : "text-[9px]"}`}>
          <span className="h-px w-2.5 bg-border" aria-hidden="true" />
          {routeFlag && <span aria-hidden="true">{routeFlag}</span>}
          <span className="whitespace-nowrap">{routeLabel}</span>
          <span className="h-px w-2.5 bg-border" aria-hidden="true" />
        </div>
      )}
    </div>
  );
}
