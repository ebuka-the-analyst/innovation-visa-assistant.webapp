import { Component, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, RefreshCw, LayoutDashboard, Bug, ShieldCheck } from "lucide-react";
import { errorLogger } from "@/lib/errorLogger";
import logoLightImg from "@assets/official_logo.webp";
import {
  clearDeploymentAssetReloadAttempt,
  isDeploymentAssetError,
  recoverFromDeploymentAssetError,
} from "@/lib/deploymentAssetRecovery";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  toolId?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: string;
  errorReference: string;
}

function createErrorReference() {
  const time = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `IFVA-${time}-${random}`;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: "",
      errorReference: createErrorReference(),
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    if (recoverFromDeploymentAssetError(error)) {
      return;
    }

    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({ errorInfo: errorInfo.componentStack || "" });
    errorLogger.logCritical(
      `[${this.state.errorReference}] React Error Boundary: ${error.message}`,
      `${error.stack}\n\nComponent Stack:${errorInfo.componentStack}`
    );
  }

  handleRetry = () => {
    if (isDeploymentAssetError(this.state.error)) {
      clearDeploymentAssetReloadAttempt();
      window.location.reload();
      return;
    }

    window.location.reload();
  };

  handleGoDashboard = () => {
    window.location.href = "/dashboard";
  };

  handleReportBug = () => {
    const subject = encodeURIComponent(`Platform issue ${this.state.errorReference}`);
    const body = encodeURIComponent(
      `Reference: ${this.state.errorReference}\nPage: ${window.location.href}\nTimestamp: ${new Date().toISOString()}\n\nPlease tell us what you were trying to do when the issue appeared:\n\n`
    );
    window.location.href = `mailto:support@innovatorfoundervisaassistant.co.uk?subject=${subject}&body=${body}`;
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-slate-50">
          <Card className="max-w-xl w-full overflow-hidden border-slate-200 shadow-xl shadow-slate-200/60">
            <div className="h-1.5 bg-emerald-600" />
            <CardContent className="p-7 sm:p-10">
              <div className="flex justify-center mb-7">
                <img
                  src={logoLightImg}
                  alt="Innovator Founder Visa Assistant"
                  className="h-14 w-auto object-contain"
                />
              </div>

              <div className="mx-auto mb-5 w-14 h-14 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center">
                <AlertTriangle className="w-7 h-7 text-amber-600" />
              </div>

              <div className="text-center space-y-3">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-950">
                  We couldn&apos;t load this page
                </h1>
                <p className="text-slate-600 leading-7 max-w-md mx-auto">
                  Something interrupted this part of the platform. Your account and any work that was already saved are unaffected.
                </p>
              </div>

              <div className="mt-6 rounded-xl border border-emerald-100 bg-emerald-50/70 px-4 py-3 flex gap-3 items-start">
                <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-emerald-950">Your information remains protected</p>
                  <p className="text-sm text-emerald-800 mt-0.5">Reload the page to try again, or return to your dashboard.</p>
                </div>
              </div>

              <div className="flex flex-col gap-2.5 mt-7">
                <Button onClick={this.handleRetry} className="w-full gap-2 h-11 bg-emerald-600 hover:bg-emerald-700">
                  <RefreshCw className="w-4 h-4" />
                  Reload this page
                </Button>
                <Button variant="outline" onClick={this.handleGoDashboard} className="w-full gap-2 h-11">
                  <LayoutDashboard className="w-4 h-4" />
                  Return to Dashboard
                </Button>
                <Button variant="ghost" onClick={this.handleReportBug} className="w-full gap-2 text-slate-600">
                  <Bug className="w-4 h-4" />
                  Contact Support
                </Button>
              </div>

              <div className="mt-6 pt-5 border-t border-slate-100 text-center">
                <p className="text-xs text-slate-500">
                  Support reference <span className="font-mono font-medium text-slate-700">{this.state.errorReference}</span>
                </p>
                {import.meta.env.DEV && this.state.error && (
                  <details className="mt-4 text-left rounded-lg bg-slate-100 p-3 text-xs text-slate-700">
                    <summary className="cursor-pointer font-semibold">Development error details</summary>
                    <pre className="mt-2 whitespace-pre-wrap break-all font-mono">{this.state.error.message}</pre>
                  </details>
                )}
              </div>
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
    <div className="min-h-[60vh] flex items-center justify-center p-4 bg-slate-50">
      <Card className="max-w-md w-full border-slate-200">
        <CardContent className="p-7 text-center space-y-5">
          <img src={logoLightImg} alt="Innovator Founder Visa Assistant" className="h-11 w-auto mx-auto" />
          <div className="mx-auto w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-950">This tool needs to be reloaded</h2>
            <p className="text-slate-600 mt-2">
              {toolName ? `${toolName} could not be loaded just now.` : "This tool could not be loaded just now."} Please reload the page or return to your dashboard.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Button onClick={() => window.location.reload()} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
              <RefreshCw className="w-4 h-4" />
              Reload Page
            </Button>
            <Button variant="outline" onClick={() => { window.location.href = "/dashboard"; }}>
              Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ErrorBoundary;
