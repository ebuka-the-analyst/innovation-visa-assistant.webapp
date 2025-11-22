import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Smartphone, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import { AuthHeader } from "@/components/AuthHeader";

export default function Handoff() {
  const [, setLocation] = useLocation();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [toolId, setToolId] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const loadSession = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');

        if (!token) {
          setError('No session token provided');
          setStatus('error');
          return;
        }

        // Fetch session data from backend
        const response = await fetch(`/api/session-handoff/${token}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          setError(errorData.error || 'Session not found or expired');
          setStatus('error');
          return;
        }

        const { toolId: sessionToolId, payload } = await response.json();
        setToolId(sessionToolId);

        // Store payload in localStorage for the tool to pick up
        localStorage.setItem(`${sessionToolId}_handoff`, JSON.stringify(payload));
        
        setStatus('success');

        // Redirect to tool after 2 seconds
        setTimeout(() => {
          setLocation(`/tools/${sessionToolId}`);
        }, 2000);
      } catch (err) {
        console.error('Handoff error:', err);
        setError('Failed to load session');
        setStatus('error');
      }
    };

    loadSession();
  }, [setLocation]);

  return (
    <>
      <AuthHeader />
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 flex items-center justify-center p-6">
        <Card className="max-w-md w-full p-8 text-center">
          {status === 'loading' && (
            <>
              <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-primary" />
              <h1 className="text-2xl font-bold mb-2">Loading Session...</h1>
              <p className="text-muted-foreground">
                Please wait while we restore your progress
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-green-600" />
              <h1 className="text-2xl font-bold mb-2">Session Loaded!</h1>
              <p className="text-muted-foreground mb-4">
                Redirecting you to the tool...
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Smartphone className="h-4 w-4" />
                <span>Continue from where you left off</span>
              </div>
            </>
          )}

          {status === 'error' && (
            <>
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-destructive" />
              <h1 className="text-2xl font-bold mb-2">Session Error</h1>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button 
                onClick={() => setLocation('/')}
                data-testid="button-return-home"
              >
                Return to Home
              </Button>
            </>
          )}
        </Card>
      </div>
    </>
  );
}
