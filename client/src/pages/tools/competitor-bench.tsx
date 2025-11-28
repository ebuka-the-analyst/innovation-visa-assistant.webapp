import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";


import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { CheckCircle2, XCircle, AlertTriangle, Plus, X, Target, TrendingUp, Shield, Award } from "lucide-react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, LineChart, Line, ScatterChart, Scatter, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { AiToolGuide, AiTraditionalToggle, type ToolConfig } from "@/components/AiToolGuide";
import { useTierAccess } from "@/hooks/useTierAccess";

const AI_TOOL_CONFIG: ToolConfig = {
  toolId: 'competitor-bench',
  toolName: 'Competitive Benchmarking',
  agent: 'atlas',
  greeting: "Hello! I'm Atlas, your Growth Strategist. I'll help you analyze your competitive landscape - essential for demonstrating your innovation's market differentiation to endorsing bodies. Understanding competition shows you know your market and can articulate your unique value proposition. Let's map your competitive position!",
  questions: [
    {
      id: 'your-innovation',
      question: "First, describe your innovation score (0-100). How innovative is your solution compared to what's currently in the market?",
      hint: "Consider: novel technology, unique approach, IP, patents, or significant improvements over existing solutions",
      fieldKey: 'yourInnovation',
      minLength: 10
    },
    {
      id: 'your-features',
      question: "Rate your feature completeness (0-100). How does your product's functionality compare to market leaders?",
      hint: "Think about breadth of features, depth of capability, and unique differentiators",
      fieldKey: 'yourFeatures',
      minLength: 10
    },
    {
      id: 'competitor-1',
      question: "Who is your main competitor? Describe their name, market share, and key strengths.",
      hint: "Include their approximate market share percentage and what they do well",
      fieldKey: 'competitor1',
      minLength: 50
    },
    {
      id: 'competitor-1-weakness',
      question: "What are this competitor's main weaknesses? Where do you have an advantage?",
      hint: "Consider: pricing, technology, customer service, speed, or market gaps they're not addressing",
      fieldKey: 'competitor1Weakness',
      minLength: 40
    },
    {
      id: 'competitor-2',
      question: "Who is your second significant competitor? Describe them similarly.",
      hint: "This helps demonstrate thorough market understanding to endorsers",
      fieldKey: 'competitor2',
      minLength: 50
    },
    {
      id: 'your-advantage',
      question: "What is your primary competitive advantage? Why will customers choose you?",
      hint: "Be specific: better price, unique feature, faster, more reliable, better UX, proprietary tech",
      fieldKey: 'yourAdvantage',
      minLength: 60
    }
  ],
  completionMessage: "Excellent competitive analysis! You've demonstrated strong market awareness - endorsing bodies want to see founders who understand their competitive landscape. I'm now populating your competitive benchmarking data with these insights."
};

interface Competitor {
  id: string;
  name: string;
  marketShare: number;
  innovation: number;
  pricing: number;
  customerSat: number;
  funding: number;
  features: number;
  strengths: string;
  weaknesses: string;
}

interface YourBusiness {
  innovation: number;
  pricing: number;
  customerSat: number;
  marketShare: number;
  funding: number;
  features: number;
}

export default function CompetitorBench() {
  const { userTier } = useTierAccess();
  
  // Free users default to traditional mode, paid users can use AI mode
  const isPaidUser = userTier !== 'free';
  const [mode, setMode] = useState<'ai' | 'traditional'>(() => {
    const saved = localStorage.getItem('competitor-bench-mode');
    // Free users always start in traditional mode
    return (saved === 'ai' && isPaidUser) ? 'ai' : 'traditional';
  });

  const [yourBusiness, setYourBusiness] = useState<YourBusiness>({
    innovation: 80,
    pricing: 70,
    customerSat: 75,
    marketShare: 5,
    funding: 50,
    features: 85
  });

  const [competitors, setCompetitors] = useState<Competitor[]>([
    {
      id: "1",
      name: "Competitor A",
      marketShare: 25,
      innovation: 60,
      pricing: 65,
      customerSat: 70,
      funding: 85,
      features: 70,
      strengths: "Market leader with strong brand recognition and established customer base",
      weaknesses: "Slow innovation cycle, legacy tech stack, higher pricing"
    }
  ]);

  const [activeTab, setActiveTab] = useState('benchmark');
  const [savedDate, setSavedDate] = useState('');

  // Force traditional mode for free users and clear localStorage
  useEffect(() => {
    if (!isPaidUser && mode === 'ai') {
      setMode('traditional');
      localStorage.setItem('competitor-bench-mode', 'traditional');
    }
  }, [isPaidUser, mode]);

  useEffect(() => {
    localStorage.setItem('competitor-bench-mode', mode);
  }, [mode]);

  const handleAiComplete = (answers: Record<string, any>) => {
    if (answers.yourInnovation) {
      const scoreMatch = answers.yourInnovation.match(/\d+/);
      if (scoreMatch) {
        setYourBusiness(prev => ({ ...prev, innovation: Math.min(100, parseInt(scoreMatch[0])) }));
      }
    }
    
    if (answers.yourFeatures) {
      const scoreMatch = answers.yourFeatures.match(/\d+/);
      if (scoreMatch) {
        setYourBusiness(prev => ({ ...prev, features: Math.min(100, parseInt(scoreMatch[0])) }));
      }
    }
    
    const newCompetitors: Competitor[] = [];
    
    if (answers.competitor1) {
      const marketShareMatch = answers.competitor1.match(/(\d+)\s*%/);
      newCompetitors.push({
        id: 'ai-1-' + Date.now(),
        name: answers.competitor1.split(/[,.\n]/)[0].substring(0, 30) || 'Competitor 1',
        marketShare: marketShareMatch ? parseInt(marketShareMatch[1]) : 20,
        innovation: 60,
        pricing: 65,
        customerSat: 70,
        funding: 75,
        features: 65,
        strengths: answers.competitor1.substring(0, 150),
        weaknesses: answers.competitor1Weakness || ''
      });
    }
    
    if (answers.competitor2) {
      const marketShareMatch = answers.competitor2.match(/(\d+)\s*%/);
      newCompetitors.push({
        id: 'ai-2-' + Date.now(),
        name: answers.competitor2.split(/[,.\n]/)[0].substring(0, 30) || 'Competitor 2',
        marketShare: marketShareMatch ? parseInt(marketShareMatch[1]) : 15,
        innovation: 55,
        pricing: 60,
        customerSat: 65,
        funding: 60,
        features: 60,
        strengths: answers.competitor2.substring(0, 150),
        weaknesses: ''
      });
    }
    
    if (newCompetitors.length > 0) {
      setCompetitors(newCompetitors);
    }
    
    setMode('traditional');
  };

  const updateYourBusiness = (field: keyof YourBusiness, value: number) => {
    setYourBusiness(prev => ({ ...prev, [field]: value }));
  };

  const addCompetitor = () => {
    setCompetitors([...competitors, {
      id: Date.now().toString(),
      name: "New Competitor",
      marketShare: 10,
      innovation: 50,
      pricing: 50,
      customerSat: 50,
      funding: 50,
      features: 50,
      strengths: "",
      weaknesses: ""
    }]);
  };

  const removeCompetitor = (id: string) => {
    setCompetitors(competitors.filter(c => c.id !== id));
  };

  const updateCompetitor = (id: string, field: keyof Competitor, value: any) => {
    setCompetitors(competitors.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const getCompetitiveAdvantage = (): { score: number; grade: string; advantages: number } => {
    if (competitors.length === 0) {
      return { score: 50, grade: 'C - No Comparison Data', advantages: 0 };
    }

    let advantages = 0;
    const avgCompetitor = {
      innovation: competitors.reduce((s, c) => s + c.innovation, 0) / competitors.length,
      pricing: competitors.reduce((s, c) => s + c.pricing, 0) / competitors.length,
      customerSat: competitors.reduce((s, c) => s + c.customerSat, 0) / competitors.length,
      features: competitors.reduce((s, c) => s + c.features, 0) / competitors.length
    };

    if (yourBusiness.innovation > avgCompetitor.innovation) advantages++;
    if (yourBusiness.pricing > avgCompetitor.pricing) advantages++;
    if (yourBusiness.customerSat > avgCompetitor.customerSat) advantages++;
    if (yourBusiness.features > avgCompetitor.features) advantages++;

    const innovationGap = yourBusiness.innovation - avgCompetitor.innovation;
    const pricingGap = yourBusiness.pricing - avgCompetitor.pricing;
    const satisfactionGap = yourBusiness.customerSat - avgCompetitor.customerSat;
    const featuresGap = yourBusiness.features - avgCompetitor.features;

    const score = Math.min(100, Math.max(0, Math.round(50 + (innovationGap + pricingGap + satisfactionGap + featuresGap) / 4)));

    let grade = 'F - Weak Position';
    if (score >= 85) grade = 'A - Strong Lead';
    else if (score >= 70) grade = 'B - Competitive';
    else if (score >= 55) grade = 'C - At Par';
    else if (score >= 40) grade = 'D - Behind';

    return { score, grade, advantages };
  };

  const { score: competitiveScore, grade: competitiveGrade, advantages: competitiveAdvantages } = getCompetitiveAdvantage();

  const avgCompetitor = competitors.length > 0 ? {
    innovation: competitors.reduce((s, c) => s + c.innovation, 0) / competitors.length,
    pricing: competitors.reduce((s, c) => s + c.pricing, 0) / competitors.length,
    customerSat: competitors.reduce((s, c) => s + c.customerSat, 0) / competitors.length,
    funding: competitors.reduce((s, c) => s + c.funding, 0) / competitors.length,
    features: competitors.reduce((s, c) => s + c.features, 0) / competitors.length,
    marketShare: competitors.reduce((s, c) => s + c.marketShare, 0) / competitors.length
  } : null;

  const radarData = avgCompetitor ? [
    { metric: 'Innovation', you: yourBusiness.innovation, market: avgCompetitor.innovation },
    { metric: 'Pricing', you: yourBusiness.pricing, market: avgCompetitor.pricing },
    { metric: 'Customer Sat', you: yourBusiness.customerSat, market: avgCompetitor.customerSat },
    { metric: 'Features', you: yourBusiness.features, market: avgCompetitor.features }
  ] : [];

  const pricingComparisonData = [
    { name: 'Your Business', value: yourBusiness.pricing },
    ...competitors.map(c => ({ name: c.name || 'Unnamed', value: c.pricing }))
  ];

  const marketPositionData = [
    { name: 'Your Business', marketShare: yourBusiness.marketShare, innovation: yourBusiness.innovation, type: 'you' },
    ...competitors.map(c => ({ name: c.name || 'Unnamed', marketShare: c.marketShare, innovation: c.innovation, type: 'competitor' }))
  ];

  const featureComparisonData = [
    { feature: 'Features', you: yourBusiness.features, avg: avgCompetitor?.features || 0 },
    { feature: 'Innovation', you: yourBusiness.innovation, avg: avgCompetitor?.innovation || 0 },
    { feature: 'Customer Sat', you: yourBusiness.customerSat, avg: avgCompetitor?.customerSat || 0 },
    { feature: 'Pricing', you: yourBusiness.pricing, avg: avgCompetitor?.pricing || 0 }
  ];

  const getSerializedState = () => {
    return {
      yourBusiness,
      competitors,
      activeTab,
      savedDate: new Date().toLocaleString('en-GB')
    };
  };

  const restoreSerializedState = (state: any) => {
    if ('yourBusiness' in state) setYourBusiness(state.yourBusiness);
    if ('competitors' in state) setCompetitors(state.competitors);
    if ('activeTab' in state) setActiveTab(state.activeTab);
    if ('savedDate' in state) setSavedDate(state.savedDate || '');
  };

  useEffect(() => {
    const handoffKey = 'competitor-bench_handoff';
    const handoffData = localStorage.getItem(handoffKey);

    if (handoffData) {
      try {
        const payload = JSON.parse(handoffData);
        restoreSerializedState(payload);
        localStorage.removeItem(handoffKey);
      } catch (err) {
        console.error('Failed to restore handoff data:', err);
      }
    } else {
      const saved = localStorage.getItem('competitor-bench-state');
      if (saved) {
        const state = JSON.parse(saved);
        restoreSerializedState(state);
      }
    }
  }, []);

  const handleSave = () => {
    const state = getSerializedState();
    localStorage.setItem('competitor-bench-state', JSON.stringify(state));
    setSavedDate(state.savedDate);
  };

  const handleRestore = () => {
    const saved = localStorage.getItem('competitor-bench-state');
    if (saved) {
      const state = JSON.parse(saved);
      restoreSerializedState(state);
    }
  };

  const getSmartTips = () => {
    const tips = [];

    if (competitiveScore < 55) {
      tips.push("Critical: Competitive position below 55% indicates weak market position. Strengthen innovation and differentiation.");
    }

    if (avgCompetitor && yourBusiness.innovation <= avgCompetitor.innovation) {
      tips.push("Innovation score at or below market average. Document unique technology or approaches that differentiate you.");
    }

    if (competitors.length < 3) {
      tips.push("Analyzing fewer than 3 competitors provides incomplete market view. Identify 3-5 direct competitors.");
    }

    if (competitiveAdvantages >= 3) {
      tips.push("Strong competitive position with 3+ advantages. Document specific evidence of your lead.");
    }

    return tips.slice(0, 5);
  };

  const handleExport = () => {
    const report = `UK INNOVATOR FOUNDER VISA - COMPETITIVE BENCHMARKING ANALYSIS
Generated: ${new Date().toLocaleString('en-GB')}

EXECUTIVE SUMMARY
Competitive Advantage Score: ${competitiveScore}% (${competitiveGrade})
Competitive Advantages: ${competitiveAdvantages}/4 dimensions
Your Market Share: ${yourBusiness.marketShare}%
Competitors Analyzed: ${competitors.length}

YOUR BUSINESS PROFILE
Innovation: ${yourBusiness.innovation}/100
Features: ${yourBusiness.features}/100
Pricing Competitiveness: ${yourBusiness.pricing}/100
Customer Satisfaction: ${yourBusiness.customerSat}/100

COMPETITORS
${competitors.map(c => `
${c.name}:
  Market Share: ${c.marketShare}%
  Innovation: ${c.innovation}/100
  Strengths: ${c.strengths}
  Weaknesses: ${c.weaknesses}
`).join('\n')}
`;

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `competitor-bench-report-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        <div className="max-w-7xl mx-auto">
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-4xl font-bold mb-2" data-testid="heading-competitor-bench">Competitive Benchmarking</h1>
              <p className="text-lg text-muted-foreground">Analyze and compare your competitive position in the market</p>
              {savedDate && <p className="text-sm text-muted-foreground mt-1">Last saved: {savedDate}</p>}
            </div>
            <AiTraditionalToggle
              mode={mode}
              onModeChange={setMode}
              aiLabel="AI-Guided"
              traditionalLabel="Traditional Form"
              userTier={userTier}
            />
          </div>

          {mode === 'ai' ? (
            <div className="grid lg:grid-cols-2 gap-6">
              <AiToolGuide
                config={AI_TOOL_CONFIG}
                onComplete={handleAiComplete}
                onSwitchToTraditional={() => setMode('traditional')}
                userTier={userTier}
              />
              <div className="space-y-4">
                <Card className="p-6">
                  <h3 className="font-bold mb-4">Why Competitive Analysis Matters</h3>
                  <div className="space-y-3 text-sm text-muted-foreground">
                    <p>Endorsing bodies assess whether you truly understand your market. Strong competitive analysis demonstrates:</p>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>Clear differentiation from existing solutions (Innovation criterion)</li>
                      <li>Realistic market positioning and opportunity</li>
                      <li>Awareness of competitive threats and how to address them</li>
                      <li>Evidence your solution is genuinely needed</li>
                    </ul>
                  </div>
                </Card>
                <div className="grid grid-cols-2 gap-4">
                  <Card className="p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <Target className="w-5 h-5 text-primary" />
                      <span className="text-sm font-medium">Competitive Score</span>
                    </div>
                    <p className="text-2xl font-bold">{competitiveScore}%</p>
                    <p className="text-xs text-muted-foreground">{competitiveGrade}</p>
                  </Card>
                  <Card className="p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <Award className="w-5 h-5 text-primary" />
                      <span className="text-sm font-medium">Advantages</span>
                    </div>
                    <p className="text-2xl font-bold">{competitiveAdvantages}/4</p>
                    <p className="text-xs text-muted-foreground">Dimensions ahead</p>
                  </Card>
                </div>
              </div>
            </div>
          ) : (
            <>
              <ToolUtilityBar
                toolId="competitor-bench"
                onSave={handleSave}
                onRestore={handleRestore}
                onExport={handleExport}
                getSerializedState={getSerializedState}
                toolName="Competitive Benchmarking"
              />

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Target className="w-5 h-5 text-primary" />
                    <span className="text-sm font-medium">Competitive Score</span>
                  </div>
                  <p className="text-3xl font-bold">{competitiveScore}%</p>
                  <p className="text-xs text-muted-foreground mt-1">{competitiveGrade}</p>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Award className="w-5 h-5 text-primary" />
                    <span className="text-sm font-medium">Advantages</span>
                  </div>
                  <p className="text-3xl font-bold">{competitiveAdvantages}/4</p>
                  <p className="text-xs text-muted-foreground mt-1">Dimensions ahead</p>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    <span className="text-sm font-medium">Your Innovation</span>
                  </div>
                  <p className="text-3xl font-bold">{yourBusiness.innovation}%</p>
                  <p className="text-xs text-muted-foreground mt-1">vs {avgCompetitor ? Math.round(avgCompetitor.innovation) : 0}% avg</p>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Shield className="w-5 h-5 text-primary" />
                    <span className="text-sm font-medium">Competitors</span>
                  </div>
                  <p className="text-3xl font-bold">{competitors.length}</p>
                  <p className="text-xs text-muted-foreground mt-1">Analyzed</p>
                </Card>
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="benchmark">Benchmark</TabsTrigger>
                  <TabsTrigger value="your-profile">Your Profile</TabsTrigger>
                  <TabsTrigger value="competitors">Competitors</TabsTrigger>
                  <TabsTrigger value="tips">Smart Tips</TabsTrigger>
                </TabsList>

                <TabsContent value="benchmark" className="space-y-6">
                  <div className="grid lg:grid-cols-2 gap-6">
                    <Card className="p-6">
                      <h3 className="font-semibold mb-4">Competitive Radar</h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <RadarChart data={radarData}>
                          <PolarGrid />
                          <PolarAngleAxis dataKey="metric" />
                          <PolarRadiusAxis angle={30} domain={[0, 100]} />
                          <Radar name="Your Business" dataKey="you" stroke="#ffa536" fill="#ffa536" fillOpacity={0.5} />
                          <Radar name="Market Average" dataKey="market" stroke="#11b6e9" fill="#11b6e9" fillOpacity={0.3} />
                          <Legend />
                          <Tooltip />
                        </RadarChart>
                      </ResponsiveContainer>
                    </Card>

                    <Card className="p-6">
                      <h3 className="font-semibold mb-4">Feature Comparison</h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={featureComparisonData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="feature" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="you" fill="#ffa536" name="Your Business" />
                          <Bar dataKey="avg" fill="#11b6e9" name="Competitor Avg" />
                        </BarChart>
                      </ResponsiveContainer>
                    </Card>

                    <Card className="p-6">
                      <h3 className="font-semibold mb-4">Pricing Position</h3>
                      <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={pricingComparisonData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" angle={-15} textAnchor="end" height={60} />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="value" fill="#8b5cf6" name="Pricing Score" />
                        </BarChart>
                      </ResponsiveContainer>
                    </Card>

                    <Card className="p-6">
                      <h3 className="font-semibold mb-4">Market Position Matrix</h3>
                      <ResponsiveContainer width="100%" height={280}>
                        <ScatterChart>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" dataKey="marketShare" name="Market Share" unit="%" />
                          <YAxis type="number" dataKey="innovation" name="Innovation" />
                          <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                          <Legend />
                          <Scatter name="Your Business" data={marketPositionData.filter(d => d.type === 'you')} fill="#ffa536" />
                          <Scatter name="Competitors" data={marketPositionData.filter(d => d.type === 'competitor')} fill="#11b6e9" />
                        </ScatterChart>
                      </ResponsiveContainer>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="your-profile" className="space-y-6">
                  <Card className="p-6">
                    <h3 className="font-semibold mb-6">Your Business Profile</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      {Object.entries({
                        innovation: 'Innovation Score',
                        features: 'Feature Completeness',
                        pricing: 'Pricing Competitiveness',
                        customerSat: 'Customer Satisfaction',
                        marketShare: 'Market Share (%)',
                        funding: 'Funding Level'
                      }).map(([key, label]) => (
                        <div key={key}>
                          <Label>{label}: {yourBusiness[key as keyof YourBusiness]}</Label>
                          <Slider
                            value={[yourBusiness[key as keyof YourBusiness]]}
                            onValueChange={([v]) => updateYourBusiness(key as keyof YourBusiness, v)}
                            max={100}
                            step={1}
                            className="mt-2"
                            data-testid={`slider-${key}`}
                          />
                        </div>
                      ))}
                    </div>
                  </Card>
                </TabsContent>

                <TabsContent value="competitors" className="space-y-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold">Competitors</h3>
                    <Button onClick={addCompetitor} size="sm" data-testid="button-add-competitor">
                      <Plus className="w-4 h-4 mr-1" /> Add Competitor
                    </Button>
                  </div>

                  <div className="space-y-6">
                    {competitors.map((comp) => (
                      <Card key={comp.id} className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <Input
                            value={comp.name}
                            onChange={(e) => updateCompetitor(comp.id, 'name', e.target.value)}
                            className="font-semibold text-xl w-2/3"
                            placeholder="Competitor Name"
                            data-testid={`input-competitor-name-${comp.id}`}
                          />
                          <Button variant="ghost" size="sm" onClick={() => removeCompetitor(comp.id)}>
                            <X className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="grid md:grid-cols-3 gap-4 mb-4">
                          {Object.entries({
                            marketShare: 'Market Share',
                            innovation: 'Innovation',
                            pricing: 'Pricing',
                            customerSat: 'Customer Sat',
                            funding: 'Funding',
                            features: 'Features'
                          }).map(([key, label]) => (
                            <div key={key}>
                              <Label>{label}: {comp[key as keyof Competitor]}</Label>
                              <Slider
                                value={[comp[key as keyof Competitor] as number]}
                                onValueChange={([v]) => updateCompetitor(comp.id, key as keyof Competitor, v)}
                                max={100}
                                step={1}
                                className="mt-2"
                              />
                            </div>
                          ))}
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label>Key Strengths</Label>
                            <Textarea
                              value={comp.strengths}
                              onChange={(e) => updateCompetitor(comp.id, 'strengths', e.target.value)}
                              placeholder="What are they good at?"
                              rows={3}
                              data-testid={`textarea-strengths-${comp.id}`}
                            />
                          </div>
                          <div>
                            <Label>Key Weaknesses</Label>
                            <Textarea
                              value={comp.weaknesses}
                              onChange={(e) => updateCompetitor(comp.id, 'weaknesses', e.target.value)}
                              placeholder="Where do they fall short?"
                              rows={3}
                              data-testid={`textarea-weaknesses-${comp.id}`}
                            />
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="tips" className="space-y-6">
                  <Card className="p-6">
                    <h3 className="font-semibold mb-4">Smart Recommendations</h3>
                    <div className="space-y-3">
                      {getSmartTips().map((tip, i) => {
                        const isCritical = tip.toLowerCase().includes('critical');
                        return (
                          <Alert key={i} className={isCritical ? "border-red-200 bg-red-50 dark:bg-red-950" : "border-blue-200 bg-blue-50 dark:bg-blue-950"}>
                            <AlertDescription className={isCritical ? "text-red-700 dark:text-red-300" : "text-blue-700 dark:text-blue-300"}>{tip}</AlertDescription>
                          </Alert>
                        );
                      })}
                    </div>
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </div>
    </>
  );
}
