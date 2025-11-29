type MetricName = 'LCP' | 'FID' | 'CLS' | 'FCP' | 'TTFB' | 'INP';

interface PerformanceMetricData {
  lcp?: number;
  fid?: number;
  cls?: number;
  fcp?: number;
  ttfb?: number;
  inp?: number;
  pageUrl: string;
  pagePath: string;
  deviceType: 'mobile' | 'tablet' | 'desktop';
  browserName: string;
  browserVersion: string;
  connectionType?: string;
  navigationType: string;
  sessionId: string;
}

class PerformanceMonitor {
  private metrics: Partial<PerformanceMetricData> = {};
  private sessionId: string;
  private hasSent = false;
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    this.sessionId = this.getSessionId();
    this.initializeMonitoring();
  }

  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('perf_session_id');
    if (!sessionId) {
      sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      sessionStorage.setItem('perf_session_id', sessionId);
    }
    return sessionId;
  }

  private getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }

  private getBrowserInfo(): { name: string; version: string } {
    const ua = navigator.userAgent;
    let name = 'Unknown';
    let version = '';

    if (ua.includes('Firefox/')) {
      name = 'Firefox';
      version = ua.split('Firefox/')[1]?.split(' ')[0] || '';
    } else if (ua.includes('Chrome/') && !ua.includes('Edg/')) {
      name = 'Chrome';
      version = ua.split('Chrome/')[1]?.split(' ')[0] || '';
    } else if (ua.includes('Safari/') && !ua.includes('Chrome')) {
      name = 'Safari';
      version = ua.split('Version/')[1]?.split(' ')[0] || '';
    } else if (ua.includes('Edg/')) {
      name = 'Edge';
      version = ua.split('Edg/')[1]?.split(' ')[0] || '';
    }

    return { name, version: version.split('.')[0] || '' };
  }

  private getConnectionType(): string | undefined {
    const nav = navigator as any;
    if (nav.connection) {
      return nav.connection.effectiveType || nav.connection.type;
    }
    return undefined;
  }

  private getNavigationType(): string {
    const entries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
    if (entries.length > 0) {
      return entries[0].type;
    }
    return 'navigate';
  }

  private initializeMonitoring(): void {
    if (typeof window === 'undefined') return;

    this.observeLCP();
    this.observeFID();
    this.observeCLS();
    this.observeFCP();
    this.observeTTFB();
    this.observeINP();

    window.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.sendMetrics();
      }
    });

    window.addEventListener('pagehide', () => {
      this.sendMetrics();
    });
  }

  private observeLCP(): void {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.metrics.lcp = Math.round(lastEntry.startTime);
        this.scheduleSend();
      });
      observer.observe({ type: 'largest-contentful-paint', buffered: true });
    } catch (e) {
      // LCP not supported
    }
  }

  private observeFID(): void {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        if (entries.length > 0) {
          const firstEntry = entries[0] as PerformanceEventTiming;
          this.metrics.fid = Math.round(firstEntry.processingStart - firstEntry.startTime);
          this.scheduleSend();
        }
      });
      observer.observe({ type: 'first-input', buffered: true });
    } catch (e) {
      // FID not supported
    }
  }

  private observeCLS(): void {
    try {
      let clsValue = 0;
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        }
        this.metrics.cls = Math.round(clsValue * 1000);
        this.scheduleSend();
      });
      observer.observe({ type: 'layout-shift', buffered: true });
    } catch (e) {
      // CLS not supported
    }
  }

  private observeFCP(): void {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const fcpEntry = entries.find((e) => e.name === 'first-contentful-paint');
        if (fcpEntry) {
          this.metrics.fcp = Math.round(fcpEntry.startTime);
          this.scheduleSend();
        }
      });
      observer.observe({ type: 'paint', buffered: true });
    } catch (e) {
      // FCP not supported
    }
  }

  private observeTTFB(): void {
    try {
      const entries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
      if (entries.length > 0) {
        this.metrics.ttfb = Math.round(entries[0].responseStart);
        this.scheduleSend();
      }
    } catch (e) {
      // TTFB not supported
    }
  }

  private observeINP(): void {
    try {
      let maxINP = 0;
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const duration = (entry as any).duration;
          if (duration > maxINP) {
            maxINP = duration;
            this.metrics.inp = Math.round(maxINP);
            this.scheduleSend();
          }
        }
      });
      observer.observe({ type: 'event', buffered: true });
    } catch (e) {
      // INP not supported
    }
  }

  private scheduleSend(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    this.debounceTimer = setTimeout(() => {
      this.sendMetrics();
    }, 5000);
  }

  private sendMetrics(): void {
    if (this.hasSent) return;
    
    const hasAnyMetric = this.metrics.lcp || this.metrics.fid || 
                         this.metrics.cls !== undefined || this.metrics.fcp || 
                         this.metrics.ttfb || this.metrics.inp;
    
    if (!hasAnyMetric) return;

    this.hasSent = true;

    const browserInfo = this.getBrowserInfo();
    const data: PerformanceMetricData = {
      ...this.metrics,
      pageUrl: window.location.href,
      pagePath: window.location.pathname,
      deviceType: this.getDeviceType(),
      browserName: browserInfo.name,
      browserVersion: browserInfo.version,
      connectionType: this.getConnectionType(),
      navigationType: this.getNavigationType(),
      sessionId: this.sessionId,
    };

    if (navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
      navigator.sendBeacon('/api/performance/metrics', blob);
    } else {
      fetch('/api/performance/metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        keepalive: true,
      }).catch(() => {});
    }
  }
}

let monitorInstance: PerformanceMonitor | null = null;

export function initPerformanceMonitor(): void {
  if (typeof window === 'undefined') return;
  if (!monitorInstance) {
    monitorInstance = new PerformanceMonitor();
  }
}

export function getVitalsThresholds() {
  return {
    lcp: { good: 2500, needsImprovement: 4000 },
    fid: { good: 100, needsImprovement: 300 },
    cls: { good: 100, needsImprovement: 250 }, // x1000
    fcp: { good: 1800, needsImprovement: 3000 },
    ttfb: { good: 800, needsImprovement: 1800 },
    inp: { good: 200, needsImprovement: 500 },
  };
}

export function getVitalRating(metric: MetricName, value: number): 'good' | 'needs-improvement' | 'poor' {
  const thresholds = getVitalsThresholds();
  const threshold = thresholds[metric.toLowerCase() as keyof typeof thresholds];
  
  if (value <= threshold.good) return 'good';
  if (value <= threshold.needsImprovement) return 'needs-improvement';
  return 'poor';
}
