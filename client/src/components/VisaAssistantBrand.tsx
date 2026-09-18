import { useId } from "react";

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

  const markSize = compact ? "h-12 w-[58px]" : "h-16 w-[76px]";
  const visaSize = compact ? "text-[21px]" : "text-[29px]";
  const assistantSize = compact ? "text-[20px]" : "text-[28px]";
  const routeTextSize = compact ? "text-[10px]" : "text-[13px]";

  return (
    <div
      className={`inline-flex flex-col justify-center ${className}`}
      aria-label={routeLabel ? `Visa Assistant — ${routeLabel}` : "Visa Assistant"}
    >
      <div className="flex items-center gap-2.5">
        <div className={`relative shrink-0 ${markSize}`} aria-hidden="true">
          <svg
            viewBox="0 0 96 86"
            className="h-full w-full overflow-visible"
            focusable="false"
            role="presentation"
          >
            <defs>
              <linearGradient id={gradientId} x1="8" y1="8" x2="78" y2="78" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#075BE8" />
                <stop offset="55%" stopColor="#126EF5" />
                <stop offset="100%" stopColor="#27B8F3" />
              </linearGradient>
            </defs>

            {/* Official V mark */}
            <path
              d="M6 18h23.2l18.1 38.4c2.1 4.4 5.2 4.3 7.4-.1L73.1 18H92L66 72.4C62.3 80.1 57.4 84 50.1 84c-7.7 0-12.5-4-16-11.4L6 18Z"
              fill={`url(#${gradientId})`}
            />
            <path
              d="M47.3 56.4 73.1 18H92L66 72.4C62.3 80.1 57.4 84 50.1 84c-4 0-7.3-1.1-10.1-3.4l7.3-24.2Z"
              fill="#2DBDF4"
              opacity="0.96"
            />
            <path
              d="M6 18h23.2l18.1 38.4c1 2.1 2.3 3.2 3.8 3.4-3.2 8.3-7 14.8-11.5 19.3-2.1-1.8-3.9-4.1-5.5-7L6 18Z"
              fill="#075BE8"
              opacity="0.92"
            />

            {/* Aircraft + rising flight path */}
            <path
              d="M44.5 29.7C53 23 61.9 16.5 72.7 10.9"
              fill="none"
              stroke="#075BE8"
              strokeWidth="3.3"
              strokeLinecap="round"
            />
            <path
              d="M72.4 7.5 79.3 3l3.6 1.2-3.3 5.4 9.5 2.3 1.4 2.8-12.8-.5-6.4 8.2-2.8-.8 3.3-8-6.5-2.6 1.5-2 7 1.2 3.2-4.1 2.2.9-2.3 6.2Z"
              fill="#075BE8"
            />
          </svg>
        </div>

        <div className="flex flex-col font-black tracking-[-0.045em] leading-[0.82]">
          <span className={`${visaSize} text-[#0B2A66] dark:text-white`}>Visa</span>
          <span className={`${assistantSize} text-[#126EF5] dark:text-[#41B6E6]`}>Assistant</span>
        </div>
      </div>

      {routeLabel && (
        <div
          className={`mt-1.5 flex w-full items-center justify-center gap-2 font-bold tracking-[-0.02em] text-[#0B2A66] dark:text-white ${routeTextSize}`}
        >
          <span className="h-px w-4 bg-[#9FB3D1] dark:bg-slate-600" aria-hidden="true" />
          {routeFlag && (
            routeFlag === "🇬🇧" || routeFlag.toUpperCase() === "GB" || routeFlag.toUpperCase() === "UK" ? (
              <img
                src="https://flagcdn.com/w40/gb.png"
                alt=""
                aria-hidden="true"
                className={`${compact ? "h-[15px] w-5" : "h-5 w-7"} rounded-sm object-cover shadow-sm`}
              />
            ) : (
              <span className={`${compact ? "text-[15px]" : "text-[20px]"} leading-none`} aria-hidden="true">
                {routeFlag}
              </span>
            )
          )}
          <span className="whitespace-nowrap">{routeLabel}</span>
          <span className="h-px w-4 bg-[#9FB3D1] dark:bg-slate-600" aria-hidden="true" />
        </div>
      )}
    </div>
  );
}
