// Google Analytics 4 Comprehensive Integration
// Blueprint: javascript_google_analytics

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

let isInitialized = false;

// Initialize Google Analytics
export const initGA = () => {
  if (isInitialized) return;
  
  const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;

  if (!measurementId) {
    console.warn('[GA] Missing VITE_GA_MEASUREMENT_ID - Analytics disabled');
    return;
  }

  // Add Google Analytics script to the head
  const script1 = document.createElement('script');
  script1.async = true;
  script1.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script1);

  // Initialize gtag
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', measurementId, {
    send_page_view: false, // We handle page views manually for SPA
    debug_mode: import.meta.env.DEV,
  });

  isInitialized = true;
  console.log('[GA] Google Analytics initialized');
};

// Check if GA is ready
const isGAReady = (): boolean => {
  return typeof window !== 'undefined' && 
         typeof window.gtag === 'function' && 
         !!import.meta.env.VITE_GA_MEASUREMENT_ID;
};

// Track page views - for single-page application navigation
export const trackPageView = (url: string, title?: string) => {
  if (!isGAReady()) return;
  
  window.gtag('event', 'page_view', {
    page_path: url,
    page_title: title || document.title,
    page_location: window.location.href,
  });
};

// Generic event tracking
export const trackEvent = (
  action: string, 
  category?: string, 
  label?: string, 
  value?: number,
  additionalParams?: Record<string, any>
) => {
  if (!isGAReady()) return;
  
  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
    ...additionalParams,
  });
};

// ============================================
// COMPREHENSIVE EVENT TRACKING FUNCTIONS
// ============================================

// User Authentication Events
export const trackSignUp = (method: string) => {
  trackEvent('sign_up', 'authentication', method);
};

export const trackLogin = (method: string) => {
  trackEvent('login', 'authentication', method);
};

export const trackLogout = () => {
  trackEvent('logout', 'authentication');
};

// User Engagement Events
export const trackToolStart = (toolId: string, toolName: string) => {
  trackEvent('tool_start', 'engagement', toolName, undefined, {
    tool_id: toolId,
    tool_name: toolName,
  });
};

export const trackToolComplete = (toolId: string, toolName: string, durationSeconds?: number) => {
  trackEvent('tool_complete', 'engagement', toolName, durationSeconds, {
    tool_id: toolId,
    tool_name: toolName,
    completion_time: durationSeconds,
  });
};

export const trackToolAbandoned = (toolId: string, toolName: string, progress?: number) => {
  trackEvent('tool_abandoned', 'engagement', toolName, progress, {
    tool_id: toolId,
    tool_name: toolName,
    progress_percent: progress,
  });
};

// Business Plan Events
export const trackPlanCreate = (planId?: string) => {
  trackEvent('plan_create', 'business_plan', planId);
};

export const trackPlanUpdate = (planId: string, section?: string) => {
  trackEvent('plan_update', 'business_plan', section, undefined, {
    plan_id: planId,
    section_name: section,
  });
};

export const trackPlanExport = (format: 'pdf' | 'word' | 'html', hasCharts: boolean) => {
  trackEvent('plan_export', 'business_plan', format, undefined, {
    export_format: format,
    includes_charts: hasCharts,
  });
};

export const trackPlanComplete = (planId: string) => {
  trackEvent('plan_complete', 'business_plan', planId);
};

// E-commerce / Purchase Events (Enhanced for GA4)
export const trackViewItem = (itemId: string, itemName: string, price: number, currency = 'GBP') => {
  if (!isGAReady()) return;
  
  window.gtag('event', 'view_item', {
    currency: currency,
    value: price,
    items: [{
      item_id: itemId,
      item_name: itemName,
      price: price,
      currency: currency,
    }]
  });
};

export const trackAddToCart = (itemId: string, itemName: string, price: number, currency = 'GBP') => {
  if (!isGAReady()) return;
  
  window.gtag('event', 'add_to_cart', {
    currency: currency,
    value: price,
    items: [{
      item_id: itemId,
      item_name: itemName,
      price: price,
      quantity: 1,
    }]
  });
};

export const trackBeginCheckout = (value: number, currency = 'GBP', items?: any[]) => {
  if (!isGAReady()) return;
  
  window.gtag('event', 'begin_checkout', {
    currency: currency,
    value: value,
    items: items,
  });
};

export const trackPurchase = (
  transactionId: string, 
  value: number, 
  currency = 'GBP',
  items?: any[],
  coupon?: string
) => {
  if (!isGAReady()) return;
  
  window.gtag('event', 'purchase', {
    transaction_id: transactionId,
    value: value,
    currency: currency,
    items: items,
    coupon: coupon,
  });
};

export const trackSubscriptionStart = (planName: string, price: number, interval: 'monthly' | 'yearly') => {
  trackEvent('subscription_start', 'monetization', planName, price, {
    subscription_plan: planName,
    subscription_price: price,
    billing_interval: interval,
  });
};

export const trackSubscriptionCancel = (planName: string, reason?: string) => {
  trackEvent('subscription_cancel', 'monetization', planName, undefined, {
    subscription_plan: planName,
    cancel_reason: reason,
  });
};

// AI Agent Interaction Events
export const trackAgentChat = (agentName: string, messageCount: number) => {
  trackEvent('agent_chat', 'ai_interaction', agentName, messageCount, {
    agent_name: agentName,
    message_count: messageCount,
  });
};

export const trackAgentSuggestionAccepted = (agentName: string, suggestionType: string) => {
  trackEvent('agent_suggestion_accepted', 'ai_interaction', agentName, undefined, {
    agent_name: agentName,
    suggestion_type: suggestionType,
  });
};

export const trackCoinsUsed = (amount: number, feature: string) => {
  trackEvent('coins_used', 'credits', feature, amount, {
    coins_amount: amount,
    feature_name: feature,
  });
};

// Document Events
export const trackDocumentUpload = (documentType: string, fileSize?: number) => {
  trackEvent('document_upload', 'documents', documentType, fileSize, {
    document_type: documentType,
    file_size_bytes: fileSize,
  });
};

export const trackDocumentDownload = (documentType: string, format: string) => {
  trackEvent('document_download', 'documents', documentType, undefined, {
    document_type: documentType,
    download_format: format,
  });
};

// Search Events
export const trackSearch = (searchTerm: string, resultsCount?: number) => {
  if (!isGAReady()) return;
  
  window.gtag('event', 'search', {
    search_term: searchTerm,
    results_count: resultsCount,
  });
};

// Navigation / UX Events
export const trackNavigation = (from: string, to: string) => {
  trackEvent('navigation', 'ux', `${from} -> ${to}`, undefined, {
    nav_from: from,
    nav_to: to,
  });
};

export const trackScrollDepth = (percent: number, pagePath: string) => {
  trackEvent('scroll_depth', 'engagement', pagePath, percent, {
    scroll_percent: percent,
    page_path: pagePath,
  });
};

export const trackTimeOnPage = (seconds: number, pagePath: string) => {
  trackEvent('time_on_page', 'engagement', pagePath, seconds, {
    time_seconds: seconds,
    page_path: pagePath,
  });
};

// Error Tracking
export const trackError = (errorType: string, errorMessage: string, fatal = false) => {
  if (!isGAReady()) return;
  
  window.gtag('event', 'exception', {
    description: `${errorType}: ${errorMessage}`,
    fatal: fatal,
  });
};

// Form Events
export const trackFormStart = (formName: string) => {
  trackEvent('form_start', 'forms', formName);
};

export const trackFormSubmit = (formName: string, success: boolean) => {
  trackEvent('form_submit', 'forms', formName, success ? 1 : 0, {
    form_name: formName,
    submission_success: success,
  });
};

export const trackFormFieldError = (formName: string, fieldName: string) => {
  trackEvent('form_field_error', 'forms', `${formName}:${fieldName}`, undefined, {
    form_name: formName,
    field_name: fieldName,
  });
};

// Blog / Content Events
export const trackBlogView = (postSlug: string, category?: string) => {
  trackEvent('blog_view', 'content', postSlug, undefined, {
    post_slug: postSlug,
    category: category,
  });
};

export const trackBlogShare = (postSlug: string, platform: string) => {
  trackEvent('blog_share', 'social', platform, undefined, {
    post_slug: postSlug,
    share_platform: platform,
  });
};

// CTA Events
export const trackCTAClick = (ctaName: string, location: string) => {
  trackEvent('cta_click', 'conversion', ctaName, undefined, {
    cta_name: ctaName,
    cta_location: location,
  });
};

// Feature Usage
export const trackFeatureUsed = (featureName: string, tier?: string) => {
  trackEvent('feature_used', 'product', featureName, undefined, {
    feature_name: featureName,
    user_tier: tier,
  });
};

// Set user properties
export const setUserProperties = (properties: {
  userId?: string;
  userTier?: string;
  signupDate?: string;
  planCount?: number;
}) => {
  if (!isGAReady()) return;
  
  window.gtag('set', 'user_properties', {
    user_id: properties.userId,
    user_tier: properties.userTier,
    signup_date: properties.signupDate,
    plan_count: properties.planCount,
  });
};

// Identify user (for cross-device tracking)
export const identifyUser = (userId: string) => {
  if (!isGAReady()) return;
  
  window.gtag('config', import.meta.env.VITE_GA_MEASUREMENT_ID, {
    user_id: userId,
  });
};
