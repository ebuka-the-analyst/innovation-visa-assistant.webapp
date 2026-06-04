interface ErrorLogData {
  errorType: 'client' | 'server' | 'api' | 'database' | 'ai' | 'export' | 'auth';
  errorCode?: string;
  message: string;
  stack?: string;
  toolId?: string;
  pageUrl?: string;
  browserInfo?: Record<string, any>;
  severity?: 'info' | 'warning' | 'error' | 'critical';
}

const CLIENT_DEDUP_WINDOW_MS = 5 * 60 * 1000; // 5 minutes

class ErrorLogger {
  private isLogging = false;
  private queue: ErrorLogData[] = [];
  private maxQueueSize = 10;
  private recentFingerprints = new Map<string, number>();

  private isChunkLoadError(message: string): boolean {
    const msg = String(message).toLowerCase();
    return (
      msg.includes('dynamically imported module') ||
      msg.includes('failed to fetch') ||
      msg.includes('loading chunk') ||
      msg.includes('loading css chunk') ||
      msg.includes('importing a module script failed')
    );
  }

  private isDuplicate(data: ErrorLogData): boolean {
    const fingerprint = `${data.errorType}:${String(data.message).slice(0, 200)}`;
    const now = Date.now();
    const lastSeen = this.recentFingerprints.get(fingerprint);
    if (lastSeen && now - lastSeen < CLIENT_DEDUP_WINDOW_MS) {
      return true;
    }
    this.recentFingerprints.set(fingerprint, now);
    // Prune old entries
    if (this.recentFingerprints.size > 100) {
      for (const [key, ts] of this.recentFingerprints.entries()) {
        if (now - ts > CLIENT_DEDUP_WINDOW_MS) this.recentFingerprints.delete(key);
      }
    }
    return false;
  }

  async log(data: ErrorLogData): Promise<void> {
    // Chunk-load failures are deployment cache artifacts — never log them
    if (this.isChunkLoadError(data.message)) return;
    if (this.isDuplicate(data)) return;

    if (this.isLogging) {
      if (this.queue.length < this.maxQueueSize) {
        this.queue.push(data);
      }
      return;
    }

    this.isLogging = true;

    try {
      const errorData = {
        ...data,
        pageUrl: data.pageUrl || window.location.href,
        browserInfo: data.browserInfo || this.getBrowserInfo(),
      };

      await fetch('/api/errors/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(errorData),
        credentials: 'include',
      });
    } catch (err) {
      // Silent fail - avoid console noise in production
    } finally {
      this.isLogging = false;
      this.processQueue();
    }
  }

  private processQueue(): void {
    if (this.queue.length > 0) {
      const nextError = this.queue.shift();
      if (nextError) {
        this.log(nextError);
      }
    }
  }

  private getBrowserInfo(): Record<string, any> {
    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      cookiesEnabled: navigator.cookieEnabled,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      online: navigator.onLine,
      timestamp: new Date().toISOString(),
    };
  }

  logClientError(error: Error, toolId?: string): void {
    this.log({
      errorType: 'client',
      message: error.message,
      stack: error.stack,
      toolId,
      severity: 'error',
    });
  }

  logAPIError(endpoint: string, statusCode: number, message: string, toolId?: string): void {
    this.log({
      errorType: 'api',
      errorCode: `HTTP_${statusCode}`,
      message: `API Error: ${endpoint} - ${message}`,
      toolId,
      severity: statusCode >= 500 ? 'critical' : 'error',
    });
  }

  logAIError(message: string, toolId?: string): void {
    this.log({
      errorType: 'ai',
      message: `AI Error: ${message}`,
      toolId,
      severity: 'error',
    });
  }

  logExportError(message: string, toolId?: string): void {
    this.log({
      errorType: 'export',
      message: `Export Error: ${message}`,
      toolId,
      severity: 'warning',
    });
  }

  logAuthError(message: string): void {
    this.log({
      errorType: 'auth',
      message: `Auth Error: ${message}`,
      severity: 'warning',
    });
  }

  logCritical(message: string, stack?: string): void {
    this.log({
      errorType: 'client',
      message,
      stack,
      severity: 'critical',
    });
  }
}

export const errorLogger = new ErrorLogger();

window.onerror = (message, source, lineno, colno, error) => {
  errorLogger.logCritical(
    `Unhandled Error: ${message}`,
    error?.stack || `at ${source}:${lineno}:${colno}`
  );
  return false;
};

window.onunhandledrejection = (event) => {
  errorLogger.logCritical(
    `Unhandled Promise Rejection: ${event.reason?.message || event.reason}`,
    event.reason?.stack
  );
};
