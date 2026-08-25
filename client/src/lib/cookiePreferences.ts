export const COOKIE_PREFERENCES_KEY = "innovator_founder_cookie_preferences_v2";
export const COOKIE_PREFERENCES_EVENT = "cookie-preferences-changed";

export interface CookiePreferences {
  essential: true;
  analytics: boolean;
  marketing: boolean;
  updatedAt: string;
}

export function readCookiePreferences(): CookiePreferences | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(COOKIE_PREFERENCES_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<CookiePreferences>;
    if (typeof parsed.analytics !== "boolean" || typeof parsed.marketing !== "boolean") return null;
    return {
      essential: true,
      analytics: parsed.analytics,
      marketing: parsed.marketing,
      updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : new Date(0).toISOString(),
    };
  } catch {
    return null;
  }
}

export function writeCookiePreferences(input: Pick<CookiePreferences, "analytics" | "marketing">): CookiePreferences {
  const preferences: CookiePreferences = {
    essential: true,
    analytics: input.analytics,
    marketing: input.marketing,
    updatedAt: new Date().toISOString(),
  };
  window.localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(preferences));
  window.dispatchEvent(new CustomEvent<CookiePreferences>(COOKIE_PREFERENCES_EVENT, { detail: preferences }));
  return preferences;
}

export function hasAnalyticsConsent(): boolean {
  return readCookiePreferences()?.analytics === true;
}

export function hasMarketingConsent(): boolean {
  return readCookiePreferences()?.marketing === true;
}
