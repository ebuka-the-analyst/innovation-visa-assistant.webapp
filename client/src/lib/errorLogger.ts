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

class ErrorLogger {
  private isLogging = false;
  private queue: ErrorLogData[] = [];
  private maxQueueSize = 10;

  async log(data: ErrorLogData): Promise<void> {
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

      console.log('[ErrorLogger] Error logged successfully:', data.message);
    } catch (err) {
      console.error('[ErrorLogger] Failed to log error:', err);
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
