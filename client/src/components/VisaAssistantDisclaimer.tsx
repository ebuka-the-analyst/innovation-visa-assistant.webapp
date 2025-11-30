import { X } from 'lucide-react';
import { useState } from 'react';

export default function VisaAssistantDisclaimer() {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  return (
    <>
      <style>{`
        @keyframes brandFlash {
          0%, 49% {
            background-color: #1e40af;
          }
          50%, 100% {
            background-color: #ffa536;
          }
        }
        .disclaimer-flash {
          animation: brandFlash 1s steps(1) infinite;
        }
      `}</style>
      <div 
        className="fixed top-0 left-0 right-0 text-white text-sm px-4 py-5 flex items-center justify-between gap-4 disclaimer-flash" 
        style={{ zIndex: 9999 }}
      >
        <div className="container mx-auto max-w-6xl flex items-center justify-between w-full gap-4">
          <span>
            <strong>UK Innovator Founder Visa Assistant Disclaimer:</strong> Trained on GOV.UK guidance. This doesn't substitute legal advice. Always verify with official sources.{' '}
            <a
              href="/ai-transparency"
              className="underline hover:opacity-80 transition-opacity"
              data-testid="link-ai-transparency"
            >
              Learn more
            </a>
          </span>
          <button
            onClick={() => setIsDismissed(true)}
            className="text-white hover:opacity-75 transition-opacity flex-shrink-0 relative overflow-visible"
            data-testid="button-dismiss-disclaimer"
          >
            <X className="h-4 w-4" />
            <div className="absolute -right-1 -top-1 w-2 h-2 rounded-full animate-ping-slow-red" style={{ backgroundColor: '#ef4444' }} />
          </button>
        </div>
      </div>
    </>
  );
}
