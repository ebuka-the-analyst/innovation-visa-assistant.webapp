// Google Analytics Hook for SPA Page Tracking
// Blueprint: javascript_google_analytics

import { useEffect, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import {
  trackPageView,
  trackScrollDepth,
  trackTimeOnPage,
  initGA,
  identifyUser,
  setUserProperties,
} from "../lib/analytics";
import { COOKIE_PREFERENCES_EVENT, hasAnalyticsConsent, type CookiePreferences } from "../lib/cookiePreferences";

function setGoogleAnalyticsPermission(granted: boolean) {
  if (typeof window === "undefined") return;
  const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;
  if (!measurementId) return;
  (window as any)[`ga-disable-${measurementId}`] = !granted;
  if (typeof window.gtag === "function") {
    window.gtag("consent", "update", {
      analytics_storage: granted ? "granted" : "denied",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
    });
  }
}

export const useAnalytics = () => {
  const [location] = useLocation();
  const prevLocationRef = useRef<string>(location);
  const pageStartTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    if (location !== prevLocationRef.current) {
      const timeSpent = Math.round((Date.now() - pageStartTimeRef.current) / 1000);
      if (hasAnalyticsConsent() && timeSpent > 5) {
        trackTimeOnPage(timeSpent, prevLocationRef.current);
      }
      if (hasAnalyticsConsent()) trackPageView(location);
      prevLocationRef.current = location;
      pageStartTimeRef.current = Date.now();
    }
  }, [location]);

  useEffect(() => {
    if (hasAnalyticsConsent()) trackPageView(location);
  }, []);
};

export const useScrollTracking = (thresholds = [25, 50, 75, 90, 100]) => {
  const [location] = useLocation();
  const trackedThresholdsRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    trackedThresholdsRef.current = new Set();
    const handleScroll = () => {
      if (!hasAnalyticsConsent()) return;
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return;
      const scrollPercent = Math.round((scrollTop / docHeight) * 100);
      thresholds.forEach((threshold) => {
        if (scrollPercent >= threshold && !trackedThresholdsRef.current.has(threshold)) {
          trackedThresholdsRef.current.add(threshold);
          trackScrollDepth(threshold, location);
        }
      });
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [location, thresholds]);
};

export const useUserIdentification = (user?: {
  id: number;
  email?: string;
  tier?: string;
  createdAt?: string;
  planCount?: number;
}) => {
  useEffect(() => {
    if (user?.id && hasAnalyticsConsent()) {
      identifyUser(String(user.id));
      setUserProperties({
        userId: String(user.id),
        userTier: user.tier,
        signupDate: user.createdAt,
        planCount: user.planCount,
      });
    }
  }, [user?.id, user?.tier, user?.createdAt, user?.planCount]);
};

export const useInitGA = () => {
  useEffect(() => {
    const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;
    if (!measurementId) {
      console.warn("[GA] Missing VITE_GA_MEASUREMENT_ID environment variable");
      return;
    }

    const apply = (granted: boolean) => {
      setGoogleAnalyticsPermission(granted);
      if (granted) initGA();
    };

    apply(hasAnalyticsConsent());

    const handlePreferenceChange = (event: Event) => {
      const preferences = (event as CustomEvent<CookiePreferences>).detail;
      apply(preferences?.analytics === true);
    };
    window.addEventListener(COOKIE_PREFERENCES_EVENT, handlePreferenceChange);
    return () => window.removeEventListener(COOKIE_PREFERENCES_EVENT, handlePreferenceChange);
  }, []);
};

export const useEventTracking = () => {
  const trackClick = useCallback((category: string, action: string, label?: string) => {
    if (hasAnalyticsConsent() && typeof window !== "undefined" && window.gtag) {
      window.gtag("event", action, {
        event_category: category,
        event_label: label,
      });
    }
  }, []);
  return { trackClick };
};
