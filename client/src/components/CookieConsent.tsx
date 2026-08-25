import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { readCookiePreferences, writeCookiePreferences } from "@/lib/cookiePreferences";

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    const preferences = readCookiePreferences();
    if (!preferences) {
      setIsVisible(true);
      return;
    }
    setAnalytics(preferences.analytics);
    setMarketing(preferences.marketing);
  }, []);

  const save = (nextAnalytics: boolean, nextMarketing: boolean) => {
    writeCookiePreferences({ analytics: nextAnalytics, marketing: nextMarketing });
    setAnalytics(nextAnalytics);
    setMarketing(nextMarketing);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 bg-slate-950 border-t border-slate-700 p-4 shadow-2xl"
      style={{ zIndex: 9998 }}
      role="region"
      aria-label="Cookie preferences"
    >
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="max-w-3xl">
              <p className="font-semibold text-white mb-1">Your cookie choices</p>
              <p className="text-sm text-slate-300 leading-relaxed">
                We use essential cookies and local storage to operate the platform. Optional analytics cookies are used only with your permission to understand how the service is used. Marketing cookies are also optional and remain off unless you choose them. You can reject optional cookies and still use the platform.{" "}
                <a href="/cookies" className="underline text-sky-300 hover:text-sky-200">Cookie policy</a>{" · "}
                <a href="/privacy" className="underline text-sky-300 hover:text-sky-200">Privacy policy</a>
              </p>
            </div>
            <div className="flex flex-wrap gap-2 flex-shrink-0">
              <Button variant="outline" size="sm" onClick={() => save(false, false)} data-testid="button-reject-cookies" className="whitespace-nowrap bg-transparent text-white border-slate-500 hover:bg-slate-800">
                Reject optional
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowPreferences((value) => !value)} data-testid="button-manage-cookies" className="whitespace-nowrap bg-transparent text-white border-slate-500 hover:bg-slate-800">
                Manage preferences
              </Button>
              <Button size="sm" onClick={() => save(true, true)} data-testid="button-accept-cookies" className="whitespace-nowrap">
                Accept optional
              </Button>
            </div>
          </div>

          {showPreferences && (
            <div className="grid md:grid-cols-3 gap-3 border-t border-slate-800 pt-4" data-testid="cookie-preferences-panel">
              <div className="rounded-lg border border-slate-700 p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Checkbox checked disabled aria-label="Essential cookies always enabled" />
                  <span className="font-medium text-white">Essential</span>
                  <span className="text-xs text-slate-400">Always on</span>
                </div>
                <p className="text-xs text-slate-400">Needed for authentication, security, saved preferences and core platform functions.</p>
              </div>
              <label className="rounded-lg border border-slate-700 p-3 cursor-pointer">
                <div className="flex items-center gap-2 mb-1">
                  <Checkbox checked={analytics} onCheckedChange={(checked) => setAnalytics(checked === true)} aria-label="Allow analytics cookies" />
                  <span className="font-medium text-white">Analytics</span>
                </div>
                <p className="text-xs text-slate-400">Allows Google Analytics to measure visits and product usage. Off until you choose it.</p>
              </label>
              <label className="rounded-lg border border-slate-700 p-3 cursor-pointer">
                <div className="flex items-center gap-2 mb-1">
                  <Checkbox checked={marketing} onCheckedChange={(checked) => setMarketing(checked === true)} aria-label="Allow marketing cookies" />
                  <span className="font-medium text-white">Marketing</span>
                </div>
                <p className="text-xs text-slate-400">Reserved for optional advertising or campaign measurement technologies. Off until you choose it.</p>
              </label>
              <div className="md:col-span-3 flex justify-end">
                <Button size="sm" onClick={() => save(analytics, marketing)} data-testid="button-save-cookie-preferences">Save preferences</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
