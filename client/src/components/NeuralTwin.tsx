import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Brain,
  User,
  MessageSquare,
  Sparkles,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  Target,
  TrendingUp,
  Award,
  Mic,
  MicOff,
  Send
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { apiRequest } from "@/lib/queryClient";

interface FounderProfile {
  name: string;
  businessName: string;
  industry: string;
  experience: string;
  vision: string;
  strengths: string[];
  communicationStyle: 'formal' | 'casual' | 'technical' | 'storytelling';
  confidenceLevel: 'low' | 'medium' | 'high';
}

interface SimulationMessage {
  id: string;
  role: 'endorser' | 'founder' | 'coach' | 'system';
  content: string;
  timestamp: Date;
  feedback?: string;
  score?: number;
}

interface NeuralTwinProps {
  founderProfile?: Partial<FounderProfile>;
  mode?: 'interview' | 'pitch' | 'qa';
  onComplete?: (results: any) => void;
}

const ENDORSER_QUESTIONS = [
  "Tell me about your business idea and what problem it solves.",
  "What makes your solution innovative compared to existing alternatives?",
  "How will you make money and what are your revenue projections?",
  "What's your go-to-market strategy in the UK?",
  "How many jobs do you plan to create in the first 3 years?",
  "What's your competitive advantage and how will you maintain it?",
  "Tell me about your team and their relevant experience.",
  "What are the main risks to your business and how will you mitigate them?",
  "How will you scale the business beyond the UK?",
  "Why the UK specifically for this venture?"
];

const COMMUNICATION_STYLES = {
  formal: "Professional, structured, data-driven responses",
  casual: "Friendly, relatable, story-focused responses",
  technical: "Deep technical details, expert terminology",
  storytelling: "Narrative-driven, emotional connection focus"
};

export function NeuralTwin({ founderProfile: initialProfile, mode = 'interview', onComplete }: NeuralTwinProps) {
  const [profile, setProfile] = useState<FounderProfile>({
    name: initialProfile?.name || "",
    businessName: initialProfile?.businessName || "",
    industry: initialProfile?.industry || "",
    experience: initialProfile?.experience || "",
    vision: initialProfile?.vision || "",
    strengths: initialProfile?.strengths || [],
    communicationStyle: initialProfile?.communicationStyle || 'formal',
    confidenceLevel: initialProfile?.confidenceLevel || 'medium'
  });
  
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const [messages, setMessages] = useState<SimulationMessage[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isSimulating, setIsSimulating] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [overallScore, setOverallScore] = useState(0);
  const [activeTab, setActiveTab] = useState("profile");
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleProfileSubmit = () => {
    if (profile.name && profile.businessName && profile.industry && profile.vision) {
      setIsProfileComplete(true);
      setActiveTab("simulation");
      
      const welcomeMessage: SimulationMessage = {
        id: 'welcome',
        role: 'system',
        content: `Neural Twin activated for ${profile.name}. I've learned your communication style, industry expertise, and business vision. Let's practice your endorser interview.`,
        timestamp: new Date()
      };
      
      const firstQuestion: SimulationMessage = {
        id: 'q-0',
        role: 'endorser',
        content: ENDORSER_QUESTIONS[0],
        timestamp: new Date()
      };
      
      setMessages([welcomeMessage, firstQuestion]);
    }
  };

  const generateTwinResponse = async (question: string): Promise<string> => {
    try {
      const response = await apiRequest("POST", "/api/ai/neural-twin", {
        question,
        profile,
        previousMessages: messages.map(m => ({ role: m.role, content: m.content }))
      });
      const data = await response.json();
      return data.response || generateFallbackResponse(question);
    } catch (error) {
      return generateFallbackResponse(question);
    }
  };

  const generateFallbackResponse = (question: string): string => {
    const style = profile.communicationStyle;
    const templates = {
      formal: `Based on our analysis at ${profile.businessName}, we've identified a significant opportunity in the ${profile.industry} sector. Our solution addresses key pain points with a structured approach that demonstrates clear viability and innovation potential.`,
      casual: `So here's the thing - when I started ${profile.businessName}, I saw this problem that nobody was solving properly. Our approach in ${profile.industry} is different because we actually listen to what customers need.`,
      technical: `${profile.businessName} leverages advanced technology stack to disrupt the ${profile.industry} space. Our proprietary algorithms and data-driven approach enable unprecedented efficiency gains.`,
      storytelling: `The inspiration for ${profile.businessName} came from a real challenge I faced. Working in ${profile.industry}, I realized there had to be a better way. That's when the vision became clear.`
    };
    return templates[style];
  };

  const evaluateResponse = async (response: string, question: string): Promise<{ score: number; feedback: string; error?: boolean }> => {
    // Local quality check first - catch garbage responses before API call
    const cleanResponse = (response || "").trim();
    const wordCount = cleanResponse.split(/\s+/).filter(w => w.length > 0).length;
    
    // Immediate rejection for garbage responses - no AI needed
    if (cleanResponse.length < 5 || wordCount < 2) {
      return {
        score: 0,
        feedback: `**Cannot evaluate.** Your response "${cleanResponse}" is not a valid answer. Please provide a complete, thoughtful response to practice effectively.`,
        error: true
      };
    }
    
    try {
      const apiResponse = await apiRequest("POST", "/api/ai/evaluate-response", {
        response,
        question,
        profile,
        wordCount,
        criteria: ['clarity', 'innovation', 'viability', 'confidence', 'uk_market_relevance', 'specificity', 'metrics']
      });
      
      if (!apiResponse.ok) {
        throw new Error("API request failed");
      }
      
      const data = await apiResponse.json();
      
      // Verify we got a real AI evaluation, not a fallback
      if (data.error || !data.feedback || data.feedback.includes("connectivity issue")) {
        return {
          score: 0,
          feedback: data.feedback || "**Evaluation Unavailable.** We're experiencing a connectivity issue with our AI evaluation service. Please try again in a moment. If this persists, contact support@ukvisaassistant.com",
          error: true
        };
      }
      
      return {
        score: data.score,
        feedback: data.feedback
      };
    } catch (error) {
      // No fallback scoring - show error message
      return {
        score: 0,
        feedback: "**Evaluation Unavailable.** We're experiencing a connectivity issue with our AI evaluation service. Please try again in a moment. If this problem persists, please contact support@ukvisaassistant.com for assistance.",
        error: true
      };
    }
  };

  const handleUserResponse = async () => {
    if (!userInput.trim()) return;
    
    const userMessage: SimulationMessage = {
      id: `user-${Date.now()}`,
      role: 'founder',
      content: userInput,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setUserInput("");
    setIsSimulating(true);
    
    const evaluation = await evaluateResponse(userInput, ENDORSER_QUESTIONS[currentQuestionIndex]);
    
    const coachFeedback: SimulationMessage = {
      id: `coach-${Date.now()}`,
      role: 'coach',
      content: `**Score: ${evaluation.score}/100**\n\n${evaluation.feedback}`,
      timestamp: new Date(),
      score: evaluation.score,
      feedback: evaluation.feedback
    };
    
    setMessages(prev => [...prev, coachFeedback]);
    
    if (currentQuestionIndex < ENDORSER_QUESTIONS.length - 1) {
      setTimeout(() => {
        const nextQuestion: SimulationMessage = {
          id: `q-${currentQuestionIndex + 1}`,
          role: 'endorser',
          content: ENDORSER_QUESTIONS[currentQuestionIndex + 1],
          timestamp: new Date()
        };
        setMessages(prev => [...prev, nextQuestion]);
        setCurrentQuestionIndex(prev => prev + 1);
      }, 1500);
    } else {
      const scores = messages.filter(m => m.score).map(m => m.score!);
      scores.push(evaluation.score);
      const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
      setOverallScore(avgScore);
      
      const completionMessage: SimulationMessage = {
        id: 'complete',
        role: 'system',
        content: `Interview simulation complete! Your overall performance score: **${avgScore}/100**\n\n${
          avgScore >= 80 ? "Excellent preparation! You're ready for the real endorser interview." :
          avgScore >= 60 ? "Good progress. Practice a few more times to build confidence." :
          "Keep practicing. Focus on the areas where you scored lower."
        }`,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, completionMessage]);
      
      if (onComplete) {
        onComplete({ score: avgScore, messages, profile });
      }
    }
    
    setIsSimulating(false);
  };

  const letTwinAnswer = async () => {
    setIsSimulating(true);
    
    const twinResponse = await generateTwinResponse(ENDORSER_QUESTIONS[currentQuestionIndex]);
    
    const twinMessage: SimulationMessage = {
      id: `twin-${Date.now()}`,
      role: 'founder',
      content: `**[Neural Twin Response]**\n\n${twinResponse}`,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, twinMessage]);
    
    const evaluation = await evaluateResponse(twinResponse, ENDORSER_QUESTIONS[currentQuestionIndex]);
    
    const coachFeedback: SimulationMessage = {
      id: `coach-${Date.now()}`,
      role: 'coach',
      content: `**Twin Score: ${evaluation.score}/100**\n\nThis is how your Neural Twin would respond. ${evaluation.feedback}`,
      timestamp: new Date(),
      score: evaluation.score
    };
    
    setMessages(prev => [...prev, coachFeedback]);
    
    if (currentQuestionIndex < ENDORSER_QUESTIONS.length - 1) {
      setTimeout(() => {
        const nextQuestion: SimulationMessage = {
          id: `q-${currentQuestionIndex + 1}`,
          role: 'endorser',
          content: ENDORSER_QUESTIONS[currentQuestionIndex + 1],
          timestamp: new Date()
        };
        setMessages(prev => [...prev, nextQuestion]);
        setCurrentQuestionIndex(prev => prev + 1);
      }, 1500);
    }
    
    setIsSimulating(false);
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

  const resetSimulation = () => {
    setMessages([]);
    setCurrentQuestionIndex(0);
    setOverallScore(0);
    setActiveTab("profile");
    setIsProfileComplete(false);
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border-cyan-500/20">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
            <Brain className="h-7 w-7 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Neural Twin Founder Model</h2>
            <p className="text-muted-foreground">
              AI simulation of your founder personality for interview practice
            </p>
          </div>
          {overallScore > 0 && (
            <Badge 
              className={`ml-auto text-lg px-4 py-2 ${
                overallScore >= 80 ? 'bg-green-500' : 
                overallScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
            >
              <Award className="h-4 w-4 mr-1" />
              {overallScore}/100
            </Badge>
          )}
        </div>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="profile" data-testid="tab-profile">
            <User className="h-4 w-4 mr-2" />
            Founder Profile
          </TabsTrigger>
          <TabsTrigger value="simulation" disabled={!isProfileComplete} data-testid="tab-simulation">
            <MessageSquare className="h-4 w-4 mr-2" />
            Interview Simulation
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4 mt-4">
          <Card className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Create Your Neural Twin
            </h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Your Name</Label>
                <Input
                  id="name"
                  value={profile.name}
                  onChange={(e) => setProfile(p => ({ ...p, name: e.target.value }))}
                  placeholder="John Smith"
                  data-testid="input-founder-name"
                />
              </div>
              
              <div>
                <Label htmlFor="businessName">Business Name</Label>
                <Input
                  id="businessName"
                  value={profile.businessName}
                  onChange={(e) => setProfile(p => ({ ...p, businessName: e.target.value }))}
                  placeholder="TechStartup Ltd"
                  data-testid="input-business-name"
                />
              </div>
              
              <div>
                <Label htmlFor="industry">Industry</Label>
                <Input
                  id="industry"
                  value={profile.industry}
                  onChange={(e) => setProfile(p => ({ ...p, industry: e.target.value }))}
                  placeholder="FinTech, HealthTech, EdTech..."
                  data-testid="input-industry"
                />
              </div>
              
              <div>
                <Label htmlFor="experience">Years of Experience</Label>
                <Input
                  id="experience"
                  value={profile.experience}
                  onChange={(e) => setProfile(p => ({ ...p, experience: e.target.value }))}
                  placeholder="5 years in software development..."
                  data-testid="input-experience"
                />
              </div>
              
              <div className="md:col-span-2">
                <Label htmlFor="vision">Business Vision</Label>
                <Textarea
                  id="vision"
                  value={profile.vision}
                  onChange={(e) => setProfile(p => ({ ...p, vision: e.target.value }))}
                  placeholder="Describe your business vision and what problem you're solving..."
                  className="min-h-[100px]"
                  data-testid="input-vision"
                />
              </div>
              
              <div className="md:col-span-2">
                <Label>Communication Style</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                  {(Object.keys(COMMUNICATION_STYLES) as Array<keyof typeof COMMUNICATION_STYLES>).map(style => (
                    <Button
                      key={style}
                      variant={profile.communicationStyle === style ? "default" : "outline"}
                      onClick={() => setProfile(p => ({ ...p, communicationStyle: style }))}
                      className="justify-start"
                      data-testid={`button-style-${style}`}
                    >
                      {style.charAt(0).toUpperCase() + style.slice(1)}
                    </Button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {COMMUNICATION_STYLES[profile.communicationStyle]}
                </p>
              </div>
            </div>
            
            <Button 
              onClick={handleProfileSubmit}
              className="w-full mt-6"
              disabled={!profile.name || !profile.businessName || !profile.industry || !profile.vision}
              data-testid="button-create-twin"
            >
              <Brain className="h-4 w-4 mr-2" />
              Create Neural Twin & Start Simulation
            </Button>
          </Card>
        </TabsContent>

        <TabsContent value="simulation" className="space-y-4 mt-4">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  Question {currentQuestionIndex + 1} of {ENDORSER_QUESTIONS.length}
                </Badge>
                <Progress value={(currentQuestionIndex / ENDORSER_QUESTIONS.length) * 100} className="w-32 h-2" />
              </div>
              <Button variant="outline" size="sm" onClick={resetSimulation} data-testid="button-reset-simulation">
                <RotateCcw className="h-4 w-4 mr-1" />
                Reset
              </Button>
            </div>
          </Card>

          <Card className="p-4 h-[400px] overflow-y-auto">
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mb-4 ${message.role === 'founder' ? 'text-right' : ''}`}
                >
                  <div className={`inline-block max-w-[80%] ${
                    message.role === 'founder' ? 'bg-primary text-primary-foreground' :
                    message.role === 'endorser' ? 'bg-orange-500/10 border border-orange-500/20' :
                    message.role === 'coach' ? 'bg-green-500/10 border border-green-500/20' :
                    'bg-muted'
                  } rounded-lg p-3`}>
                    <div className="text-xs font-medium mb-1 opacity-70">
                      {message.role === 'endorser' ? 'Endorser' :
                       message.role === 'founder' ? 'You (Founder)' :
                       message.role === 'coach' ? 'AI Coach' : 'System'}
                    </div>
                    <div className="text-sm whitespace-pre-wrap">
                      {message.content}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </Card>

          <Card className="p-4">
            <div className="flex gap-2">
              <Button
                size="icon"
                variant={isListening ? "default" : "outline"}
                onClick={toggleVoice}
                className={isListening ? "bg-red-500 hover:bg-red-600" : ""}
                data-testid="button-voice-simulation"
              >
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
              
              <Textarea
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Type your response as the founder..."
                className="flex-1 min-h-[44px] max-h-24 resize-none"
                disabled={isSimulating || overallScore > 0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleUserResponse();
                  }
                }}
                data-testid="input-simulation-response"
              />
              
              <Button
                onClick={handleUserResponse}
                disabled={!userInput.trim() || isSimulating || overallScore > 0}
                data-testid="button-send-response"
              >
                {isSimulating ? (
                  <Sparkles className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            
            <div className="flex gap-2 mt-3">
              <Button
                variant="outline"
                onClick={letTwinAnswer}
                disabled={isSimulating || overallScore > 0}
                className="flex-1"
                data-testid="button-twin-answer"
              >
                <Brain className="h-4 w-4 mr-2" />
                Let Neural Twin Answer
              </Button>
              <Button
                variant="outline"
                onClick={() => setUserInput(ENDORSER_QUESTIONS[currentQuestionIndex])}
                disabled={isSimulating || overallScore > 0}
                data-testid="button-show-question"
              >
                <Lightbulb className="h-4 w-4 mr-2" />
                Get Hint
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default NeuralTwin;
