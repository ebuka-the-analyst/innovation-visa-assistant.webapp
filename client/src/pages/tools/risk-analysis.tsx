import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AiToolGuide, AiTraditionalToggle, type ToolConfig } from "@/components/AiToolGuide";

const AI_TOOL_CONFIG: ToolConfig = {
  toolId: 'risk-analysis',
  toolName: 'Risk Analysis',
  agent: 'sterling',
  greeting: "Hello! I'm Sterling, your Financial Analyst. Thorough risk analysis demonstrates business maturity and preparedness to endorsing bodies. Let's identify, assess, and plan mitigation strategies for your venture's key risks.",
  questions: [
    {
      id: 'business-stage',
      question: "What stage is your business at, and what are the primary risks you currently face?",
      hint: "Consider market, financial, technical, regulatory, and operational risks.",
      fieldKey: 'businessStage',
      minLength: 30
    },
    {
      id: 'market-risks',
      question: "What market risks could impact your business success in the UK?",
      hint: "Include competition, market size validation, customer adoption, and regulatory changes.",
      fieldKey: 'marketRisks',
      minLength: 30
    },
    {
      id: 'financial-risks',
      question: "What are your key financial risks and runway considerations?",
      hint: "Consider cash flow, funding gaps, customer concentration, and currency exposure.",
      fieldKey: 'financialRisks',
      minLength: 30
    },
    {
      id: 'operational-risks',
      question: "What operational risks could affect your ability to deliver and scale?",
      hint: "Include team dependencies, technology risks, supply chain issues, and key person risks.",
      fieldKey: 'operationalRisks',
      minLength: 30
    },
    {
      id: 'mitigation-strategies',
      question: "What risk mitigation strategies do you have in place or plan to implement?",
      hint: "Describe contingency plans, insurance, diversification, and monitoring systems.",
      fieldKey: 'mitigationStrategies',
      minLength: 30
    },
    {
      id: 'visa-specific-risks',
      question: "Are there any visa-specific risks that could affect your continued endorsement or ILR pathway?",
      hint: "Consider reporting requirements, business pivot scenarios, or criteria gaps.",
      fieldKey: 'visaSpecificRisks',
      minLength: 20
    }
  ],
  completionMessage: "Comprehensive risk understanding! I've captured your risk landscape. I'm now populating your risk matrix with identified risks, severity assessments, and mitigation recommendations."
};

export default function RiskAnalysis() {
  const [mode, setMode] = useState<'ai' | 'traditional'>(() => {
    return (localStorage.getItem('risk-analysis-mode') as 'ai' | 'traditional') || 'ai';
  });

  useEffect(() => {
    localStorage.setItem('risk-analysis-mode', mode);
  }, [mode]);

  const handleAiComplete = (answers: Record<string, string>) => {
    setMode('traditional');
  };
  return (
    <>
      
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        <div className="max-w-6xl mx-auto">
          
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-4xl font-bold">Risk Analysis</h1>
              <AiTraditionalToggle mode={mode} onModeChange={setMode} />
            </div>
            <p className="text-lg text-muted-foreground">Advanced Strategic Analysis</p>
          </div>

          {mode === 'ai' ? (
            <AiToolGuide config={AI_TOOL_CONFIG} onComplete={handleAiComplete} />
          ) : (
          <Card className="p-8"><h2 className="text-2xl font-bold mb-4">Risk Analysis</h2><p className="text-muted-foreground mb-6">Premium tool with comprehensive analysis.</p><div className="grid md:grid-cols-3 gap-4 mb-6"><Card className="p-4 bg-gradient-to-br from-primary/10 to-accent/10"><h3 className="font-semibold">Analysis</h3></Card><Card className="p-4 bg-blue-50 dark:bg-blue-950"><h3 className="font-semibold">Insights</h3></Card><Card className="p-4 bg-green-50 dark:bg-green-950"><h3 className="font-semibold">Expertise</h3></Card></div><Button className="w-full">Get Started</Button></Card>
          )}
        </div>
      </div>
    </>
  );
}
