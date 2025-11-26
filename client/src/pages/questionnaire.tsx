import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  MessageSquare,
  FileText,
  Sparkles,
  Brain,
  Target,
  Zap,
  Award,
  TrendingUp
} from "lucide-react";
import { motion } from "framer-motion";

import QuestionnaireForm from "@/components/QuestionnaireForm";
import EvidencePreparationGuide from "@/components/EvidencePreparationGuide";
import FeatureNavigation from "@/components/FeatureNavigation";
import { CreditBalanceDisplay } from "@/components/CreditBalanceDisplay";
import AiInterviewChat from "@/components/AiInterviewChat";
import VisaReadinessHUD from "@/components/VisaReadinessHUD";

interface InterviewSession {
  id: string;
  currentAgent: string;
  currentSection: number;
  totalQuestionsAnswered: number;
  totalQuestions: number;
  innovationScore: number;
  viabilityScore: number;
  scalabilityScore: number;
  overallReadiness: number;
  approvalProbability: number;
  currentStreak: number;
  totalXP: number;
}

export default function Questionnaire() {
  const [tier, setTier] = useState('premium');
  const [mode, setMode] = useState<'select' | 'form' | 'ai-interview'>('select');
  const [interviewSession, setInterviewSession] = useState<InterviewSession | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tierParam = params.get('tier');
    const modeParam = params.get('mode');
    if (tierParam) {
      setTier(tierParam);
    }
    if (modeParam === 'ai') {
      setMode('ai-interview');
    } else if (modeParam === 'form') {
      setMode('form');
    }
  }, []);

  const handleSessionUpdate = (session: InterviewSession) => {
    setInterviewSession(session);
  };

  if (mode === 'select') {
    return (
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-5xl mx-auto">
            <FeatureNavigation currentPage="questionnaire" />
            
            <div className="text-center mb-12">
              <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">
                Generate Your Business Plan
              </h1>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Choose your preferred way to complete your visa application. Our platform supports both traditional forms and an innovative AI-guided interview experience.
              </p>
            </div>

            <div className="mb-8">
              <CreditBalanceDisplay variant="full" showUpgradeButton={true} />
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card 
                  className="p-6 h-full hover-elevate cursor-pointer border-2 border-transparent hover:border-primary/50 transition-all"
                  onClick={() => setMode('ai-interview')}
                  data-testid="card-ai-interview-mode"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20">
                      <MessageSquare className="h-8 w-8 text-amber-500" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-bold">AI-Guided Interview</h3>
                        <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                          <Sparkles className="h-3 w-3 mr-1" />
                          Recommended
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mb-4">
                        Have a natural conversation with our specialized AI agents who guide you through 475 questions with real-time feedback and scoring.
                      </p>
                      
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm">
                          <Brain className="h-4 w-4 text-primary" />
                          <span>4 specialized AI agents (Innovation, Financial, Growth, Compliance)</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Target className="h-4 w-4 text-primary" />
                          <span>Real-time Visa Readiness Score</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Zap className="h-4 w-4 text-primary" />
                          <span>Gamification with XP, streaks & achievements</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Award className="h-4 w-4 text-primary" />
                          <span>Adaptive questioning based on your responses</span>
                        </div>
                      </div>

                      <Button className="w-full mt-6" data-testid="button-start-ai-interview">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Start AI Interview
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card 
                  className="p-6 h-full hover-elevate cursor-pointer border-2 border-transparent hover:border-primary/50 transition-all"
                  onClick={() => setMode('form')}
                  data-testid="card-form-mode"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20">
                      <FileText className="h-8 w-8 text-blue-500" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-bold">Traditional Form</h3>
                        <Badge variant="secondary">Classic</Badge>
                      </div>
                      <p className="text-muted-foreground mb-4">
                        Fill out a comprehensive structured questionnaire at your own pace. Ideal if you prefer to review all questions upfront.
                      </p>
                      
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span>Structured sections by visa criteria</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <TrendingUp className="h-4 w-4 text-muted-foreground" />
                          <span>Progress saving & auto-save</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Target className="h-4 w-4 text-muted-foreground" />
                          <span>Section-by-section completion</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Sparkles className="h-4 w-4 text-muted-foreground" />
                          <span>AI-powered business plan generation</span>
                        </div>
                      </div>

                      <Button variant="outline" className="w-full mt-6" data-testid="button-start-form">
                        <FileText className="h-4 w-4 mr-2" />
                        Use Traditional Form
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </div>

            <EvidencePreparationGuide />
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'ai-interview') {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="border-b bg-background">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setMode('select')}
                  data-testid="button-back-to-select"
                >
                  Back
                </Button>
                <div>
                  <h1 className="font-semibold text-lg">AI-Guided Interview</h1>
                  <p className="text-xs text-muted-foreground">Expert assessment of your visa application</p>
                </div>
              </div>
              <CreditBalanceDisplay variant="compact" />
            </div>
          </div>
        </div>

        <div className="flex-1 flex">
          <div className="flex-1 flex flex-col lg:flex-row">
            <div className="flex-1 h-[calc(100vh-80px)]">
              <AiInterviewChat tier={tier} onSessionUpdate={handleSessionUpdate} />
            </div>
            
            <div className="lg:w-96 border-l bg-muted/20 overflow-y-auto p-4 h-[calc(100vh-80px)]">
              <VisaReadinessHUD 
                innovationScore={interviewSession?.innovationScore || 0}
                viabilityScore={interviewSession?.viabilityScore || 0}
                scalabilityScore={interviewSession?.scalabilityScore || 0}
                overallReadiness={interviewSession?.overallReadiness || 0}
                approvalProbability={interviewSession?.approvalProbability || 30}
                currentStreak={interviewSession?.currentStreak || 0}
                totalXP={interviewSession?.totalXP || 0}
                sectionsCompleted={Math.floor((interviewSession?.totalQuestionsAnswered || 0) / 10)}
                totalSections={48}
                questionsAnswered={interviewSession?.totalQuestionsAnswered || 0}
                totalQuestions={interviewSession?.totalQuestions || 475}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setMode('select')}
              data-testid="button-back-to-select-form"
            >
              Back to Options
            </Button>
            <CreditBalanceDisplay variant="compact" />
          </div>
          
          <FeatureNavigation currentPage="questionnaire" />
          <div className="mb-6">
            <h1 className="font-serif text-4xl md:text-5xl font-bold mb-3">
              Generate Your Business Plan
            </h1>
            <p className="text-lg text-muted-foreground">
              Our Advanced AI platform evaluates your innovation across all three visa criteria (Innovation, Viability, Scalability) and generates policy-aware business plans, financial projections, and pitch decks—all internally consistent and endorser-ready.
            </p>
          </div>
        </div>
        <EvidencePreparationGuide />
        <QuestionnaireForm tier={tier} />
      </div>
    </div>
  );
}
