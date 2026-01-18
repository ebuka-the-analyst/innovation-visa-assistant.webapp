import { Component, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, RefreshCw, Home, Bug } from "lucide-react";
import { errorLogger } from "@/lib/errorLogger";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  toolId?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: string;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: "" };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({
      errorInfo: errorInfo.componentStack || ""
    });
    
    errorLogger.logCritical(
      `React Error Boundary: ${error.message}`,
      `${error.stack}\n\nComponent Stack:${errorInfo.componentStack}`
    );
  }

  handleRetry = () => {
    // For chunk loading errors (after deployments), do a full page reload
    const errorMessage = this.state.error?.message || '';
    if (errorMessage.includes('fetch') || errorMessage.includes('module') || errorMessage.includes('chunk')) {
      window.location.reload();
    } else {
      this.setState({ hasError: false, error: null, errorInfo: "" });
    }
  };

  handleGoHome = () => {
    window.location.href = "/";
  };

  handleReportBug = () => {
    const subject = encodeURIComponent("Bug Report: Application Error");
    const body = encodeURIComponent(
      `Error: ${this.state.error?.message}\n\nPage: ${window.location.href}\n\nTimestamp: ${new Date().toISOString()}\n\nPlease describe what you were doing when this error occurred:\n\n`
    );
    window.location.href = `mailto:support@innovatorfoundervisaassistant.co.uk?subject=${subject}&body=${body}`;
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-accent/5 to-primary/5">
          <Card className="max-w-lg w-full">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-destructive" />
              </div>
              <CardTitle className="text-2xl">Something went wrong</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-center text-muted-foreground">
                We encountered an unexpected error. Don't worry - your progress has been auto-saved.
              </p>
              
              {this.state.error && (
                <div className="bg-muted/50 rounded-lg p-3 text-sm">
                  <p className="font-medium text-destructive mb-1">Error Details:</p>
                  <p className="text-muted-foreground font-mono text-xs break-all">
                    {this.state.error.message}
                  </p>
                </div>
              )}

              <div className="flex flex-col gap-2 pt-4">
                <Button onClick={this.handleRetry} className="w-full gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Try Again
                </Button>
                <Button variant="outline" onClick={this.handleGoHome} className="w-full gap-2">
                  <Home className="w-4 h-4" />
                  Go to Homepage
                </Button>
                <Button variant="ghost" onClick={this.handleReportBug} className="w-full gap-2 text-muted-foreground">
                  <Bug className="w-4 h-4" />
                  Report This Issue
                </Button>
              </div>

              <p className="text-xs text-center text-muted-foreground pt-2">
                If this problem persists, please contact our support team.
              </p>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export function ToolErrorFallback({ toolName }: { toolName?: string }) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-2" />
          <CardTitle>Tool Loading Error</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            {toolName ? `The "${toolName}" tool` : "This tool"} failed to load properly.
          </p>
          <div className="flex gap-2 justify-center">
            <Button onClick={() => window.location.reload()} size="sm" className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Reload Page
            </Button>
            <Button variant="outline" onClick={() => window.history.back()} size="sm">
              Go Back
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ErrorBoundary;
