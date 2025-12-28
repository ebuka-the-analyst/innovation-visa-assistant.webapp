import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";


import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, XCircle, AlertTriangle, FileText, Calendar as CalendarIcon } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { AiToolGuide, AiTraditionalToggle, type ToolConfig } from "@/components/AiToolGuide";
import { useTierAccess } from "@/hooks/useTierAccess";

const AI_TOOL_CONFIG: ToolConfig = {
  toolId: 'evidence-validator',
  toolName: 'Evidence Validator',
  agent: 'nova',
  greeting: "Hello! I'm Nova, your Innovation Expert. I'll help you validate that your evidence meets Home Office standards. Quality evidence is just as important as quantity - let me assess your evidence strength!",
  questions: [
    {
      id: 'innovation-evidence',
      question: "Describe your Innovation Evidence. What documents demonstrate your innovation? Do you have patent applications, technical architecture documentation, IP filings, or competitive analysis?",
      hint: "Rate authenticity and relevance of each piece of evidence",
      fieldKey: 'innovation_evidence',
      minLength: 40
    },
    {
      id: 'viability-evidence',
      question: "What Viability Evidence do you have? Do you have customer validation letters, a proven revenue model, market research from credible sources, and detailed financial projections?",
      hint: "Third-party validation carries more weight",
      fieldKey: 'viability_evidence',
      minLength: 40
    },
    {
      id: 'scalability-evidence',
      question: "What demonstrates your Scalability? Do you have a growth plan, team recruitment strategy, infrastructure scaling plan, and geographic expansion documentation?",
      hint: "Endorsers want to see ambitious but realistic growth plans",
      fieldKey: 'scalability_evidence',
      minLength: 40
    },
    {
      id: 'team-evidence',
      question: "What Team Evidence supports your application? Do you have detailed founder CVs, a skills matrix, advisory board documentation, and professional references?",
      hint: "Strong team credentials can compensate for early-stage businesses",
      fieldKey: 'team_evidence',
      minLength: 40
    },
    {
      id: 'document-quality',
      question: "How would you assess the quality of your documents? Are they all originals or certified copies? Are they in English or with certified translations? Are they dated within required timeframes?",
      hint: "Financial evidence should be within 3 months, technical within 12 months",
      fieldKey: 'document_quality',
      minLength: 40
    },
    {
      id: 'weakest-area',
      question: "Which category of evidence is your weakest? Innovation, Viability, Scalability, or Team? What's missing or needs improvement?",
      hint: "Identifying weak areas allows focused improvement",
      fieldKey: 'weakest_area',
      minLength: 30
    }
  ],
  completionMessage: "Great! I've assessed your evidence quality. Switch to the traditional view to add specific evidence items with detailed scoring for authenticity, relevance, completeness, recency, and format compliance."
};

type EvidenceItem = {
  name: string;
  category: 'innovation' | 'viability' | 'scalability' | 'team';
  authenticity: number;
  relevance: number;
  completeness: number;
  recency: number;
  formatCompliance: number;
  notes: string;
  dateProvided: string;
};

const EVIDENCE_CATEGORIES = {
  innovation: {
    name: 'Innovation Evidence',
    required: ['Patent Application', 'Technical Architecture', 'IP Documentation', 'Competitive Analysis'],
    color: '#41B6E6'
  },
  viability: {
    name: 'Viability Evidence',
    required: ['Customer Validation', 'Revenue Model', 'Market Research', 'Financial Projections'],
    color: '#10b981'
  },
  scalability: {
    name: 'Scalability Evidence',
    required: ['Growth Plan', 'Team Recruitment Plan', 'Infrastructure Plan', 'Geographic Expansion'],
    color: '#8b5cf6'
  },
  team: {
    name: 'Team Evidence',
    required: ['Founder CVs', 'Team Skills Matrix', 'Advisory Board', 'References'],
    color: '#f59e0b'
  }
};

const HOME_OFFICE_STANDARDS = [
  {
    title: 'Document Authenticity',
    description: 'All documents must be original or certified copies from official sources',
    weight: 'Critical'
  },
  {
    title: 'Relevance to Business',
    description: 'Evidence must directly support your innovation, viability, and scalability claims',
    weight: 'Critical'
  },
  {
    title: 'Completeness',
    description: 'Documents must be complete, unredacted, and include all relevant pages',
    weight: 'Critical'
  },
  {
    title: 'Recency',
    description: 'Financial and market evidence should be within 3 months, technical evidence within 12 months',
    weight: 'High'
  },
  {
    title: 'Format Compliance',
    description: 'Documents must be in English or accompanied by certified translations',
    weight: 'High'
  },
  {
    title: 'Third-Party Verification',
    description: 'Letters from customers, investors, or partners must be on official letterhead',
    weight: 'High'
  }
];

export default function EvidenceValidator() {
  const { userTier } = useTierAccess();
  
  // Free users default to traditional mode, paid users can use AI mode
  const isPaidUser = userTier !== 'free';
  const [mode, setMode] = useState<'ai' | 'traditional'>(() => {
    const saved = localStorage.getItem('evidence-validator-mode');
    // Free users always start in traditional mode
    return (saved === 'ai' && isPaidUser) ? 'ai' : 'traditional';
  });
  const [evidenceItems, setEvidenceItems] = useState<EvidenceItem[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [savedDate, setSavedDate] = useState('');

  // Force traditional mode for free users and clear localStorage
  useEffect(() => {
    if (!isPaidUser && mode === 'ai') {
      setMode('traditional');
      localStorage.setItem('evidence-validator-mode', 'traditional');
    }
  }, [isPaidUser, mode]);

  useEffect(() => {
    localStorage.setItem('evidence-validator-mode', mode);
  }, [mode]);

  const handleAiComplete = (answers: Record<string, any>) => {
    const newItems: EvidenceItem[] = [];
    
    const addItem = (category: 'innovation' | 'viability' | 'scalability' | 'team', answerKey: string, name: string) => {
      const answer = answers[answerKey] || '';
      if (answer.length > 20) {
        newItems.push({
          name,
          category,
          authenticity: 3,
          relevance: 3,
          completeness: 3,
          recency: 3,
          formatCompliance: 3,
          notes: answer.substring(0, 200),
          dateProvided: new Date().toISOString().split('T')[0]
        });
      }
    };
    
    addItem('innovation', 'innovation_evidence', 'Innovation Documentation');
    addItem('viability', 'viability_evidence', 'Viability Evidence');
    addItem('scalability', 'scalability_evidence', 'Scalability Plan');
    addItem('team', 'team_evidence', 'Team Credentials');
    
    setEvidenceItems(newItems);
    
    const date = new Date().toLocaleString('en-GB');
    localStorage.setItem('evidence-validator-state', JSON.stringify({
      evidenceItems: newItems,
      activeTab: 'overview',
      savedDate: date
    }));
    setSavedDate(date);
    
    setActiveTab('overview');
    setMode('traditional');
  };

  const addEvidenceItem = (category: 'innovation' | 'viability' | 'scalability' | 'team') => {
    setEvidenceItems([...evidenceItems, {
      name: '',
      category,
      authenticity: 0,
      relevance: 0,
      completeness: 0,
      recency: 0,
      formatCompliance: 0,
      notes: '',
      dateProvided: new Date().toISOString().split('T')[0]
    }]);
  };

  const updateEvidenceItem = (index: number, field: keyof EvidenceItem, value: any) => {
    const updated = [...evidenceItems];
    updated[index] = { ...updated[index], [field]: value };
    setEvidenceItems(updated);
  };

  const removeEvidenceItem = (index: number) => {
    setEvidenceItems(evidenceItems.filter((_, i) => i !== index));
  };

  const calculateItemScore = (item: EvidenceItem): number => {
    const scores = [item.authenticity, item.relevance, item.completeness, item.recency, item.formatCompliance];
    const validScores = scores.filter(s => s > 0);
    if (validScores.length === 0) return 0;
    return Math.round((validScores.reduce((sum, s) => sum + s, 0) / validScores.length) * 20);
  };

  const getOverallScore = (): number => {
    if (evidenceItems.length === 0) return 0;
    const itemScores = evidenceItems.map(calculateItemScore).filter(s => s > 0);
    if (itemScores.length === 0) return 0;
    return Math.round(itemScores.reduce((sum, s) => sum + s, 0) / itemScores.length);
  };

  const getCategoryScore = (category: string): number => {
    const categoryItems = evidenceItems.filter(item => item.category === category);
    if (categoryItems.length === 0) return 0;
    const scores = categoryItems.map(calculateItemScore).filter(s => s > 0);
    if (scores.length === 0) return 0;
    return Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length);
  };

  const overallScore = getOverallScore();
  const readyForSubmission = overallScore >= 80 && evidenceItems.length >= 12;
  const criticalGaps = evidenceItems.filter(item => calculateItemScore(item) < 60).length;

  const categoryStrengthData = Object.entries(EVIDENCE_CATEGORIES).map(([key, cat]) => ({
    name: cat.name,
    score: getCategoryScore(key),
    color: cat.color
  }));

  const qualityDistribution = [
    { name: 'Excellent (80-100)', value: evidenceItems.filter(i => calculateItemScore(i) >= 80).length, color: '#10b981' },
    { name: 'Good (60-79)', value: evidenceItems.filter(i => calculateItemScore(i) >= 60 && calculateItemScore(i) < 80).length, color: '#3b82f6' },
    { name: 'Fair (40-59)', value: evidenceItems.filter(i => calculateItemScore(i) >= 40 && calculateItemScore(i) < 60).length, color: '#f59e0b' },
    { name: 'Poor (<40)', value: evidenceItems.filter(i => calculateItemScore(i) < 40 && calculateItemScore(i) > 0).length, color: '#ef4444' },
  ].filter(item => item.value > 0);

  const getSerializedState = () => {
    return {
      evidenceItems,
      activeTab,
      savedDate: new Date().toLocaleString('en-GB')
    };
  };

  const restoreSerializedState = (state: any) => {
    if ('evidenceItems' in state) setEvidenceItems(state.evidenceItems);
    if ('activeTab' in state) setActiveTab(state.activeTab);
    if ('savedDate' in state) setSavedDate(state.savedDate || '');
  };

  useEffect(() => {
    const handoffKey = 'evidence-validator_handoff';
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
      const saved = localStorage.getItem('evidence-validator-state');
      if (saved) {
        const state = JSON.parse(saved);
        restoreSerializedState(state);
      }
    }
  }, []);

  const handleSave = () => {
    const state = getSerializedState();
    localStorage.setItem('evidence-validator-state', JSON.stringify(state));
    setSavedDate(state.savedDate);
  };

  const handleRestore = () => {
    const saved = localStorage.getItem('evidence-validator-state');
    if (saved) {
      const state = JSON.parse(saved);
      restoreSerializedState(state);
    }
  };

  const getSmartTips = () => {
    const tips = [];
    
    if (evidenceItems.length < 12) {
      tips.push("Provide at least 12 evidence items covering all four categories for a comprehensive application");
    }
    
    if (criticalGaps > 3) {
      tips.push("Focus on improving low-scoring evidence items - quality matters more than quantity");
    }
    
    const innovationScore = getCategoryScore('innovation');
    if (innovationScore < 70) {
      tips.push("Strengthen innovation evidence with patents, technical documentation, and competitive analysis");
    }
    
    const viabilityScore = getCategoryScore('viability');
    if (viabilityScore < 70) {
      tips.push("Add more viability evidence: customer letters, revenue proof, and market validation");
    }
    
    const recentItems = evidenceItems.filter(item => {
      const monthsOld = (Date.now() - new Date(item.dateProvided).getTime()) / (1000 * 60 * 60 * 24 * 30);
      return monthsOld <= 3;
    }).length;
    
    if (recentItems < evidenceItems.length * 0.6) {
      tips.push("Ensure at least 60% of evidence is recent (within 3 months) for financial/market docs");
    }
    
    const lowAuthenticity = evidenceItems.filter(item => item.authenticity < 4).length;
    if (lowAuthenticity > 2) {
      tips.push("All evidence must be original or certified copies - improve authenticity documentation");
    }
    
    const missingCategories = Object.keys(EVIDENCE_CATEGORIES).filter(cat => 
      evidenceItems.filter(item => item.category === cat).length === 0
    );
    if (missingCategories.length > 0) {
      tips.push(`Missing evidence in: ${missingCategories.map(c => EVIDENCE_CATEGORIES[c as keyof typeof EVIDENCE_CATEGORIES].name).join(', ')}`);
    }
    
    if (overallScore >= 85) {
      tips.push("Excellent evidence quality - your application has strong supporting documentation");
    }
    
    return tips.slice(0, 8);
  };

  const generateActionPlan = () => {
    return [
      { 
        week: "Week 1", 
        action: "Audit all existing evidence documents - check authenticity, dates, and completeness", 
        priority: "Critical" 
      },
      { 
        week: "Week 1-2", 
        action: "Obtain certified copies or official letters for any informal evidence", 
        priority: "Critical" 
      },
      { 
        week: "Week 2", 
        action: "Update any evidence older than 3 months (financial statements, market data)", 
        priority: "High" 
      },
      { 
        week: "Week 2-3", 
        action: "Collect missing evidence items identified in category gaps analysis", 
        priority: "Critical" 
      },
      { 
        week: "Week 3", 
        action: "Have all non-English documents professionally translated and certified", 
        priority: "High" 
      },
      { 
        week: "Week 3", 
        action: "Obtain third-party verification letters on official letterhead", 
        priority: "High" 
      },
      { 
        week: "Week 4", 
        action: "Organize evidence by category with clear labeling and index document", 
        priority: "Medium" 
      },
      { 
        week: "Week 4", 
        action: "Final quality review - ensure all evidence meets Home Office standards", 
        priority: "Critical" 
      },
    ];
  };

  const handleExport = () => {
    const report = `UK INNOVATOR FOUNDER VISA - EVIDENCE QUALITY VALIDATOR
Generated: ${new Date().toLocaleString('en-GB')}
${'='.repeat(80)}

OVERALL ASSESSMENT
${'-'.repeat(80)}
Overall Quality Score: ${overallScore}%
Total Evidence Items: ${evidenceItems.length}
Critical Gaps: ${criticalGaps}
Submission Ready: ${readyForSubmission ? 'YES' : 'NO - Review Required'}

CATEGORY STRENGTH ANALYSIS
${'-'.repeat(80)}
${Object.entries(EVIDENCE_CATEGORIES).map(([key, cat]) => 
  `${cat.name}: ${getCategoryScore(key)}%`
).join('\n')}

EVIDENCE INVENTORY
${'-'.repeat(80)}
${evidenceItems.map((item, i) => `
${i + 1}. ${item.name || 'Unnamed Evidence'}
   Category: ${EVIDENCE_CATEGORIES[item.category].name}
   Overall Score: ${calculateItemScore(item)}%
   - Authenticity: ${item.authenticity}/5
   - Relevance: ${item.relevance}/5
   - Completeness: ${item.completeness}/5
   - Recency: ${item.recency}/5
   - Format Compliance: ${item.formatCompliance}/5
   Date Provided: ${item.dateProvided}
   Notes: ${item.notes || 'None'}
`).join('')}

QUALITY DISTRIBUTION
${'-'.repeat(80)}
${qualityDistribution.map(item => `${item.name}: ${item.value} items`).join('\n')}

HOME OFFICE STANDARDS CHECKLIST
${'-'.repeat(80)}
${HOME_OFFICE_STANDARDS.map((std, i) => 
  `${i + 1}. [${std.weight}] ${std.title}\n   ${std.description}`
).join('\n\n')}

SMART RECOMMENDATIONS
${'-'.repeat(80)}
${getSmartTips().map((tip, i) => `${i + 1}. ${tip}`).join('\n')}

4-WEEK ACTION PLAN
${'-'.repeat(80)}
${generateActionPlan().map(item => `[${item.priority}] ${item.week}: ${item.action}`).join('\n')}

COMPLIANCE NOTES
${'-'.repeat(80)}
- All documents must be originals or certified copies
- Financial evidence should be less than 3 months old
- Technical/IP evidence should be less than 12 months old
- Non-English documents must have certified translations
- Third-party letters must be on official letterhead with contact details
- Ensure complete document sets (no missing pages or redactions)
- Maintain organized evidence portfolio with clear indexing

${'='.repeat(80)}
Report generated by UK Innovator Founder Visa Assistant
© 2025 innovatorfoundervisaassistant.co.uk
`;

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `evidence-validator-report-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        <div className="max-w-7xl mx-auto">
          
          
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2" data-testid="heading-evidence-validator">Evidence Validator</h1>
            <p className="text-lg text-muted-foreground">Comprehensive evidence quality assessment and Home Office compliance check</p>
            {savedDate && (
              <p className="text-sm text-muted-foreground mt-2">Last saved: {savedDate}</p>
            )}
          </div>

          <ToolUtilityBar
            toolId="evidence-validator"
            toolName="Evidence Validator"
            onSave={handleSave}
            onRestore={handleRestore}
            onExport={handleExport}
            getSerializedState={getSerializedState}
          />

          <div className="mb-6">
            <AiTraditionalToggle mode={mode} onModeChange={setMode} userTier={userTier} />
          </div>

          {mode === 'ai' ? (
            <AiToolGuide config={AI_TOOL_CONFIG} onComplete={handleAiComplete} userTier={userTier} />
          ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5" data-testid="tabs-evidence-validator">
              <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
              <TabsTrigger value="validation" data-testid="tab-validation">Validation</TabsTrigger>
              <TabsTrigger value="analysis" data-testid="tab-analysis">Analysis</TabsTrigger>
              <TabsTrigger value="tips" data-testid="tab-tips">Smart Tips</TabsTrigger>
              <TabsTrigger value="standards" data-testid="tab-standards">Standards</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Evidence Quality Status</CardTitle>
                  <CardDescription>Overall assessment of your visa application evidence</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-4 gap-4">
                    <Card className={overallScore >= 80 ? "border-green-500 dark:border-green-500" : overallScore >= 60 ? "border-orange-500 dark:border-orange-500" : "border-destructive dark:border-destructive"}>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">Overall Score</p>
                          <p className="text-3xl font-bold" data-testid="text-overall-score">{overallScore}%</p>
                          <Progress value={overallScore} className="mt-2" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">Evidence Items</p>
                          <p className="text-3xl font-bold" data-testid="text-total-items">{evidenceItems.length}</p>
                          <p className="text-xs text-muted-foreground mt-2">Minimum: 12</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className={criticalGaps === 0 ? "border-green-500 dark:border-green-500" : "border-orange-500 dark:border-orange-500"}>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">Critical Gaps</p>
                          <p className="text-3xl font-bold text-orange-600 dark:text-orange-400" data-testid="text-critical-gaps">{criticalGaps}</p>
                          <p className="text-xs text-muted-foreground mt-2">Items below 60%</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className={readyForSubmission ? "border-green-500 dark:border-green-500" : "border-orange-500 dark:border-orange-500"}>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">Submission Status</p>
                          <div className="flex items-center justify-center gap-2 mt-2">
                            {readyForSubmission ? (
                              <>
                                <CheckCircle2 className="h-6 w-6 text-green-500" />
                                <span className="font-bold text-green-600 dark:text-green-400">Ready</span>
                              </>
                            ) : (
                              <>
                                <AlertTriangle className="h-6 w-6 text-orange-500" />
                                <span className="font-bold text-orange-600 dark:text-orange-400">Review</span>
                              </>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {!readyForSubmission && evidenceItems.length > 0 && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        {overallScore < 80 && "Evidence quality below recommended threshold (80%). "}
                        {evidenceItems.length < 12 && "Provide at least 12 evidence items for comprehensive coverage. "}
                        Review recommendations to strengthen your application.
                      </AlertDescription>
                    </Alert>
                  )}

                  {readyForSubmission && (
                    <Alert className="border-green-500 bg-green-50 dark:bg-green-950 dark:border-green-500">
                      <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                      <AlertDescription className="text-green-600 dark:text-green-400">
                        Excellent! Your evidence meets quality standards and quantity requirements. Ensure all documents are organized and indexed for submission.
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="grid md:grid-cols-4 gap-4">
                    {Object.entries(EVIDENCE_CATEGORIES).map(([key, cat]) => (
                      <Card key={key} className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-sm">{cat.name}</h3>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => addEvidenceItem(key as any)}
                            data-testid={`button-add-${key}`}
                          >
                            Add
                          </Button>
                        </div>
                        <p className="text-2xl font-bold" style={{ color: cat.color }}>{getCategoryScore(key)}%</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {evidenceItems.filter(item => item.category === key).length} items
                        </p>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="validation" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Evidence Items</CardTitle>
                  <CardDescription>Rate each piece of evidence across 5 quality dimensions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {evidenceItems.length === 0 && (
                    <div className="text-center py-12">
                      <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground mb-4">No evidence items added yet</p>
                      <div className="flex gap-2 justify-center flex-wrap">
                        {Object.entries(EVIDENCE_CATEGORIES).map(([key, cat]) => (
                          <Button
                            key={key}
                            variant="outline"
                            onClick={() => addEvidenceItem(key as any)}
                            data-testid={`button-add-${key}-empty`}
                          >
                            Add {cat.name}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {evidenceItems.map((item, index) => (
                    <Card key={index} className="p-4" data-testid={`evidence-item-${index}`}>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: EVIDENCE_CATEGORIES[item.category].color }}
                            />
                            <div className="flex-1 grid md:grid-cols-3 gap-3">
                              <div>
                                <Label htmlFor={`item-name-${index}`}>Evidence Name</Label>
                                <Input
                                  id={`item-name-${index}`}
                                  value={item.name}
                                  onChange={(e) => updateEvidenceItem(index, 'name', e.target.value)}
                                  placeholder="e.g., Patent Application GB123456"
                                  data-testid={`input-item-name-${index}`}
                                />
                              </div>
                              <div>
                                <Label htmlFor={`item-category-${index}`}>Category</Label>
                                <select
                                  id={`item-category-${index}`}
                                  value={item.category}
                                  onChange={(e) => updateEvidenceItem(index, 'category', e.target.value)}
                                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                                  data-testid={`select-item-category-${index}`}
                                >
                                  {Object.entries(EVIDENCE_CATEGORIES).map(([key, cat]) => (
                                    <option key={key} value={key}>{cat.name}</option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <Label htmlFor={`item-date-${index}`}>Date Provided</Label>
                                <Input
                                  id={`item-date-${index}`}
                                  type="date"
                                  value={item.dateProvided}
                                  onChange={(e) => updateEvidenceItem(index, 'dateProvided', e.target.value)}
                                  data-testid={`input-item-date-${index}`}
                                />
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeEvidenceItem(index)}
                            data-testid={`button-remove-item-${index}`}
                          >
                            Remove
                          </Button>
                        </div>

                        <div className="grid md:grid-cols-5 gap-3">
                          <div>
                            <Label className="text-xs">Authenticity</Label>
                            <div className="flex gap-1 mt-1">
                              {[1, 2, 3, 4, 5].map(score => (
                                <button
                                  key={score}
                                  onClick={() => updateEvidenceItem(index, 'authenticity', score)}
                                  className={`w-8 h-8 rounded border ${
                                    item.authenticity >= score 
                                      ? 'bg-primary text-primary-foreground border-primary' 
                                      : 'bg-background border-input hover-elevate'
                                  }`}
                                  data-testid={`button-authenticity-${index}-${score}`}
                                >
                                  {score}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div>
                            <Label className="text-xs">Relevance</Label>
                            <div className="flex gap-1 mt-1">
                              {[1, 2, 3, 4, 5].map(score => (
                                <button
                                  key={score}
                                  onClick={() => updateEvidenceItem(index, 'relevance', score)}
                                  className={`w-8 h-8 rounded border ${
                                    item.relevance >= score 
                                      ? 'bg-primary text-primary-foreground border-primary' 
                                      : 'bg-background border-input hover-elevate'
                                  }`}
                                  data-testid={`button-relevance-${index}-${score}`}
                                >
                                  {score}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div>
                            <Label className="text-xs">Completeness</Label>
                            <div className="flex gap-1 mt-1">
                              {[1, 2, 3, 4, 5].map(score => (
                                <button
                                  key={score}
                                  onClick={() => updateEvidenceItem(index, 'completeness', score)}
                                  className={`w-8 h-8 rounded border ${
                                    item.completeness >= score 
                                      ? 'bg-primary text-primary-foreground border-primary' 
                                      : 'bg-background border-input hover-elevate'
                                  }`}
                                  data-testid={`button-completeness-${index}-${score}`}
                                >
                                  {score}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div>
                            <Label className="text-xs">Recency</Label>
                            <div className="flex gap-1 mt-1">
                              {[1, 2, 3, 4, 5].map(score => (
                                <button
                                  key={score}
                                  onClick={() => updateEvidenceItem(index, 'recency', score)}
                                  className={`w-8 h-8 rounded border ${
                                    item.recency >= score 
                                      ? 'bg-primary text-primary-foreground border-primary' 
                                      : 'bg-background border-input hover-elevate'
                                  }`}
                                  data-testid={`button-recency-${index}-${score}`}
                                >
                                  {score}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div>
                            <Label className="text-xs">Format</Label>
                            <div className="flex gap-1 mt-1">
                              {[1, 2, 3, 4, 5].map(score => (
                                <button
                                  key={score}
                                  onClick={() => updateEvidenceItem(index, 'formatCompliance', score)}
                                  className={`w-8 h-8 rounded border ${
                                    item.formatCompliance >= score 
                                      ? 'bg-primary text-primary-foreground border-primary' 
                                      : 'bg-background border-input hover-elevate'
                                  }`}
                                  data-testid={`button-format-${index}-${score}`}
                                >
                                  {score}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div>
                          <Label htmlFor={`item-notes-${index}`}>Notes</Label>
                          <Textarea
                            id={`item-notes-${index}`}
                            value={item.notes}
                            onChange={(e) => updateEvidenceItem(index, 'notes', e.target.value)}
                            placeholder="Additional notes about this evidence..."
                            className="resize-none"
                            rows={2}
                            data-testid={`textarea-item-notes-${index}`}
                          />
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t">
                          <div className="text-sm text-muted-foreground">
                            Item Score: <span className="font-bold" data-testid={`text-item-score-${index}`}>{calculateItemScore(item)}%</span>
                          </div>
                          <div className="flex gap-2">
                            {calculateItemScore(item) >= 80 && (
                              <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400 rounded">Excellent</span>
                            )}
                            {calculateItemScore(item) >= 60 && calculateItemScore(item) < 80 && (
                              <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 rounded">Good</span>
                            )}
                            {calculateItemScore(item) >= 40 && calculateItemScore(item) < 60 && (
                              <span className="text-xs px-2 py-1 bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-400 rounded">Needs Improvement</span>
                            )}
                            {calculateItemScore(item) > 0 && calculateItemScore(item) < 40 && (
                              <span className="text-xs px-2 py-1 bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400 rounded">Critical Gap</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analysis" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Quality Distribution</CardTitle>
                    <CardDescription>Evidence items by quality rating</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {qualityDistribution.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={qualityDistribution}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            label={(entry) => `${entry.name}: ${entry.value}`}
                          >
                            {qualityDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-center text-muted-foreground py-12">Add and rate evidence items to see distribution</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Category Strength</CardTitle>
                    <CardDescription>Average quality score by evidence category</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {categoryStrengthData.some(d => d.score > 0) ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={categoryStrengthData}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                          <YAxis domain={[0, 100]} />
                          <Tooltip />
                          <Bar dataKey="score" name="Quality Score (%)">
                            {categoryStrengthData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-center text-muted-foreground py-12">Add and rate evidence items to see category analysis</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Evidence Gap Analysis</CardTitle>
                  <CardDescription>Recommended evidence items for comprehensive coverage</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    {Object.entries(EVIDENCE_CATEGORIES).map(([key, cat]) => {
                      const provided = evidenceItems.filter(item => item.category === key).map(i => i.name);
                      const missing = cat.required.filter(req => !provided.some(p => p.toLowerCase().includes(req.toLowerCase())));
                      
                      return (
                        <div key={key} className="space-y-3">
                          <h3 className="font-semibold" style={{ color: cat.color }}>{cat.name}</h3>
                          <div className="space-y-2">
                            {cat.required.map((req, i) => {
                              const hasEvidence = provided.some(p => p.toLowerCase().includes(req.toLowerCase()));
                              return (
                                <div key={i} className="flex items-start gap-2">
                                  {hasEvidence ? (
                                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                  ) : (
                                    <XCircle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                  )}
                                  <span className={`text-sm ${hasEvidence ? '' : 'text-muted-foreground'}`}>{req}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tips" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Smart Recommendations</CardTitle>
                  <CardDescription>AI-powered tips to strengthen your evidence portfolio</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {getSmartTips().map((tip, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-accent/50 dark:bg-accent/20 rounded-lg">
                        <AlertTriangle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <p className="text-sm" data-testid={`tip-${index}`}>{tip}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>4-Week Action Plan</CardTitle>
                  <CardDescription>Prioritized timeline to strengthen your evidence</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {generateActionPlan().map((item, index) => (
                      <div key={index} className="flex gap-4" data-testid={`action-plan-${index}`}>
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                          <span className="font-semibold text-sm whitespace-nowrap">{item.week}</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm mb-1">{item.action}</p>
                          <span className={`text-xs px-2 py-0.5 rounded ${
                            item.priority === 'Critical' 
                              ? 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400' 
                              : item.priority === 'High'
                              ? 'bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-400'
                              : 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400'
                          }`}>
                            {item.priority}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="standards" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Home Office Evidence Standards</CardTitle>
                  <CardDescription>UK Visa & Immigration documentation requirements</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {HOME_OFFICE_STANDARDS.map((standard, index) => (
                      <div key={index} className="p-4 bg-accent/30 dark:bg-accent/10 rounded-lg" data-testid={`standard-${index}`}>
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold">{standard.title}</h3>
                          <span className={`text-xs px-2 py-1 rounded ${
                            standard.weight === 'Critical' 
                              ? 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400' 
                              : 'bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-400'
                          }`}>
                            {standard.weight}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{standard.description}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Document Recency Guidelines</CardTitle>
                  <CardDescription>Recommended maximum age for different evidence types</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Financial Evidence (3 months)</p>
                        <p className="text-sm text-muted-foreground">Bank statements, revenue reports, investment confirmations</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Market Evidence (6 months)</p>
                        <p className="text-sm text-muted-foreground">Market research, competitor analysis, customer surveys</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Technical Evidence (12 months)</p>
                        <p className="text-sm text-muted-foreground">Patents, technical architecture, IP documentation</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Team Evidence (Current)</p>
                        <p className="text-sm text-muted-foreground">CVs, references, advisory board confirmations should reflect current status</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Common Evidence Issues</CardTitle>
                  <CardDescription>Frequent problems that lead to application delays or rejections</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-950/30 rounded-lg">
                      <XCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-sm">Uncertified copies or screenshots</p>
                        <p className="text-xs text-muted-foreground">Always provide originals or certified copies, never screenshots</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-950/30 rounded-lg">
                      <XCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-sm">Missing pages or redacted information</p>
                        <p className="text-xs text-muted-foreground">Submit complete documents - redactions raise authenticity concerns</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-950/30 rounded-lg">
                      <XCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-sm">Outdated financial statements</p>
                        <p className="text-xs text-muted-foreground">Update to within 3 months of submission date</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-950/30 rounded-lg">
                      <XCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-sm">Letters without contact details</p>
                        <p className="text-xs text-muted-foreground">Third-party letters must include full contact information for verification</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          )}
        </div>
      </div>
    </>
  );
}
