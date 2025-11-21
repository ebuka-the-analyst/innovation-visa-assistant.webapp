import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const cookieConsent = localStorage.getItem('innovator_founder_visa_cookie_consent');
    if (!cookieConsent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('innovator_founder_visa_cookie_consent', 'accepted');
    setIsVisible(false);
  };

  const handleReject = () => {
    localStorage.setItem('innovator_founder_visa_cookie_consent', 'rejected');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-900 dark:bg-slate-950 border-t-2 border-slate-600 p-4" style={{ zIndex: 9998 }}>
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1">
            <p className="text-sm text-slate-200 leading-relaxed">
              We use cookies to enhance your experience on BhenMedia VisaPrep. Cookies help us understand how you use our platform and improve our services. By continuing to use the site, you consent to our use of cookies.{' '}
              <a
                href="/privacy"
                className="underline text-accent hover:text-accent/80"
                data-testid="link-privacy-policy"
              >
                Learn more
              </a>
            </p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReject}
              data-testid="button-reject-cookies"
              className="whitespace-nowrap"
            >
              Reject
            </Button>
            <Button
              size="sm"
              onClick={handleAccept}
              data-testid="button-accept-cookies"
              className="whitespace-nowrap"
            >
              Accept Cookies
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
