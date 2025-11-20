import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Download, CheckCircle, Home, FileText, Mail } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import novaAvatar from "@assets/generated_images/Nova_innovation_agent_avatar_e5dc5701.png";
import sterlingAvatar from "@assets/generated_images/Sterling_financial_agent_avatar_4fce3650.png";
import atlasAvatar from "@assets/generated_images/Atlas_growth_agent_avatar_a0808a5e.png";
import sageAvatar from "@assets/generated_images/Sage_compliance_agent_avatar_9dabb0a2.png";

// Helper to determine which agent and avatar to show based on stage text
const getAgentForStage = (stageText: string) => {
  const stage = stageText.toLowerCase();
  if (stage.includes('starting') || stage.includes('analyzing')) {
    return { name: "Nova", avatar: novaAvatar };
  } else if (stage.includes('building')) {
    return { name: "Sterling", avatar: sterlingAvatar };
  } else if (stage.includes('proofreading')) {
    return { name: "Atlas", avatar: atlasAvatar };
  } else if (stage.includes('finalizing') || stage.includes('complete')) {
    return { name: "Sage", avatar: sageAvatar };
  }
  return { name: "Nova", avatar: novaAvatar };
};

export default function GenerationProgress({ planId }: { planId: string }) {
  const [status, setStatus] = useState<string>('pending');
  const [currentStage, setCurrentStage] = useState<string>('Initializing...');
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [tier, setTier] = useState<string>('basic');
  const { toast } = useToast();

  useEffect(() => {
    if (!planId) return;

    const verifyPaymentAndStart = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const sessionId = urlParams.get('session_id');

        if (!sessionId) {
          setStatus('failed');
          toast({
            title: "Payment Required",
            description: "No payment session found. Please complete payment first.",
            variant: "destructive",
          });
          return;
        }

        const verifyResponse = await apiRequest('POST', '/api/payment/verify', { sessionId, planId });
        const verifyData = await verifyResponse.json();

        if (!verifyData.verified) {
          setStatus('failed');
          toast({
            title: "Payment Verification Failed",
            description: "Unable to verify payment. Please contact support.",
            variant: "destructive",
          });
          return;
        }

        await apiRequest('POST', '/api/generate/start', { planId });
      } catch (error) {
        console.error('Failed to start generation:', error);
        setStatus('failed');
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to start generation. Please contact support.",
          variant: "destructive",
        });
      }
    };

    verifyPaymentAndStart();

    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/generate/status/${planId}`);
        const data = await response.json();
        setStatus(data.status);
        
        if (data.tier) {
          setTier(data.tier);
        }
        
        if (data.currentGenerationStage) {
          setCurrentStage(data.currentGenerationStage);
        }
        
        if (data.status === 'completed' && data.pdfUrl) {
          setPdfUrl(data.pdfUrl);
          clearInterval(pollInterval);
        } else if (data.status === 'failed') {
          clearInterval(pollInterval);
          toast({
            title: "Generation Failed",
            description: "Something went wrong. Please contact support.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Status poll error:', error);
      }
    }, 3000);

    return () => clearInterval(pollInterval);
  }, [planId, toast]);

  const agentInfo = getAgentForStage(currentStage);
  
  // Calculate progress based on stage text
  const calculateProgress = (stage: string): number => {
    if (stage.includes('Complete')) return 100;
    if (stage.includes('Finalizing')) return 95;
    if (stage.includes('Proofreading')) return 75;
    if (stage.includes('Building')) return 50;
    if (stage.includes('Analyzing')) return 25;
    return 10;
  };
  
  const progress = calculateProgress(currentStage);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-accent/5 to-primary/5 p-4 relative overflow-hidden">
      {/* Animated particles background */}
      <div className="absolute inset-0">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-primary/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${5 + Math.random() * 10}s linear infinite`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      <div className="relative w-full max-w-2xl">
        {/* Main progress card */}
        <div className="bg-card/80 backdrop-blur-xl border border-border rounded-3xl p-12 shadow-2xl">
          {/* Circular progress with agent avatar */}
          <div className="flex flex-col items-center mb-12">
            <div className="relative w-64 h-64 mb-8">
              {/* SVG circular progress */}
              <svg className="transform -rotate-90 w-full h-full">
                <circle
                  cx="128"
                  cy="128"
                  r="120"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-muted/20"
                />
                <circle
                  cx="128"
                  cy="128"
                  r="120"
                  stroke="url(#gradient)"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 120}`}
                  strokeDashoffset={`${2 * Math.PI * 120 * (1 - progress / 100)}`}
                  className="transition-all duration-500 ease-out"
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#11b6e9" />
                    <stop offset="100%" stopColor="#10B981" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Agent avatar in center */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-chart-3 p-1 animate-pulse">
                    <div className="w-full h-full rounded-full bg-background/10 backdrop-blur-sm flex items-center justify-center overflow-hidden">
                      <img 
                        src={agentInfo.avatar} 
                        alt={agentInfo.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  
                  {/* Percentage */}
                  <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-4xl font-bold bg-gradient-to-r from-primary to-chart-3 bg-clip-text text-transparent">
                    {Math.round(progress)}%
                  </div>
                </div>
              </div>
            </div>

            {/* Current task description - REAL stages from backend */}
            <div className="text-center">
              <p className="text-2xl font-semibold mb-2 min-h-[32px]">
                {currentStage}
                {status === 'generating' && <span className="animate-pulse">...</span>}
              </p>
              <p className="text-muted-foreground">
                {agentInfo.name} is working on your plan
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <Progress value={progress} className="h-2 mb-8" />

          {/* Time estimate or completion */}
          {status === 'completed' && pdfUrl ? (
            <div className="space-y-6">
              <div className="flex items-center justify-center gap-2 text-chart-3">
                <CheckCircle className="w-6 h-6" />
                <p className="text-lg font-semibold">Business Plan Complete!</p>
              </div>
              
              <Button
                size="lg"
                className="w-full"
                onClick={() => window.open(pdfUrl, '_blank')}
                data-testid="button-download-pdf"
              >
                <Download className="w-5 h-5 mr-2" />
                Download Your Business Plan
              </Button>

              <div className="pt-4 border-t border-border">
                <p className="text-sm font-medium text-muted-foreground mb-3 text-center">What's Next?</p>
                <div className="space-y-2">
                  <Link href="/questionnaire">
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      data-testid="button-create-another"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Create Another Business Plan
                    </Button>
                  </Link>
                  
                  <Link href="/">
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      data-testid="button-home"
                    >
                      <Home className="w-4 h-4 mr-2" />
                      Return to Home
                    </Button>
                  </Link>

                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => window.location.href = 'mailto:support@visaprepai.com?subject=Business%20Plan%20Support'}
                    data-testid="button-support"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Contact Support
                  </Button>
                </div>
              </div>

              <div className="bg-accent/20 rounded-lg p-4 mt-4">
                <p className="text-xs font-medium text-foreground mb-2 text-center">
                  {tier === 'basic' && '✨ Basic Plan'}
                  {tier === 'premium' && '⭐ Premium Plan'}
                  {tier === 'enterprise' && '💎 Enterprise Plan'}
                </p>
                <div className="text-xs text-muted-foreground space-y-1">
                  {tier === 'basic' && (
                    <>
                      <p className="text-center">✓ Standard business plan template</p>
                      <p className="text-center">✓ 1 revision included</p>
                      <p className="text-center text-foreground font-medium mt-2">
                        Need more? Upgrade to Premium for detailed financials, 3 revisions, and endorsing body selection.
                      </p>
                    </>
                  )}
                  {tier === 'premium' && (
                    <>
                      <p className="text-center">✓ Enhanced business plan with detailed financials</p>
                      <p className="text-center">✓ 3 revisions included</p>
                      <p className="text-center">✓ Endorsing body selection guidance</p>
                      <p className="text-center">✓ Priority generation queue</p>
                    </>
                  )}
                  {tier === 'enterprise' && (
                    <>
                      <p className="text-center">✓ Full business plan package</p>
                      <p className="text-center">✓ Unlimited revisions</p>
                      <p className="text-center">✓ Human expert review</p>
                      <p className="text-center">✓ Cover letter generation</p>
                      <p className="text-center">✓ 24-hour delivery</p>
                    </>
                  )}
                </div>
              </div>

              <div className="bg-primary/10 rounded-lg p-4 mt-3">
                <p className="text-xs text-muted-foreground text-center">
                  <strong className="text-foreground">Next Steps for Your Visa:</strong><br />
                  Review your business plan, gather supporting evidence (letters of support, financial documents, patent applications), and submit to your chosen endorsing body.
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center text-sm text-muted-foreground">
              <p>Estimated time: {tier === 'enterprise' ? '6-8' : tier === 'premium' ? '5-7' : '3-5'} minutes</p>
              <p className="text-xs mt-1">We're generating a comprehensive business plan tailored to your needs</p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes float {
          0% {
            transform: translateY(100vh) translateX(0);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(-100px) translateX(${Math.random() * 100 - 50}px);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
