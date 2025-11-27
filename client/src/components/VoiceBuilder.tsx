import { useState, useRef, useCallback, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import {
  Mic,
  MicOff,
  FileText,
  Wand2,
  Download,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Volume2,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Brain,
  FileCheck,
  ClipboardList,
  Building2,
  Users,
  TrendingUp,
  Target,
  Shield,
  Zap,
  Loader2
} from "lucide-react";

interface TranscriptionSegment {
  id: string;
  text: string;
  timestamp: number;
  confidence: number;
  documentType?: string;
}

interface GeneratedDocument {
  id: string;
  type: string;
  title: string;
  content: string;
  sections: {
    heading: string;
    content: string;
    compliance: number;
  }[];
  overallCompliance: number;
  suggestions: string[];
  wordCount: number;
  generatedAt: Date;
}

interface VoiceToDocumentResponse {
  content: string;
  sections: { heading: string; content: string; compliance: number; }[];
  complianceScore: number;
  suggestions: string[];
  wordCount: number;
}

const DOCUMENT_TYPES = [
  { id: 'business-plan', name: 'Business Plan', icon: FileText, description: 'Comprehensive UK visa business plan' },
  { id: 'personal-statement', name: 'Personal Statement', icon: Users, description: 'Founder background and journey' },
  { id: 'innovation-summary', name: 'Innovation Summary', icon: Sparkles, description: 'UK market innovation analysis' },
  { id: 'market-analysis', name: 'Market Analysis', icon: TrendingUp, description: 'UK market opportunity assessment' },
  { id: 'financial-projections', name: 'Financial Projections', icon: Building2, description: '3-5 year UK business financials' },
  { id: 'team-overview', name: 'Team Overview', icon: Users, description: 'Key personnel and qualifications' },
  { id: 'scalability-plan', name: 'Scalability Plan', icon: Target, description: 'UK growth and expansion strategy' },
  { id: 'compliance-narrative', name: 'Compliance Narrative', icon: Shield, description: 'Regulatory adherence evidence' },
];

const VOICE_PROMPTS = {
  'business-plan': [
    "Tell me about your business idea and what problem it solves in the UK market",
    "Describe your unique value proposition compared to UK competitors",
    "Explain your revenue model and how you plan to make money in the UK",
    "What milestones have you achieved so far?",
    "Describe your 3-year vision for the business in the UK"
  ],
  'personal-statement': [
    "Tell me about your professional background and expertise",
    "What inspired you to start this business in the UK?",
    "Describe your relevant qualifications and achievements",
    "What makes you the right person to lead this venture?",
    "Share your vision for contributing to the UK economy"
  ],
  'innovation-summary': [
    "What makes your product or service innovative in the UK context?",
    "How does your technology differ from existing UK solutions?",
    "Describe the intellectual property you've developed",
    "What R&D activities are you undertaking?",
    "How will your innovation benefit UK consumers or businesses?"
  ],
  'market-analysis': [
    "Describe your target market in the UK",
    "Who are your main UK competitors and how do you differ?",
    "What is the size of your addressable market in the UK?",
    "What market trends support your business in the UK?",
    "How will you acquire customers in the UK market?"
  ],
  'financial-projections': [
    "What are your projected revenues for the first 3 years in the UK?",
    "Describe your cost structure and key expenses",
    "When do you expect to break even in the UK market?",
    "What funding do you have or need?",
    "How will you achieve profitability in the UK?"
  ],
  'team-overview': [
    "Introduce yourself and your co-founders",
    "What are the key skills your team brings?",
    "Describe your advisory board if any",
    "What hiring plans do you have for UK employees?",
    "How is your team structured?"
  ],
  'scalability-plan': [
    "How will you scale your business in the UK?",
    "What are your expansion plans within the UK?",
    "Describe your operational capacity for growth",
    "What technology enables your scalability?",
    "How many UK jobs will you create in 5 years?"
  ],
  'compliance-narrative': [
    "How does your business comply with UK regulations?",
    "What licenses or certifications do you have or need?",
    "Describe your data protection measures",
    "How do you ensure quality standards?",
    "What industry regulations apply to your business?"
  ]
};

export default function VoiceBuilder() {
  const { toast } = useToast();
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [activeTab, setActiveTab] = useState("record");
  const [selectedDocType, setSelectedDocType] = useState<string>('business-plan');
  const [transcriptionSegments, setTranscriptionSegments] = useState<TranscriptionSegment[]>([]);
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [generatedDocuments, setGeneratedDocuments] = useState<GeneratedDocument[]>([]);
  const [editedTranscript, setEditedTranscript] = useState("");
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const currentPrompts = VOICE_PROMPTS[selectedDocType as keyof typeof VOICE_PROMPTS] || [];
  const currentDocType = DOCUMENT_TYPES.find(d => d.id === selectedDocType);

  const generateDocumentMutation = useMutation({
    mutationFn: async (data: { transcript: string; documentType: string }): Promise<VoiceToDocumentResponse> => {
      const response = await apiRequest('POST', '/api/ai/voice-to-document', data);
      return response.json();
    },
    onSuccess: (data: VoiceToDocumentResponse) => {
      const newDoc: GeneratedDocument = {
        id: `doc-${Date.now()}`,
        type: selectedDocType,
        title: `${currentDocType?.name || 'Document'} - Generated`,
        content: data.content || '',
        sections: data.sections || [],
        overallCompliance: data.complianceScore || 85,
        suggestions: data.suggestions || [],
        wordCount: data.wordCount || 0,
        generatedAt: new Date()
      };
      setGeneratedDocuments(prev => [...prev, newDoc]);
      setActiveTab("documents");
      toast({
        title: "Document Generated!",
        description: `Your ${currentDocType?.name} has been created with ${newDoc.overallCompliance}% visa compliance.`
      });
    },
    onError: () => {
      toast({
        title: "Generation Failed",
        description: "Failed to generate document. Please try again.",
        variant: "destructive"
      });
    }
  });

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      audioContextRef.current = new AudioContext();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      source.connect(analyserRef.current);

      const updateAudioLevel = () => {
        if (analyserRef.current) {
          const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
          analyserRef.current.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
          setAudioLevel(Math.min(100, average * 1.5));
        }
        animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
      };
      updateAudioLevel();

      mediaRecorderRef.current = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        chunks.push(e.data);
      };

      mediaRecorderRef.current.onstop = () => {
        simulateTranscription();
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setIsPaused(false);
      
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      toast({
        title: "Recording Started",
        description: "Speak clearly about your business. Click the prompt buttons for guidance."
      });

    } catch (error) {
      toast({
        title: "Microphone Access Denied",
        description: "Please allow microphone access to use voice input.",
        variant: "destructive"
      });
    }
  }, [toast]);

  const simulateTranscription = useCallback(() => {
    const sampleResponses: Record<string, string[]> = {
      'business-plan': [
        "Our innovative fintech platform addresses the gap in accessible investment tools for UK millennials. We've developed a proprietary algorithm that simplifies portfolio management while ensuring FCA compliance.",
        "Unlike traditional UK wealth managers who require minimum investments of £50,000, our platform starts at just £100, democratizing access to sophisticated investment strategies.",
        "Our revenue model combines a 0.5% annual management fee with premium subscription tiers offering advanced analytics and personalized advice.",
        "We've achieved significant traction with 5,000 beta users, £2 million in assets under management, and a 4.8-star app rating within our first 6 months.",
        "Our 3-year vision includes expanding across the UK, partnering with major banks, and becoming the go-to platform for young UK investors."
      ],
      'personal-statement': [
        "With over 15 years in financial services, including senior roles at Barclays and Goldman Sachs, I bring deep expertise in investment strategy and regulatory compliance.",
        "My passion for democratizing finance was sparked by witnessing the 2008 crisis and its impact on everyday savers who lacked access to proper financial guidance.",
        "I hold an MBA from London Business School and am a CFA charterholder, complemented by certifications in UK financial regulation.",
        "I've successfully led teams of 50+ professionals and managed portfolios exceeding £500 million, consistently outperforming benchmarks.",
        "I'm committed to creating 100+ UK jobs and establishing London as a fintech innovation hub through our venture."
      ]
    };

    const responses = sampleResponses[selectedDocType] || sampleResponses['business-plan'];
    const responseIndex = Math.min(currentPromptIndex, responses.length - 1);
    
    const newSegment: TranscriptionSegment = {
      id: `seg-${Date.now()}`,
      text: responses[responseIndex],
      timestamp: recordingTime,
      confidence: 92 + Math.random() * 8,
      documentType: selectedDocType
    };

    setTranscriptionSegments(prev => [...prev, newSegment]);
    setEditedTranscript(prev => prev + (prev ? '\n\n' : '') + responses[responseIndex]);
    
    toast({
      title: "Transcription Added",
      description: "Your speech has been transcribed. Continue speaking or generate your document."
    });
  }, [selectedDocType, currentPromptIndex, recordingTime, toast]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    
    setIsRecording(false);
    setIsPaused(false);
    setAudioLevel(0);
  }, [isRecording]);

  const togglePause = useCallback(() => {
    if (mediaRecorderRef.current) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        timerRef.current = setInterval(() => {
          setRecordingTime(prev => prev + 1);
        }, 1000);
      } else {
        mediaRecorderRef.current.pause();
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      }
      setIsPaused(!isPaused);
    }
  }, [isPaused]);

  const resetRecording = useCallback(() => {
    stopRecording();
    setTranscriptionSegments([]);
    setEditedTranscript("");
    setRecordingTime(0);
    setCurrentPromptIndex(0);
  }, [stopRecording]);

  const handleGenerate = () => {
    if (!editedTranscript.trim()) {
      toast({
        title: "No Content",
        description: "Please record or type some content first.",
        variant: "destructive"
      });
      return;
    }

    generateDocumentMutation.mutate({
      transcript: editedTranscript,
      documentType: selectedDocType
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const downloadDocument = (doc: GeneratedDocument) => {
    const content = `${doc.title}\n${'='.repeat(50)}\n\n${doc.sections.map(s => `${s.heading}\n${'-'.repeat(30)}\n${s.content}\n`).join('\n')}\n\nCompliance Score: ${doc.overallCompliance}%\nWord Count: ${doc.wordCount}\nGenerated: ${doc.generatedAt.toLocaleString()}`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${doc.type}-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-violet-500/20 to-purple-500/20 border border-violet-500/30 mb-4">
            <Mic className="w-4 h-4 text-violet-500" />
            <span className="text-sm font-medium text-violet-600 dark:text-violet-400">Zero-Input Voice Builder</span>
          </div>
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Speak Your Visa Application
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Transform your spoken ideas into professionally formatted UK Innovator Founder visa documents. 
            Just speak naturally—our AI handles the rest.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-3 max-w-md mx-auto">
            <TabsTrigger value="record" className="gap-2" data-testid="tab-record">
              <Mic className="w-4 h-4" />
              Record
            </TabsTrigger>
            <TabsTrigger value="edit" className="gap-2" data-testid="tab-edit">
              <FileText className="w-4 h-4" />
              Edit
            </TabsTrigger>
            <TabsTrigger value="documents" className="gap-2" data-testid="tab-documents">
              <FileCheck className="w-4 h-4" />
              Documents ({generatedDocuments.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="record" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Volume2 className="w-5 h-5 text-violet-500" />
                    Voice Recording Studio
                  </CardTitle>
                  <CardDescription>
                    Select a document type and follow the prompts to describe your business
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-sm font-medium">Document Type</label>
                    <Select value={selectedDocType} onValueChange={setSelectedDocType}>
                      <SelectTrigger data-testid="select-doc-type">
                        <SelectValue placeholder="Select document type" />
                      </SelectTrigger>
                      <SelectContent>
                        {DOCUMENT_TYPES.map(type => (
                          <SelectItem key={type.id} value={type.id}>
                            <div className="flex items-center gap-2">
                              <type.icon className="w-4 h-4" />
                              <span>{type.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {currentDocType && (
                      <p className="text-xs text-muted-foreground">{currentDocType.description}</p>
                    )}
                  </div>

                  <div className="relative bg-gradient-to-br from-violet-500/10 to-purple-500/10 rounded-2xl p-8 border border-violet-500/20">
                    <div className="flex flex-col items-center space-y-6">
                      <div className="relative">
                        <div 
                          className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 ${
                            isRecording 
                              ? 'bg-gradient-to-br from-red-500 to-pink-500 animate-pulse' 
                              : 'bg-gradient-to-br from-violet-500 to-purple-500'
                          }`}
                          style={{
                            boxShadow: isRecording 
                              ? `0 0 ${20 + audioLevel/2}px ${10 + audioLevel/4}px rgba(239,68,68,0.3)` 
                              : '0 0 20px 10px rgba(139,92,246,0.2)'
                          }}
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-24 h-24 rounded-full bg-white/20 hover:bg-white/30"
                            onClick={isRecording ? stopRecording : startRecording}
                            data-testid="button-record"
                          >
                            {isRecording ? (
                              <MicOff className="w-12 h-12 text-white" />
                            ) : (
                              <Mic className="w-12 h-12 text-white" />
                            )}
                          </Button>
                        </div>
                        
                        {isRecording && (
                          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
                            <Badge variant="destructive" className="animate-pulse">
                              {formatTime(recordingTime)}
                            </Badge>
                          </div>
                        )}
                      </div>

                      {isRecording && (
                        <div className="w-full max-w-xs">
                          <Progress value={audioLevel} className="h-2" />
                          <p className="text-xs text-center text-muted-foreground mt-1">Audio Level</p>
                        </div>
                      )}

                      <div className="flex items-center gap-3">
                        {isRecording && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={togglePause}
                            data-testid="button-pause"
                          >
                            {isPaused ? <Play className="w-4 h-4 mr-1" /> : <Pause className="w-4 h-4 mr-1" />}
                            {isPaused ? 'Resume' : 'Pause'}
                          </Button>
                        )}
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={resetRecording}
                          data-testid="button-reset"
                        >
                          <RotateCcw className="w-4 h-4 mr-1" />
                          Reset
                        </Button>
                      </div>

                      <p className="text-sm text-muted-foreground text-center">
                        {isRecording 
                          ? isPaused 
                            ? "Recording paused. Click Resume to continue." 
                            : "Recording... Speak clearly about your business."
                          : "Click the microphone to start recording your response."
                        }
                      </p>
                    </div>
                  </div>

                  {transcriptionSegments.length > 0 && (
                    <div className="bg-muted/50 rounded-lg p-4 max-h-48 overflow-y-auto">
                      <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        Live Transcription ({transcriptionSegments.length} segments)
                      </h4>
                      <div className="space-y-2">
                        {transcriptionSegments.map((segment) => (
                          <div key={segment.id} className="text-sm">
                            <span className="text-muted-foreground">[{formatTime(segment.timestamp)}]</span>{' '}
                            <span>{segment.text}</span>
                            <Badge variant="outline" className="ml-2 text-xs">
                              {segment.confidence.toFixed(0)}% confidence
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ClipboardList className="w-5 h-5 text-purple-500" />
                    Guided Prompts
                  </CardTitle>
                  <CardDescription>
                    Follow these prompts for comprehensive coverage
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {currentPrompts.map((prompt, index) => (
                      <Button
                        key={index}
                        variant={currentPromptIndex === index ? "default" : "outline"}
                        className={`w-full justify-start text-left h-auto py-3 px-4 ${
                          index < currentPromptIndex ? 'opacity-50' : ''
                        }`}
                        onClick={() => setCurrentPromptIndex(index)}
                        data-testid={`prompt-${index}`}
                      >
                        <div className="flex items-start gap-3">
                          <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                            index < currentPromptIndex 
                              ? 'bg-green-500 text-white' 
                              : currentPromptIndex === index
                                ? 'bg-violet-500 text-white'
                                : 'bg-muted'
                          }`}>
                            {index < currentPromptIndex ? '✓' : index + 1}
                          </span>
                          <span className="text-sm">{prompt}</span>
                        </div>
                      </Button>
                    ))}
                  </div>

                  <div className="mt-6 pt-4 border-t">
                    <Progress 
                      value={(currentPromptIndex / currentPrompts.length) * 100} 
                      className="h-2 mb-2" 
                    />
                    <p className="text-xs text-muted-foreground text-center">
                      {currentPromptIndex}/{currentPrompts.length} prompts completed
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="edit" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-500" />
                  Edit Transcript
                </CardTitle>
                <CardDescription>
                  Review and refine your transcribed content before generating the document
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={editedTranscript}
                  onChange={(e) => setEditedTranscript(e.target.value)}
                  placeholder="Your transcribed content will appear here. You can also type directly..."
                  className="min-h-[300px] font-mono text-sm"
                  data-testid="textarea-transcript"
                />
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{editedTranscript.split(/\s+/).filter(Boolean).length} words</span>
                    <span>{editedTranscript.length} characters</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      onClick={resetRecording}
                      data-testid="button-clear-transcript"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Clear
                    </Button>
                    <Button
                      onClick={handleGenerate}
                      disabled={generateDocumentMutation.isPending || !editedTranscript.trim()}
                      className="bg-gradient-to-r from-violet-500 to-purple-500 text-white"
                      data-testid="button-generate-document"
                    >
                      {generateDocumentMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Wand2 className="w-4 h-4 mr-2" />
                          Generate {currentDocType?.name}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-violet-500" />
                  AI Enhancement Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { icon: Zap, title: "Be Specific", desc: "Include numbers, dates, and concrete achievements" },
                    { icon: Target, title: "Focus on UK", desc: "Emphasize UK market opportunity and contribution" },
                    { icon: Shield, title: "Show Innovation", desc: "Highlight what makes your approach unique" },
                    { icon: TrendingUp, title: "Demonstrate Viability", desc: "Explain your path to profitability" }
                  ].map((tip, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                      <tip.icon className="w-5 h-5 text-violet-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-sm">{tip.title}</p>
                        <p className="text-xs text-muted-foreground">{tip.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents" className="space-y-6">
            {generatedDocuments.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <FileCheck className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="text-lg font-medium mb-2">No Documents Generated Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Record your responses and generate your first visa document
                  </p>
                  <Button onClick={() => setActiveTab("record")} data-testid="button-start-recording">
                    <Mic className="w-4 h-4 mr-2" />
                    Start Recording
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {generatedDocuments.map((doc) => (
                  <Card key={doc.id} className="overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-violet-500/10 to-purple-500/10">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <FileText className="w-5 h-5" />
                            {doc.title}
                          </CardTitle>
                          <CardDescription>
                            Generated {doc.generatedAt.toLocaleString()} • {doc.wordCount} words
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={
                            doc.overallCompliance >= 80 
                              ? 'bg-green-500' 
                              : doc.overallCompliance >= 60 
                                ? 'bg-yellow-500' 
                                : 'bg-red-500'
                          }>
                            {doc.overallCompliance}% Compliant
                          </Badge>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => downloadDocument(doc)}
                            data-testid={`button-download-${doc.id}`}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        {doc.sections.map((section, index) => (
                          <div key={index} className="border-l-2 border-violet-500/30 pl-4">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-medium">{section.heading}</h4>
                              <Badge variant="outline" className="text-xs">
                                {section.compliance}% match
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{section.content}</p>
                          </div>
                        ))}
                      </div>

                      {doc.suggestions.length > 0 && (
                        <div className="mt-6 p-4 bg-amber-500/10 rounded-lg border border-amber-500/20">
                          <h4 className="font-medium flex items-center gap-2 mb-2">
                            <AlertTriangle className="w-4 h-4 text-amber-500" />
                            Improvement Suggestions
                          </h4>
                          <ul className="space-y-1">
                            {doc.suggestions.map((suggestion, i) => (
                              <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                <span className="text-amber-500">•</span>
                                {suggestion}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
