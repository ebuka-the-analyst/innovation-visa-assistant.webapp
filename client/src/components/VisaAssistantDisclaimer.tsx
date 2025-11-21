import { AlertCircle, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function VisaAssistantDisclaimer() {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-amber-50 dark:bg-amber-950/50 border-b-2 border-amber-300 dark:border-amber-700 px-4 py-3" style={{ zIndex: 9999 }}>
      <div className="container mx-auto max-w-6xl">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <div className="text-sm text-amber-900 dark:text-amber-100">
              <strong>UK-Innovation Visa Assistant Disclaimer:</strong> This assistant is trained on official GOV.UK guidance (November 2025, Home Office v9.0) and provides informational support only. It does not constitute legal advice. Always verify with official GOV.UK sources or contact Home Office directly for definitive answers. Individual circumstances may vary.{' '}
              <a
                href="/ai-assistant"
                className="underline font-semibold hover:text-amber-800 dark:hover:text-amber-200"
                data-testid="link-ai-assistant"
              >
                Use AI Assistant →
              </a>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 flex-shrink-0 hover:bg-amber-200 dark:hover:bg-amber-900"
            onClick={() => setIsDismissed(true)}
            data-testid="button-dismiss-disclaimer"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
