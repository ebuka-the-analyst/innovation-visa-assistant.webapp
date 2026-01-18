import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Download, CheckCircle, Home, FileText, Mail, Send, Linkedin, RefreshCw, LayoutDashboard, Clock, Lightbulb, BookOpen, Shield, TrendingUp, FileSpreadsheet, Eye, Twitter, Share2, Copy, MessageCircle, Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { useVisualPdfExport } from "@/hooks/useVisualPdfExport";
import novaAvatar from "@assets/generated_images/nova_innovation_agent_avatar.png";
import sterlingAvatar from "@assets/generated_images/sterling_financial_agent_avatar.png";
import atlasAvatar from "@assets/generated_images/atlas_growth_agent_avatar.png";
import sageAvatar from "@assets/generated_images/sage_compliance_agent_avatar.png";

const getAgentForStage = (stageText: string) => {
  const stage = stageText.toLowerCase();
  if (stage.includes('starting') || stage.includes('analyzing') || stage.includes('executive') || stage.includes('founder')) {
    return { name: "Nova", avatar: novaAvatar, role: "Innovation Analyst" };
  } else if (stage.includes('building') || stage.includes('financial') || stage.includes('market') || stage.includes('viability')) {
    return { name: "Sterling", avatar: sterlingAvatar, role: "Financial Strategist" };
  } else if (stage.includes('proofreading') || stage.includes('scalability') || stage.includes('growth') || stage.includes('team')) {
    return { name: "Atlas", avatar: atlasAvatar, role: "Growth Expert" };
  } else if (stage.includes('finalizing') || stage.includes('complete') || stage.includes('regulatory') || stage.includes('compliance') || stage.includes('risk') || stage.includes('endorsing')) {
    return { name: "Sage", avatar: sageAvatar, role: "Compliance Specialist" };
  }
  return { name: "Nova", avatar: novaAvatar, role: "Innovation Analyst" };
};

const visaTips = [
  { icon: Lightbulb, title: "Innovation Tip", text: "Endorsers look for genuinely new ideas that differ from existing market solutions. Highlight what makes your approach unique." },
  { icon: Shield, title: "Compliance Note", text: "The UK removed the £50,000 minimum investment requirement in April 2023. Focus on demonstrating viable growth potential instead." },
  { icon: TrendingUp, title: "Scalability Focus", text: "Job creation is a key success metric. Plan to create at least 10 skilled jobs within 3-5 years for a strong application." },
  { icon: BookOpen, title: "Preparation Tip", text: "Gather supporting documents now: bank statements, letters of intent, market research, and any IP documentation." },
  { icon: Lightbulb, title: "Endorser Insight", text: "Each endorsing body has different focus areas. Envestors specializes in tech, while others focus on social enterprise or manufacturing." },
  { icon: Shield, title: "Interview Ready", text: "Endorsers will interview you. Practice explaining your innovation, market opportunity, and growth plans in 2-3 minutes." },
  { icon: TrendingUp, title: "Financial Clarity", text: "Be prepared to explain your revenue model, customer acquisition costs, and path to profitability with specific numbers." },
  { icon: BookOpen, title: "Evidence Pack", text: "Strong applications include customer testimonials, pilot results, or letters of support from industry experts." },
  { icon: Lightbulb, title: "Market Research", text: "Cite credible sources for market size claims. Endorsers verify your TAM/SAM/SOM calculations." },
  { icon: Shield, title: "Contact Points", text: "Plan 6+ touchpoints with your endorser over 3 years. This ongoing relationship is part of the visa requirements." },
  { icon: TrendingUp, title: "Team Building", text: "Show a realistic hiring timeline aligned with revenue growth. Premature hiring is a red flag for endorsers." },
  { icon: BookOpen, title: "IP Strategy", text: "Even if you don't have patents, document your proprietary methods, trade secrets, or unique processes." },
];

const tierSectionCounts: Record<string, number> = {
  free: 6,
  basic: 11,
  premium: 13,
  enterprise: 13,
  ultimate: 17,
};

const tierPageTargets: Record<string, string> = {
  free: "10-15",
  basic: "25-35",
  premium: "40-60",
  enterprise: "50-80",
  ultimate: "80+",
};

export default function GenerationProgress({ planId }: { planId: string }) {
  const [status, setStatus] = useState<string>('pending');
  const [currentStage, setCurrentStage] = useState<string>('Initializing...');
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [tier, setTier] = useState<string>('basic');
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [currentTipIndex, setCurrentTipIndex] = useState<number>(0);
  const [sectionNumber, setSectionNumber] = useState<number>(0);
  const [showFormatDialog, setShowFormatDialog] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [businessName, setBusinessName] = useState<string>('Business Plan');
  const [visualPdfProgress, setVisualPdfProgress] = useState<string>('');
  const { toast } = useToast();
  const { exportVisualPdf, isExporting: isVisualExporting } = useVisualPdfExport();

  // Download handler for selected format
  const handleDownload = async (format: 'pdf' | 'word') => {
    setIsExporting(true);
    try {
      if (format === 'pdf') {
        // Use visual PDF export (with charts)
        const success = await exportVisualPdf({
          planId,
          businessName,
          onProgress: setVisualPdfProgress
        });
        if (!success) {
          // Fallback to text-only PDF
          window.open(pdfUrl || `/api/download/pdf/${planId}`, '_blank');
        }
      } else {
        // Use Word endpoint
        window.open(`/api/download/word/${planId}`, '_blank');
      }
      setShowFormatDialog(false);
      setVisualPdfProgress('');
      toast({
        title: "Download Started",
        description: `Your business plan is downloading as ${format.toUpperCase()}.`,
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
      setVisualPdfProgress('');
    }
  };

  useEffect(() => {
    if (!planId) return;

    const verifyPaymentAndStart = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const sessionId = urlParams.get('session_id');
        const isFree = urlParams.get('free') === 'true';
        const alreadySubscribed = urlParams.get('already_subscribed') === 'true';

        // Free tier - no payment needed
        if (isFree) {
          localStorage.setItem('trigger-onboarding-tour', 'true');
          await apiRequest('POST', '/api/generate/start', { planId });
          return;
        }

        // Premium/subscribed users - no payment session needed
        if (alreadySubscribed) {
          localStorage.setItem('trigger-onboarding-tour', 'true');
          await apiRequest('POST', '/api/generate/start', { planId });
          return;
        }

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

        localStorage.setItem('trigger-onboarding-tour', 'true');
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
        
        if (data.businessName) {
          setBusinessName(data.businessName);
        }
        
        if (data.currentGenerationStage) {
          setCurrentStage(data.currentGenerationStage);
          const match = data.currentGenerationStage.match(/Section (\d+)/);
          if (match) {
            setSectionNumber(parseInt(match[1]));
          }
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
    }, 2500);

    return () => clearInterval(pollInterval);
  }, [planId, toast]);

  useEffect(() => {
    if (status !== 'completed' && status !== 'failed') {
      const timer = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [status]);

  useEffect(() => {
    const tipRotation = setInterval(() => {
      setCurrentTipIndex(prev => (prev + 1) % visaTips.length);
    }, 12000);
    return () => clearInterval(tipRotation);
  }, []);

  const agentInfo = getAgentForStage(currentStage);
  const totalSections = tierSectionCounts[tier] || 8;
  
  const calculateProgress = (): number => {
    if (status === 'completed') return 100;
    if (currentStage.includes('Finalizing') || currentStage.includes('PDF')) return 95;
    if (sectionNumber > 0) {
      return Math.min(90, Math.round((sectionNumber / totalSections) * 90) + 5);
    }
    if (currentStage.includes('Starting') || currentStage.includes('preparing')) return 5;
    return 10;
  };
  
  const progress = calculateProgress();
  
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getEstimatedRemaining = (): string => {
    if (progress >= 95) return "Almost there...";
    if (progress === 0) return "Calculating...";
    
    const baseTimePerSection = tier === 'ultimate' ? 45 : tier === 'enterprise' ? 35 : tier === 'premium' ? 30 : 25;
    const remainingSections = totalSections - sectionNumber;
    const estimatedSecondsRemaining = remainingSections * baseTimePerSection;
    
    if (estimatedSecondsRemaining < 60) return "Less than a minute";
    const mins = Math.ceil(estimatedSecondsRemaining / 60);
    return `~${mins} minute${mins > 1 ? 's' : ''} remaining`;
  };

  const currentTip = visaTips[currentTipIndex];
  const TipIcon = currentTip.icon;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-accent/5 to-primary/5 p-4 relative overflow-hidden">
      <div className="absolute inset-0">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-primary/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${8 + Math.random() * 12}s linear infinite`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      <div className="relative w-full max-w-3xl space-y-6">
        <div className="bg-card/90 backdrop-blur-xl border border-border rounded-3xl p-8 md:p-12 shadow-2xl">
          <div className="flex flex-col items-center mb-8">
            <div className="relative w-48 h-48 md:w-56 md:h-56 mb-6">
              <svg className="transform -rotate-90 w-full h-full">
                <circle
                  cx="50%"
                  cy="50%"
                  r="45%"
                  stroke="currentColor"
                  strokeWidth="6"
                  fill="none"
                  className="text-muted/20"
                />
                <circle
                  cx="50%"
                  cy="50%"
                  r="45%"
                  stroke="url(#progressGradient)"
                  strokeWidth="6"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 45}`}
                  strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
                  className="transition-all duration-700 ease-out"
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#41B6E6" />
                    <stop offset="100%" stopColor="#10B981" />
                  </linearGradient>
                </defs>
              </svg>

              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  <div className="w-28 h-28 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-primary to-chart-3 p-1 animate-pulse">
                    <div className="w-full h-full rounded-full bg-background/10 backdrop-blur-sm flex items-center justify-center overflow-hidden">
                      <img 
                        src={agentInfo.avatar} 
                        alt={agentInfo.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center space-y-2">
              <div className="text-xl font-bold bg-gradient-to-r from-primary to-chart-3 bg-clip-text text-transparent">
                {Math.round(progress)}%
              </div>
              <p className="text-sm text-muted-foreground">
                {agentInfo.name} ({agentInfo.role}) is working
              </p>
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Section {status === 'completed' ? totalSections : Math.min(sectionNumber || 1, totalSections)} of {totalSections}</span>
              <span className="text-muted-foreground">{tierPageTargets[tier]} pages</span>
            </div>
            <Progress value={progress} className="h-3" />
            <p className="text-center text-lg font-medium min-h-[28px]">
              {currentStage}
              {status === 'generating' && <span className="animate-pulse">...</span>}
            </p>
          </div>

          {/* Only show elapsed/remaining time while generating, hide when completed */}
          {status !== 'completed' && (
            <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground border-t border-border pt-6">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>Elapsed: {formatTime(elapsedTime)}</span>
              </div>
              <div className="h-4 w-px bg-border" />
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                <span>{getEstimatedRemaining()}</span>
              </div>
            </div>
          )}

          {status === 'completed' && pdfUrl ? (
            <div className="space-y-6 mt-8 border-t border-border pt-8">
              <div className="flex items-center justify-center gap-2 text-emerald-500">
                <CheckCircle className="w-8 h-8" />
                <p className="text-xl font-bold">
                  {tier === 'ultimate' ? 'Your Ultimate Business Plan is Complete!' : 'Your Business Plan is Ready!'}
                </p>
              </div>

              {/* View Full Plan with Charts - Primary Action */}
              <div className="space-y-3">
                <Button
                  size="lg"
                  className="w-full h-14 bg-emerald-500 hover:bg-emerald-600 text-white font-bold shadow-lg text-lg"
                  onClick={() => window.open(`/api/view/html/${planId}`, '_blank')}
                  data-testid="button-view-full-plan"
                >
                  <Eye className="w-6 h-6 mr-3" />
                  View Full Plan with Charts
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  Opens your complete business plan with all charts and tables. Use "Print to PDF" for best quality.
                </p>
              </div>

              {/* Download Options */}
              <div className="space-y-3">
                <p className="text-sm font-semibold text-center text-muted-foreground">Download Options</p>
                
                {/* Visual PDF Progress Indicator */}
                {(isVisualExporting || visualPdfProgress) && (
                  <div className="bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 rounded-lg p-3 text-center">
                    <div className="flex items-center justify-center gap-2 text-emerald-700 dark:text-emerald-300">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm font-medium">{visualPdfProgress || 'Generating PDF with charts...'}</span>
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-3">
                  {/* PDF with Charts - Primary */}
                  <Button
                    size="lg"
                    className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold shadow-md"
                    onClick={() => handleDownload('pdf')}
                    disabled={isVisualExporting || isExporting}
                    data-testid="button-download-pdf"
                  >
                    {isVisualExporting ? (
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    ) : (
                      <Download className="w-5 h-5 mr-2" />
                    )}
                    PDF (with Charts)
                  </Button>
                  
                  {/* Word with Charts */}
                  <Button
                    size="lg"
                    className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold shadow-md"
                    onClick={() => handleDownload('word')}
                    disabled={isExporting}
                    data-testid="button-download-word"
                  >
                    <Download className="w-5 h-5 mr-2" />
                    Word (with Charts)
                  </Button>
                  
                  {/* Preview buttons */}
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950 font-semibold"
                    onClick={() => window.open(`/api/view/html/${planId}`, '_blank')}
                    data-testid="button-preview-html"
                  >
                    <Eye className="w-5 h-5 mr-2" />
                    Preview Plan
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950 font-semibold"
                    onClick={() => window.open(`/api/view/word/${planId}`, '_blank')}
                    data-testid="button-view-word"
                  >
                    <Eye className="w-5 h-5 mr-2" />
                    Preview Word
                  </Button>
                </div>
              </div>

              {/* Social Sharing Section */}
              <div className="space-y-3 pt-4 border-t border-border">
                <p className="text-sm font-semibold text-center text-muted-foreground flex items-center justify-center gap-2">
                  <Share2 className="w-4 h-4" />
                  Share Your Success
                </p>
                <div className="grid grid-cols-5 gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-12 w-full hover-elevate"
                    onClick={() => {
                      const text = `Hey founders! Just found this amazing AI tool that writes your UK Innovator Founder Visa business plan for you. Saved me WEEKS of work - it knows exactly what endorsers want to see. Seriously, check it out!\n\n#InnovatorFounderVisa #UKStartup #Founders`;
                      const url = window.location.origin;
                      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank', 'width=600,height=400');
                    }}
                    data-testid="button-share-twitter"
                    title="Share on X/Twitter"
                  >
                    <Twitter className="w-5 h-5" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-12 w-full hover-elevate"
                    onClick={() => {
                      const text = `Hey everyone! Just wanted to share something that really helped me.\n\nI found this AI tool that creates your UK Innovator Founder Visa business plan - and it's honestly amazing. It knows exactly what endorsers look for and writes all 12 sections for you.\n\nWhat would normally take weeks, I finished in under an hour. If you're thinking about the UK visa route, definitely check this out - it's a game changer!`;
                      const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.origin)}`;
                      window.open(url, '_blank', 'width=600,height=600');
                    }}
                    data-testid="button-share-linkedin"
                    title="Share on LinkedIn"
                  >
                    <Linkedin className="w-5 h-5" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-12 w-full hover-elevate"
                    onClick={() => {
                      const text = `Hey! You HAVE to check this out - I just found this AI tool that writes your UK Innovator Founder Visa business plan for you. It saved me weeks of work and knows exactly what endorsers want. Seriously amazing! ${window.location.origin}`;
                      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                    }}
                    data-testid="button-share-whatsapp"
                    title="Share on WhatsApp"
                  >
                    <MessageCircle className="w-5 h-5" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-12 w-full hover-elevate"
                    onClick={() => {
                      const subject = `You need to see this - UK Visa business plan tool`;
                      const body = `Hey!\n\nI just had to share this with you - I found this amazing AI tool that creates your UK Innovator Founder Visa business plan.\n\nIt writes all 12 sections that endorsers look for, and what normally takes weeks I finished in under an hour. Honestly it's been a game changer for my application.\n\nIf you're thinking about the UK visa route, definitely check it out:\n${window.location.origin}\n\nLet me know what you think!`;
                      window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                    }}
                    data-testid="button-share-email"
                    title="Share via Email"
                  >
                    <Mail className="w-5 h-5" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-12 w-full hover-elevate"
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      toast({
                        title: "Link Copied!",
                        description: "Share link copied to clipboard.",
                      });
                    }}
                    data-testid="button-copy-link"
                    title="Copy Link"
                  >
                    <Copy className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              {/* Actions Section - Hide revision for free tier */}
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-border">
                {tier !== 'free' && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      toast({
                        title: "Request Revision",
                        description: "Our team will review your request within 24 hours.",
                      });
                      window.location.href = `mailto:support@innovatorfoundervisaassistant.co.uk?subject=Revision Request - Plan ${planId}`;
                    }}
                    data-testid="button-request-revision"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Request Revision
                  </Button>
                )}
                
                <Link href="/dashboard" className={tier === 'free' ? 'col-span-2' : ''}>
                  <Button variant="outline" className="w-full" data-testid="button-view-dashboard">
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    View Dashboard
                  </Button>
                </Link>
              </div>

              {/* Quick Actions */}
              <div className="pt-4 border-t border-border">
                <p className="text-sm font-medium text-muted-foreground mb-3 text-center">Quick Actions</p>
                <div className="grid grid-cols-3 gap-2">
                  <Link href="/questionnaire">
                    <Button variant="ghost" size="sm" className="w-full flex-col h-auto py-3 gap-1" data-testid="button-create-another">
                      <FileText className="w-4 h-4" />
                      <span className="text-xs">New Plan</span>
                    </Button>
                  </Link>
                  
                  <Link href="/">
                    <Button variant="ghost" size="sm" className="w-full flex-col h-auto py-3 gap-1" data-testid="button-home">
                      <Home className="w-4 h-4" />
                      <span className="text-xs">Home</span>
                    </Button>
                  </Link>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full flex-col h-auto py-3 gap-1"
                    onClick={() => window.location.href = 'mailto:support@innovatorfoundervisaassistant.co.uk'}
                    data-testid="button-support"
                  >
                    <Mail className="w-4 h-4" />
                    <span className="text-xs">Support</span>
                  </Button>
                </div>
              </div>

              <div className="bg-accent/20 rounded-lg p-4 mt-4">
                <p className="text-xs font-medium text-foreground mb-2 text-center">
                  {tier === 'free' && 'Free Plan'}
                  {tier === 'basic' && 'Basic Plan'}
                  {tier === 'premium' && 'Premium Plan'}
                  {tier === 'enterprise' && 'Enterprise Plan'}
                  {tier === 'ultimate' && 'Ultimate Plan'}
                </p>
                <div className="text-xs text-muted-foreground space-y-1">
                  {tier === 'free' && (
                    <>
                      <p className="text-center">10-15 page business plan</p>
                      <p className="text-center">13 essential tools</p>
                      <p className="text-center text-foreground font-medium mt-2">
                        Upgrade to Basic for 25-35 pages and 20 tools.
                      </p>
                    </>
                  )}
                  {tier === 'basic' && (
                    <>
                      <p className="text-center">25-35 page business plan</p>
                      <p className="text-center">20 tools total</p>
                      <p className="text-center">1 revision included</p>
                    </>
                  )}
                  {tier === 'premium' && (
                    <>
                      <p className="text-center">40-60 page business plan</p>
                      <p className="text-center">83 tools total</p>
                      <p className="text-center">3 revisions included</p>
                      <p className="text-center">Endorsing body selection guidance</p>
                    </>
                  )}
                  {tier === 'enterprise' && (
                    <>
                      <p className="text-center">50-80 page business plan</p>
                      <p className="text-center">All 109 tools</p>
                      <p className="text-center">Unlimited revisions</p>
                      <p className="text-center">IP & patent strategy included</p>
                    </>
                  )}
                  {tier === 'ultimate' && (
                    <>
                      <p className="text-center">80+ page comprehensive business plan</p>
                      <p className="text-center">All 109 tools + VIP support</p>
                      <p className="text-center">RFE Defense Strategy included</p>
                      <p className="text-center">Appeal Strategy & Success Coaching</p>
                      <p className="text-center">Personal strategist access</p>
                      <p className="text-center">Success guarantee</p>
                    </>
                  )}
                </div>
              </div>

              <div className="bg-primary/10 rounded-lg p-4 mt-3">
                <p className="text-xs text-muted-foreground text-center">
                  <strong className="text-foreground">Next Steps for Your Visa:</strong><br />
                  Review your business plan, gather supporting evidence, and submit to your chosen endorsing body.
                </p>
              </div>
            </div>
          ) : null}
        </div>

        {status !== 'completed' && status !== 'failed' && (
          <Card className="bg-card/80 backdrop-blur-xl border border-border p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/10 rounded-full shrink-0">
                <TipIcon className="w-5 h-5 text-primary" />
              </div>
              <div className="space-y-1 min-h-[60px]">
                <p className="font-medium text-sm">{currentTip.title}</p>
                <p className="text-sm text-muted-foreground">{currentTip.text}</p>
              </div>
            </div>
            <div className="flex justify-center gap-1.5 mt-4">
              {visaTips.map((_, idx) => (
                <div
                  key={idx}
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${
                    idx === currentTipIndex ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              ))}
            </div>
          </Card>
        )}

        {status !== 'completed' && status !== 'failed' && (
          <div className="text-center text-xs text-muted-foreground space-y-1">
            <p>Your {tier.charAt(0).toUpperCase() + tier.slice(1)} plan is being crafted with care.</p>
            <p>Please keep this page open. You'll be notified when it's ready.</p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes float {
          0% {
            transform: translateY(100vh) translateX(0);
            opacity: 0;
          }
          10% {
            opacity: 0.5;
          }
          90% {
            opacity: 0.5;
          }
          100% {
            transform: translateY(-100px) translateX(${Math.random() * 50 - 25}px);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
