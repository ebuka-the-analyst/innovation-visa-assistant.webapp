// Google Analytics Hook for SPA Page Tracking
// Blueprint: javascript_google_analytics

import { useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'wouter';
import { 
  trackPageView, 
  trackScrollDepth, 
  trackTimeOnPage,
  initGA,
  identifyUser,
  setUserProperties
} from '../lib/analytics';

// Main analytics hook - tracks page views on route change
export const useAnalytics = () => {
  const [location] = useLocation();
  const prevLocationRef = useRef<string>(location);
  const pageStartTimeRef = useRef<number>(Date.now());
  
  // Track page view when location changes
  useEffect(() => {
    if (location !== prevLocationRef.current) {
      // Track time spent on previous page
      const timeSpent = Math.round((Date.now() - pageStartTimeRef.current) / 1000);
      if (timeSpent > 5) { // Only track if more than 5 seconds
        trackTimeOnPage(timeSpent, prevLocationRef.current);
      }
      
      // Track new page view
      trackPageView(location);
      
      // Reset for new page
      prevLocationRef.current = location;
      pageStartTimeRef.current = Date.now();
    }
  }, [location]);
  
  // Track initial page view
  useEffect(() => {
    trackPageView(location);
  }, []);
};

// Scroll depth tracking hook
export const useScrollTracking = (thresholds = [25, 50, 75, 90, 100]) => {
  const [location] = useLocation();
  const trackedThresholdsRef = useRef<Set<number>>(new Set());
  
  useEffect(() => {
    // Reset tracked thresholds on page change
    trackedThresholdsRef.current = new Set();
    
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = Math.round((scrollTop / docHeight) * 100);
      
      thresholds.forEach(threshold => {
        if (scrollPercent >= threshold && !trackedThresholdsRef.current.has(threshold)) {
          trackedThresholdsRef.current.add(threshold);
          trackScrollDepth(threshold, location);
        }
      });
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location, thresholds]);
};

// User identification hook - call after user logs in
export const useUserIdentification = (user?: {
  id: number;
  email?: string;
  tier?: string;
  createdAt?: string;
  planCount?: number;
}) => {
  useEffect(() => {
    if (user?.id) {
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

// Initialize GA hook - call once in App component
export const useInitGA = () => {
  useEffect(() => {
    const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;
    
    if (!measurementId) {
      console.warn('[GA] Missing VITE_GA_MEASUREMENT_ID environment variable');
      return;
    }
    
    initGA();
  }, []);
};

// Event tracking helper hook
export const useEventTracking = () => {
  const trackClick = useCallback((category: string, action: string, label?: string) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', action, {
        event_category: category,
        event_label: label,
      });
    }
  }, []);
  
  return { trackClick };
};
