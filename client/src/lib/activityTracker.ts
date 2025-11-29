import { apiRequest } from "./queryClient";

interface DeviceInfo {
  userAgent: string;
  deviceType: "desktop" | "tablet" | "mobile";
  browserName: string;
  browserVersion: string;
  osName: string;
  osVersion: string;
  screenResolution: string;
  connectionType?: string;
}

interface SessionInfo {
  sessionToken: string;
  sessionId: string | null;
  startTime: number;
}

let currentSession: SessionInfo | null = null;
let heartbeatInterval: ReturnType<typeof setInterval> | null = null;
let lastPagePath: string | null = null;
let pageViewId: string | null = null;
let isTracking = false;

function generateSessionToken(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function getDeviceInfo(): DeviceInfo {
  const ua = navigator.userAgent;
  const screenRes = `${window.screen.width}x${window.screen.height}`;
  
  let deviceType: "desktop" | "tablet" | "mobile" = "desktop";
  if (/tablet|ipad|playbook|silk/i.test(ua)) {
    deviceType = "tablet";
  } else if (/mobile|iphone|ipod|blackberry|opera mini|iemobile/i.test(ua)) {
    deviceType = "mobile";
  }

  let browserName = "Unknown";
  let browserVersion = "";
  if (ua.includes("Firefox/")) {
    browserName = "Firefox";
    browserVersion = ua.split("Firefox/")[1]?.split(" ")[0] || "";
  } else if (ua.includes("Edg/")) {
    browserName = "Edge";
    browserVersion = ua.split("Edg/")[1]?.split(" ")[0] || "";
  } else if (ua.includes("Chrome/")) {
    browserName = "Chrome";
    browserVersion = ua.split("Chrome/")[1]?.split(" ")[0] || "";
  } else if (ua.includes("Safari/") && !ua.includes("Chrome")) {
    browserName = "Safari";
    browserVersion = ua.split("Version/")[1]?.split(" ")[0] || "";
  }

  let osName = "Unknown";
  let osVersion = "";
  if (ua.includes("Windows")) {
    osName = "Windows";
    const match = ua.match(/Windows NT (\d+\.\d+)/);
    osVersion = match ? match[1] : "";
  } else if (ua.includes("Mac OS X")) {
    osName = "macOS";
    const match = ua.match(/Mac OS X (\d+[._]\d+)/);
    osVersion = match ? match[1].replace("_", ".") : "";
  } else if (ua.includes("Linux")) {
    osName = "Linux";
  } else if (ua.includes("Android")) {
    osName = "Android";
    const match = ua.match(/Android (\d+(\.\d+)?)/);
    osVersion = match ? match[1] : "";
  } else if (ua.includes("iOS") || ua.includes("iPhone") || ua.includes("iPad")) {
    osName = "iOS";
    const match = ua.match(/OS (\d+[_]\d+)/);
    osVersion = match ? match[1].replace("_", ".") : "";
  }

  let connectionType: string | undefined;
  if ("connection" in navigator) {
    const conn = (navigator as any).connection;
    connectionType = conn?.effectiveType || conn?.type;
  }

  return {
    userAgent: ua,
    deviceType,
    browserName,
    browserVersion,
    osName,
    osVersion,
    screenResolution: screenRes,
    connectionType,
  };
}

function getUTMParams(): { source?: string; medium?: string; campaign?: string } {
  const params = new URLSearchParams(window.location.search);
  return {
    source: params.get("utm_source") || undefined,
    medium: params.get("utm_medium") || undefined,
    campaign: params.get("utm_campaign") || undefined,
  };
}

function getReferrerInfo(): { url?: string; source?: string } {
  const referrer = document.referrer;
  if (!referrer) return {};
  
  let source: string | undefined;
  try {
    const url = new URL(referrer);
    if (url.hostname.includes("google")) source = "google";
    else if (url.hostname.includes("facebook") || url.hostname.includes("fb.")) source = "facebook";
    else if (url.hostname.includes("twitter") || url.hostname.includes("t.co")) source = "twitter";
    else if (url.hostname.includes("linkedin")) source = "linkedin";
    else if (url.hostname.includes("bing")) source = "bing";
    else source = "other";
  } catch {
    source = "direct";
  }
  
  return { url: referrer, source };
}

async function startSession(): Promise<boolean> {
  if (currentSession?.sessionId) return true;
  
  try {
    const sessionToken = generateSessionToken();
    const deviceInfo = getDeviceInfo();
    const utm = getUTMParams();
    const referrer = getReferrerInfo();
    
    const response = await apiRequest("POST", "/api/activity/session", {
      sessionToken,
      deviceInfo,
      location: {
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      referrer,
      utm,
      currentPage: window.location.pathname,
    });

    const data = await response.json();
    
    currentSession = {
      sessionToken,
      sessionId: data.sessionId,
      startTime: Date.now(),
    };

    startHeartbeat();
    return true;
  } catch (error) {
    console.debug("Activity tracking: Session start failed", error);
    return false;
  }
}

function startHeartbeat(): void {
  if (heartbeatInterval) return;
  
  heartbeatInterval = setInterval(async () => {
    if (!currentSession?.sessionId) return;
    
    try {
      await apiRequest("POST", "/api/activity/session", {
        sessionToken: currentSession.sessionToken,
        currentPage: window.location.pathname,
      });
    } catch {
      // Heartbeat failed silently
    }
  }, 30000); // Every 30 seconds
}

function stopHeartbeat(): void {
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
    heartbeatInterval = null;
  }
}

async function trackPageView(pagePath: string, pageTitle?: string): Promise<void> {
  if (!currentSession?.sessionId || pagePath === lastPagePath) return;
  
  try {
    const referrerPath = lastPagePath || undefined;
    lastPagePath = pagePath;
    
    const response = await apiRequest("POST", "/api/activity/page-view", {
      sessionId: currentSession.sessionId,
      pagePath,
      pageTitle: pageTitle || document.title,
      pageUrl: window.location.href,
      referrerPath,
      navigationType: (performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming)?.type || "navigate",
      pageLoadTimeMs: performance.now(),
    });

    const data = await response.json();
    pageViewId = data.pageViewId;
  } catch (error) {
    console.debug("Activity tracking: Page view failed", error);
  }
}

async function trackEvent(
  eventType: string,
  eventCategory: string,
  eventAction: string,
  options?: {
    eventLabel?: string;
    eventValue?: number;
    toolId?: string;
    toolCategory?: string;
    payload?: Record<string, any>;
  }
): Promise<void> {
  if (!currentSession?.sessionId) return;
  
  try {
    await apiRequest("POST", "/api/activity/event", {
      sessionId: currentSession.sessionId,
      eventType,
      eventCategory,
      eventAction,
      eventLabel: options?.eventLabel,
      eventValue: options?.eventValue,
      pagePath: window.location.pathname,
      toolId: options?.toolId,
      toolCategory: options?.toolCategory,
      payload: options?.payload,
    });
  } catch (error) {
    console.debug("Activity tracking: Event failed", error);
  }
}

async function endSession(): Promise<void> {
  if (!currentSession?.sessionId) return;
  
  stopHeartbeat();
  
  try {
    await apiRequest("POST", "/api/activity/session/end", {
      sessionId: currentSession.sessionId,
      exitPage: window.location.pathname,
    });
  } catch {
    // End session failed silently
  }
  
  currentSession = null;
  lastPagePath = null;
  pageViewId = null;
}

export function initActivityTracking(): void {
  if (isTracking) return;
  isTracking = true;

  startSession().then((success) => {
    if (success) {
      trackPageView(window.location.pathname);
    }
  });

  window.addEventListener("beforeunload", () => {
    endSession();
  });

  window.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      endSession();
    } else if (document.visibilityState === "visible") {
      startSession().then((success) => {
        if (success) {
          trackPageView(window.location.pathname);
        }
      });
    }
  });
}

export function trackRouteChange(newPath: string, pageTitle?: string): void {
  if (!isTracking) {
    initActivityTracking();
    return;
  }
  
  if (currentSession?.sessionId) {
    trackPageView(newPath, pageTitle);
  } else {
    startSession().then((success) => {
      if (success) {
        trackPageView(newPath, pageTitle);
      }
    });
  }
}

export function trackToolUsage(
  toolId: string,
  toolCategory: string,
  action: "open" | "start" | "save" | "export" | "complete",
  additionalData?: Record<string, any>
): void {
  trackEvent("tool_usage", toolCategory, action, {
    toolId,
    toolCategory,
    eventLabel: `${toolId}:${action}`,
    payload: additionalData,
  });
}

export function trackButtonClick(
  buttonId: string,
  buttonLabel: string,
  section?: string
): void {
  trackEvent("interaction", "button", "click", {
    eventLabel: buttonLabel,
    payload: { buttonId, section },
  });
}

export function trackFormSubmit(
  formId: string,
  formName: string,
  success: boolean
): void {
  trackEvent("form", "submission", success ? "success" : "error", {
    eventLabel: formName,
    payload: { formId },
  });
}

export function trackSearch(
  query: string,
  resultsCount: number,
  searchType: string
): void {
  trackEvent("search", searchType, "execute", {
    eventLabel: query.substring(0, 100),
    eventValue: resultsCount,
    payload: { fullQuery: query },
  });
}

export function trackPayment(
  action: "initiate" | "complete" | "cancel" | "error",
  tier: string,
  amount?: number
): void {
  trackEvent("payment", "subscription", action, {
    eventLabel: tier,
    eventValue: amount,
    payload: { tier, amount },
  });
}

export function trackFeatureUsage(
  featureName: string,
  featureCategory: string,
  action: string
): void {
  trackEvent("feature", featureCategory, action, {
    eventLabel: featureName,
  });
}

export function getSessionId(): string | null {
  return currentSession?.sessionId || null;
}

export function isTrackingActive(): boolean {
  return isTracking && !!currentSession?.sessionId;
}
