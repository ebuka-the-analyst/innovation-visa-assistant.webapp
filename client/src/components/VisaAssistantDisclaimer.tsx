import { X } from 'lucide-react';
import { useState } from 'react';

export default function VisaAssistantDisclaimer() {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  return (
    <div className="fixed top-0 left-0 right-0 text-white text-sm px-4 py-2.5 flex items-center justify-between gap-4" style={{ zIndex: 9999, backgroundColor: '#1e40af' }}>
      <div className="container mx-auto max-w-6xl flex items-center justify-between w-full gap-4">
        <span>
          <strong>UK Innovator Founder Visa Assistant Disclaimer:</strong> Trained on GOV.UK guidance. Always verify with official sources.{' '}
          <a
            href="/ai-assistant"
            className="underline hover:opacity-80 transition-opacity"
            data-testid="link-ai-assistant"
          >
            Learn more
          </a>
        </span>
        <button
          onClick={() => setIsDismissed(true)}
          className="text-white hover:opacity-75 transition-opacity flex-shrink-0"
          data-testid="button-dismiss-disclaimer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
