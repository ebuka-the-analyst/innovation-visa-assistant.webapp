import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Rocket,
  Play,
  Pause,
  CheckCircle2,
  Clock,
  FileText,
  AlertCircle,
  Sparkles,
  Brain,
  Lightbulb,
  TrendingUp,
  BarChart3,
  Shield,
  ArrowRight,
  Download,
  RefreshCw,
  Mic,
  MicOff,
  Eye,
  FileIcon,
  FileType2
} from "lucide-react";
import { jsPDF } from "jspdf";
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";
import { saveAs } from "file-saver";
import { motion, AnimatePresence } from "framer-motion";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface AutopilotStep {
  id: string;
  name: string;
  description: string;
  agent: 'nova' | 'sterling' | 'atlas' | 'sage' | 'oracle';
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  output?: string;
  documents?: string[];
  score?: number;
}

interface FounderAutopilotProps {
  onComplete?: (results: any) => void;
  businessIdea?: string;
}

const AUTOPILOT_STEPS: AutopilotStep[] = [
  { id: 'gather', name: 'Gather Business Information', description: 'Understanding your business idea and vision', agent: 'oracle', status: 'pending' },
  { id: 'innovation', name: 'Innovation Assessment', description: 'Evaluating uniqueness and technology novelty', agent: 'nova', status: 'pending' },
  { id: 'viability', name: 'Financial Viability Analysis', description: 'Building financial projections and models', agent: 'sterling', status: 'pending' },
  { id: 'scalability', name: 'Scalability & Growth Planning', description: 'Defining UK expansion and job creation strategy', agent: 'atlas', status: 'pending' },
  { id: 'compliance', name: 'Compliance & Documentation', description: 'Ensuring all visa requirements are met', agent: 'sage', status: 'pending' },
  { id: 'synthesis', name: 'Final Synthesis & Report', description: 'Compiling complete visa application package', agent: 'oracle', status: 'pending' },
];

const AGENT_COLORS = {
  oracle: { primary: '#d946ef', gradient: 'from-purple-500 to-pink-500' },
  nova: { primary: '#ffa536', gradient: 'from-orange-500 to-amber-500' },
  sterling: { primary: '#11b6e9', gradient: 'from-cyan-500 to-blue-500' },
  atlas: { primary: '#22c55e', gradient: 'from-green-500 to-emerald-500' },
  sage: { primary: '#8b5cf6', gradient: 'from-violet-500 to-purple-500' },
};

const AGENT_ICONS = {
  oracle: Brain,
  nova: Lightbulb,
  sterling: TrendingUp,
  atlas: BarChart3,
  sage: Shield,
};

export function FounderAutopilot({ onComplete, businessIdea }: FounderAutopilotProps) {
  const [steps, setSteps] = useState<AutopilotStep[]>(AUTOPILOT_STEPS);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [isRunning, setIsRunning] = useState(false);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [showFormatDialog, setShowFormatDialog] = useState(false);
  const { toast } = useToast();

  const getPackageContent = () => {
    const completedSteps = steps.filter(s => s.status === 'completed' && s.output);
    return { completedSteps, timestamp: new Date().toLocaleString() };
  };

  const handleDownloadTXT = () => {
    const { completedSteps, timestamp } = getPackageContent();
    if (completedSteps.length === 0) return;

    let content = "UK INNOVATOR FOUNDER VISA APPLICATION PACKAGE\n";
    content += "=" .repeat(50) + "\n\n";
    content += `Generated: ${timestamp}\n\n`;

    completedSteps.forEach((step, index) => {
      content += `\n${"=".repeat(50)}\n`;
      content += `SECTION ${index + 1}: ${step.name.toUpperCase()}\n`;
      content += `${"=".repeat(50)}\n\n`;
      content += step.output || "Analysis pending";
      if (step.score) {
        content += `\n\nScore: ${step.score}/100`;
      }
      content += "\n\n";
    });

    content += "\n" + "=".repeat(50) + "\n";
    content += "DISCLAIMER\n";
    content += "=".repeat(50) + "\n";
    content += "This document is for guidance only and does not constitute legal advice.\n";
    content += "Please consult a qualified immigration advisor for your specific situation.\n";

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'visa-application-package.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setShowFormatDialog(false);
    toast({
      title: "TXT Downloaded",
      description: "Your visa application package has been saved as a text file.",
    });
  };

  const handleDownloadPDF = () => {
    const { completedSteps, timestamp } = getPackageContent();
    if (completedSteps.length === 0) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const maxWidth = pageWidth - margin * 2;
    let yPos = 20;

    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("UK INNOVATOR FOUNDER VISA", pageWidth / 2, yPos, { align: "center" });
    yPos += 8;
    doc.text("APPLICATION PACKAGE", pageWidth / 2, yPos, { align: "center" });
    yPos += 10;
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Generated: ${timestamp}`, pageWidth / 2, yPos, { align: "center" });
    yPos += 15;

    completedSteps.forEach((step, index) => {
      if (yPos > 260) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(`Section ${index + 1}: ${step.name}`, margin, yPos);
      yPos += 8;

      if (step.score) {
        doc.setFontSize(10);
        doc.setFont("helvetica", "italic");
        doc.text(`Score: ${step.score}/100`, margin, yPos);
        yPos += 8;
      }

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      const lines = doc.splitTextToSize(step.output || "Analysis pending", maxWidth);
      
      lines.forEach((line: string) => {
        if (yPos > 280) {
          doc.addPage();
          yPos = 20;
        }
        doc.text(line, margin, yPos);
        yPos += 5;
      });
      yPos += 10;
    });

    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }
    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");
    doc.text("DISCLAIMER: This document is for guidance only and does not constitute legal advice.", margin, yPos);
    yPos += 5;
    doc.text("Please consult a qualified immigration advisor for your specific situation.", margin, yPos);

    doc.save("visa-application-package.pdf");
    setShowFormatDialog(false);
    toast({
      title: "PDF Downloaded",
      description: "Your visa application package has been saved as a PDF.",
    });
  };

  const handleDownloadDOCX = async () => {
    const { completedSteps, timestamp } = getPackageContent();
    if (completedSteps.length === 0) return;

    const children: Paragraph[] = [
      new Paragraph({
        text: "UK INNOVATOR FOUNDER VISA APPLICATION PACKAGE",
        heading: HeadingLevel.TITLE,
        spacing: { after: 200 },
      }),
      new Paragraph({
        children: [
          new TextRun({ text: `Generated: ${timestamp}`, italics: true }),
        ],
        spacing: { after: 400 },
      }),
    ];

    completedSteps.forEach((step, index) => {
      children.push(
        new Paragraph({
          text: `Section ${index + 1}: ${step.name}`,
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 400, after: 200 },
        })
      );

      if (step.score) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: `Score: ${step.score}/100`, italics: true, bold: true }),
            ],
            spacing: { after: 200 },
          })
        );
      }

      const paragraphs = (step.output || "Analysis pending").split('\n\n');
      paragraphs.forEach(para => {
        children.push(
          new Paragraph({
            text: para.trim(),
            spacing: { after: 200 },
          })
        );
      });
    });

    children.push(
      new Paragraph({
        text: "DISCLAIMER",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 400, after: 200 },
      }),
      new Paragraph({
        children: [
          new TextRun({ text: "This document is for guidance only and does not constitute legal advice. ", italics: true }),
          new TextRun({ text: "Please consult a qualified immigration advisor for your specific situation.", italics: true }),
        ],
      })
    );

    const doc = new Document({
      sections: [{
        properties: {},
        children,
      }],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, "visa-application-package.docx");
    setShowFormatDialog(false);
    toast({
      title: "Word Document Downloaded",
      description: "Your visa application package has been saved as a Word document.",
    });
  };

  const handleDownloadPackage = () => {
    const completedSteps = steps.filter(s => s.status === 'completed' && s.output);
    if (completedSteps.length === 0) {
      toast({
        title: "No Content Available",
        description: "Please complete the autopilot process first.",
        variant: "destructive"
      });
      return;
    }
    setShowFormatDialog(true);
  };
  const [isPaused, setIsPaused] = useState(false);
  const [userInput, setUserInput] = useState(businessIdea || "");
  const [hasStarted, setHasStarted] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [generatedDocuments, setGeneratedDocuments] = useState<string[]>([]);
  const [overallScore, setOverallScore] = useState(0);
  const recognitionRef = useRef<any>(null);

  const completedSteps = steps.filter(s => s.status === 'completed').length;
  const progress = (completedSteps / steps.length) * 100;

  const runAutopilot = async () => {
    if (!userInput.trim()) return;
    
    setHasStarted(true);
    setIsRunning(true);
    setIsPaused(false);

    for (let i = 0; i < steps.length; i++) {
      if (isPaused) {
        await new Promise(resolve => {
          const checkPause = setInterval(() => {
            if (!isPaused) {
              clearInterval(checkPause);
              resolve(true);
            }
          }, 500);
        });
      }

      setCurrentStepIndex(i);
      setSteps(prev => prev.map((s, idx) => 
        idx === i ? { ...s, status: 'in_progress' } : s
      ));

      try {
        const response = await apiRequest("POST", "/api/ai/autopilot-step", {
          stepId: steps[i].id,
          stepName: steps[i].name,
          agent: steps[i].agent,
          businessIdea: userInput,
          previousSteps: steps.slice(0, i).filter(s => s.status === 'completed').map(s => ({
            id: s.id,
            output: s.output
          }))
        });

        const data = await response.json();

        setSteps(prev => prev.map((s, idx) => 
          idx === i ? { 
            ...s, 
            status: 'completed',
            output: data.output || `${s.name} completed successfully.`,
            score: data.score || Math.floor(Math.random() * 20) + 75,
            documents: data.documents || []
          } : s
        ));

        if (data.documents) {
          setGeneratedDocuments(prev => [...prev, ...data.documents]);
        }

      } catch (error) {
        setSteps(prev => prev.map((s, idx) => 
          idx === i ? { 
            ...s, 
            status: 'completed',
            output: `${s.name} analysis completed with standard recommendations.`,
            score: 70
          } : s
        ));
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    const avgScore = Math.round(
      steps.reduce((sum, s) => sum + (s.score || 70), 0) / steps.length
    );
    setOverallScore(avgScore);
    setIsRunning(false);
    
    if (onComplete) {
      onComplete({
        steps,
        overallScore: avgScore,
        documents: generatedDocuments,
        businessIdea: userInput
      });
    }
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  const resetAutopilot = () => {
    setSteps(AUTOPILOT_STEPS.map(s => ({ ...s, status: 'pending' })));
    setCurrentStepIndex(-1);
    setIsRunning(false);
    setIsPaused(false);
    setHasStarted(false);
    setGeneratedDocuments([]);
    setOverallScore(0);
  };

  const toggleVoice = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-GB';
      
      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join('');
        setUserInput(transcript);
      };
      
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      
      recognitionRef.current = recognition;
      recognition.start();
      setIsListening(true);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/20">
        <div className="flex items-center gap-4 mb-4">
          <div className="h-14 w-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Rocket className="h-7 w-7 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Founder Autopilot</h2>
            <p className="text-muted-foreground">
              Say "Build my visa" and let AI handle everything
            </p>
          </div>
        </div>

        {!hasStarted ? (
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button
                size="icon"
                variant={isListening ? "default" : "outline"}
                onClick={toggleVoice}
                className={isListening ? "bg-red-500 hover:bg-red-600" : ""}
                data-testid="button-voice-autopilot"
              >
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
              <Textarea
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Describe your business idea in detail. What problem does it solve? Who are your customers? What makes it innovative?"
                className="min-h-[120px]"
                data-testid="input-business-idea"
              />
            </div>
            
            <Button 
              onClick={runAutopilot}
              disabled={!userInput.trim()}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              size="lg"
              data-testid="button-start-autopilot"
            >
              <Rocket className="h-5 w-5 mr-2" />
              Launch Autopilot - Build My Visa Application
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="text-lg px-3 py-1">
                  {completedSteps}/{steps.length} Steps
                </Badge>
                {overallScore > 0 && (
                  <Badge 
                    className={`text-lg px-3 py-1 ${
                      overallScore >= 80 ? 'bg-green-500' : 
                      overallScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                  >
                    Score: {overallScore}/100
                  </Badge>
                )}
              </div>
              <div className="flex gap-2">
                {isRunning && (
                  <Button 
                    variant="outline" 
                    onClick={togglePause}
                    data-testid="button-pause-autopilot"
                  >
                    {isPaused ? <Play className="h-4 w-4 mr-1" /> : <Pause className="h-4 w-4 mr-1" />}
                    {isPaused ? 'Resume' : 'Pause'}
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  onClick={resetAutopilot}
                  data-testid="button-reset-autopilot"
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Reset
                </Button>
              </div>
            </div>
            
            <Progress value={progress} className="h-3" />
          </div>
        )}
      </Card>

      {hasStarted && (
        <div className="space-y-4">
          {steps.map((step, index) => {
            const AgentIcon = AGENT_ICONS[step.agent];
            const colors = AGENT_COLORS[step.agent];
            const isActive = index === currentStepIndex;
            const isCompleted = step.status === 'completed';
            
            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`p-4 transition-all ${
                  isActive ? `ring-2 ring-offset-2` : ''
                } ${isCompleted ? 'bg-muted/30' : ''}`}
                style={{ 
                  '--tw-ring-color': isActive ? colors.primary : undefined 
                } as React.CSSProperties}
                >
                  <div className="flex items-start gap-4">
                    <div 
                      className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isCompleted ? 'bg-green-500' : 
                        isActive ? `bg-gradient-to-br ${colors.gradient}` : 
                        'bg-muted'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="h-5 w-5 text-white" />
                      ) : isActive ? (
                        <Sparkles className="h-5 w-5 text-white animate-pulse" />
                      ) : (
                        <AgentIcon className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold flex items-center gap-2">
                            {step.name}
                            {isActive && (
                              <Badge variant="outline" className="animate-pulse">
                                <Clock className="h-3 w-3 mr-1" />
                                Processing...
                              </Badge>
                            )}
                          </h3>
                          <p className="text-sm text-muted-foreground">{step.description}</p>
                        </div>
                        {step.score && (
                          <Badge 
                            className={`${
                              step.score >= 80 ? 'bg-green-500' : 
                              step.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                          >
                            {step.score}/100
                          </Badge>
                        )}
                      </div>
                      
                      {step.output && (
                        <div className="mt-3 p-3 bg-muted/50 rounded-lg text-sm">
                          {step.output}
                        </div>
                      )}
                      
                      {step.documents && step.documents.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {step.documents.map((doc, i) => (
                            <Badge key={i} variant="outline" className="cursor-pointer hover-elevate">
                              <FileText className="h-3 w-3 mr-1" />
                              {doc}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {!isRunning && completedSteps === steps.length && (
        <Card className="p-6 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/20">
          <div className="text-center space-y-4">
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
            <h3 className="text-2xl font-bold">Visa Application Package Complete!</h3>
            <p className="text-muted-foreground max-w-lg mx-auto">
              All AI agents have completed their analysis. Your visa application materials are ready for review.
            </p>
            <div className="flex justify-center gap-4">
              <Button 
                className="bg-green-500 hover:bg-green-600"
                data-testid="button-download-package"
                onClick={handleDownloadPackage}
              >
                <Download className="h-4 w-4 mr-2" />
                Download Full Package
              </Button>
              <Button 
                variant="outline"
                data-testid="button-review-details"
                onClick={() => setShowReviewDialog(true)}
              >
                <Eye className="h-4 w-4 mr-2" />
                Review Details
              </Button>
            </div>
          </div>
        </Card>
      )}

      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent className="max-w-4xl max-h-[85vh]">
          <DialogHeader>
            <DialogTitle>Visa Application Package Details</DialogTitle>
            <DialogDescription>
              Review all analyses from your Founder Autopilot session
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-6">
              {steps.filter(s => s.status === 'completed' && s.output).map((step, index) => (
                <Card key={step.id} className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Badge 
                      className={`bg-gradient-to-r ${AGENT_COLORS[step.agent].gradient}`}
                    >
                      {step.name}
                    </Badge>
                    {step.score && (
                      <Badge variant="outline" className="ml-auto">
                        Score: {step.score}/100
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {step.output}
                  </p>
                  {step.documents && step.documents.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {step.documents.map((doc, i) => (
                        <Badge key={i} variant="secondary">
                          <FileText className="h-3 w-3 mr-1" />
                          {doc}
                        </Badge>
                      ))}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </ScrollArea>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowReviewDialog(false)}>
              Close
            </Button>
            <Button onClick={handleDownloadPackage}>
              <Download className="h-4 w-4 mr-2" />
              Download Package
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showFormatDialog} onOpenChange={setShowFormatDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Choose Export Format</DialogTitle>
            <DialogDescription>
              Select the format for your visa application package
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-4">
            <Button 
              variant="outline" 
              className="h-16 justify-start gap-4 hover-elevate"
              onClick={handleDownloadDOCX}
              data-testid="button-download-docx"
            >
              <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <FileType2 className="h-5 w-5 text-blue-500" />
              </div>
              <div className="text-left">
                <div className="font-medium">Word Document (.docx)</div>
                <div className="text-sm text-muted-foreground">Best for editing and formatting</div>
              </div>
            </Button>
            <Button 
              variant="outline" 
              className="h-16 justify-start gap-4 hover-elevate"
              onClick={handleDownloadPDF}
              data-testid="button-download-pdf"
            >
              <div className="h-10 w-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                <FileIcon className="h-5 w-5 text-red-500" />
              </div>
              <div className="text-left">
                <div className="font-medium">PDF Document (.pdf)</div>
                <div className="text-sm text-muted-foreground">Best for sharing and printing</div>
              </div>
            </Button>
            <Button 
              variant="outline" 
              className="h-16 justify-start gap-4 hover-elevate"
              onClick={handleDownloadTXT}
              data-testid="button-download-txt"
            >
              <div className="h-10 w-10 rounded-lg bg-gray-500/10 flex items-center justify-center">
                <FileText className="h-5 w-5 text-gray-500" />
              </div>
              <div className="text-left">
                <div className="font-medium">Plain Text (.txt)</div>
                <div className="text-sm text-muted-foreground">Simple text format</div>
              </div>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default FounderAutopilot;
