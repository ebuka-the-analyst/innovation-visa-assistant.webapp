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
import { CheckCircle2, XCircle, AlertTriangle, TrendingUp } from "lucide-react";
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

type ValidationItem = {
  category: 'novelty' | 'prior-art' | 'technical' | 'competitive' | 'market';
  question: string;
  completed: boolean;
  evidence: string;
  score: number;
};

type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

type RiskAssessment = {
  area: string;
  level: RiskLevel;
  description: string;
  mitigation: string;
};

export default function InnovationValidation() {
  const [innovationName, setInnovationName] = useState('');
  const [innovationDescription, setInnovationDescription] = useState('');
  const [validationItems, setValidationItems] = useState<ValidationItem[]>([
    { category: 'novelty', question: 'Clear documentation of novel features/approach', completed: false, evidence: '', score: 0 },
    { category: 'novelty', question: 'Comparison showing differentiation from existing solutions', completed: false, evidence: '', score: 0 },
    { category: 'novelty', question: 'Evidence of unique value proposition', completed: false, evidence: '', score: 0 },
    { category: 'prior-art', question: 'Comprehensive prior art search conducted', completed: false, evidence: '', score: 0 },
    { category: 'prior-art', question: 'Patent/IP landscape analysis completed', completed: false, evidence: '', score: 0 },
    { category: 'prior-art', question: 'Academic research review performed', completed: false, evidence: '', score: 0 },
    { category: 'technical', question: 'Technical feasibility study completed', completed: false, evidence: '', score: 0 },
    { category: 'technical', question: 'Prototype or proof-of-concept developed', completed: false, evidence: '', score: 0 },
    { category: 'technical', question: 'Technical risks identified and mitigation planned', completed: false, evidence: '', score: 0 },
    { category: 'technical', question: 'Scalability analysis performed', completed: false, evidence: '', score: 0 },
    { category: 'competitive', question: 'Direct competitors identified and analyzed', completed: false, evidence: '', score: 0 },
    { category: 'competitive', question: 'Competitive advantages clearly articulated', completed: false, evidence: '', score: 0 },
    { category: 'competitive', question: 'Barriers to entry documented', completed: false, evidence: '', score: 0 },
    { category: 'market', question: 'Target market size quantified', completed: false, evidence: '', score: 0 },
    { category: 'market', question: 'Customer validation/interviews conducted', completed: false, evidence: '', score: 0 },
    { category: 'market', question: 'Market need validated with evidence', completed: false, evidence: '', score: 0 },
  ]);
  const [risks, setRisks] = useState<RiskAssessment[]>([
    { area: 'Technical Viability', level: 'medium', description: 'Unproven technology stack', mitigation: 'Complete prototype testing' },
    { area: 'Market Adoption', level: 'medium', description: 'Customer validation needed', mitigation: 'Conduct user interviews' },
    { area: 'Competitive Pressure', level: 'low', description: 'Few direct competitors', mitigation: 'Monitor market regularly' },
  ]);
  const [activeTab, setActiveTab] = useState('assessment');
  const [savedDate, setSavedDate] = useState('');

  const completedItems = validationItems.filter(item => item.completed).length;
  const totalItems = validationItems.length;
  const completionRate = Math.round((completedItems / totalItems) * 100);
  const averageScore = validationItems.length > 0 
    ? Math.round(validationItems.reduce((sum, item) => sum + item.score, 0) / validationItems.length)
    : 0;
  const validationScore = Math.round((completionRate * 0.6) + (averageScore * 0.4));

  const updateValidationItem = (index: number, field: keyof ValidationItem, value: any) => {
    const updated = [...validationItems];
    updated[index] = { ...updated[index], [field]: value };
    setValidationItems(updated);
  };

  const addRisk = () => {
    setRisks([...risks, { area: '', level: 'medium', description: '', mitigation: '' }]);
  };

  const updateRisk = (index: number, field: keyof RiskAssessment, value: any) => {
    const updated = [...risks];
    updated[index] = { ...updated[index], [field]: value };
    setRisks(updated);
  };

  const removeRisk = (index: number) => {
    setRisks(risks.filter((_, i) => i !== index));
  };

  const categoryCompletionData = [
    { 
      name: 'Novelty', 
      completed: validationItems.filter(i => i.category === 'novelty' && i.completed).length,
      total: validationItems.filter(i => i.category === 'novelty').length,
      color: '#3b82f6'
    },
    { 
      name: 'Prior Art', 
      completed: validationItems.filter(i => i.category === 'prior-art' && i.completed).length,
      total: validationItems.filter(i => i.category === 'prior-art').length,
      color: '#10b981'
    },
    { 
      name: 'Technical', 
      completed: validationItems.filter(i => i.category === 'technical' && i.completed).length,
      total: validationItems.filter(i => i.category === 'technical').length,
      color: '#f59e0b'
    },
    { 
      name: 'Competitive', 
      completed: validationItems.filter(i => i.category === 'competitive' && i.completed).length,
      total: validationItems.filter(i => i.category === 'competitive').length,
      color: '#8b5cf6'
    },
    { 
      name: 'Market', 
      completed: validationItems.filter(i => i.category === 'market' && i.completed).length,
      total: validationItems.filter(i => i.category === 'market').length,
      color: '#ec4899'
    },
  ];

  const completionPieData = [
    { name: 'Completed', value: completedItems, fill: '#10b981' },
    { name: 'Pending', value: totalItems - completedItems, fill: '#ef4444' },
  ];

  const riskLevelCounts = {
    low: risks.filter(r => r.level === 'low').length,
    medium: risks.filter(r => r.level === 'medium').length,
    high: risks.filter(r => r.level === 'high').length,
    critical: risks.filter(r => r.level === 'critical').length,
  };

  const riskBarData = [
    { level: 'Low', count: riskLevelCounts.low, fill: '#10b981' },
    { level: 'Medium', count: riskLevelCounts.medium, fill: '#f59e0b' },
    { level: 'High', count: riskLevelCounts.high, fill: '#ef4444' },
    { level: 'Critical', count: riskLevelCounts.critical, fill: '#991b1b' },
  ].filter(item => item.count > 0);

  const getSerializedState = () => {
    return {
      innovationName,
      innovationDescription,
      validationItems,
      risks,
      activeTab,
      savedDate: new Date().toLocaleString('en-GB')
    };
  };

  const restoreSerializedState = (state: any) => {
    if ('innovationName' in state) setInnovationName(state.innovationName);
    if ('innovationDescription' in state) setInnovationDescription(state.innovationDescription);
    if ('validationItems' in state) setValidationItems(state.validationItems);
    if ('risks' in state) setRisks(state.risks);
    if ('activeTab' in state) setActiveTab(state.activeTab);
    if ('savedDate' in state) setSavedDate(state.savedDate || '');
  };

  useEffect(() => {
    const handoffKey = 'innovation-validation_handoff';
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
      const saved = localStorage.getItem('innovation-validation-state');
      if (saved) {
        const state = JSON.parse(saved);
        restoreSerializedState(state);
      }
    }
  }, []);

  const handleSave = () => {
    const state = getSerializedState();
    localStorage.setItem('innovation-validation-state', JSON.stringify(state));
    setSavedDate(state.savedDate);
  };

  const handleRestore = () => {
    const saved = localStorage.getItem('innovation-validation-state');
    if (saved) {
      const state = JSON.parse(saved);
      restoreSerializedState(state);
    }
  };

  const getSmartTips = () => {
    const tips = [];
    
    if (completionRate < 50) {
      tips.push("Complete at least 50% of validation items to demonstrate thorough innovation assessment to endorsers");
    }
    
    if (validationItems.filter(i => i.category === 'prior-art' && i.completed).length < 2) {
      tips.push("Prior art search is critical - endorsers require evidence that your innovation is truly novel and not duplicating existing work");
    }
    
    if (validationItems.filter(i => i.category === 'technical' && i.completed).length < 2) {
      tips.push("Technical feasibility evidence strengthens your case - include prototypes, technical specifications, or expert validations");
    }
    
    if (validationItems.filter(i => i.category === 'market' && i.completed).length === 0) {
      tips.push("Market validation is essential - customer interviews, surveys, or letters of intent demonstrate real demand for your innovation");
    }
    
    if (risks.filter(r => r.level === 'high' || r.level === 'critical').length > 2) {
      tips.push("Address high/critical risks before submission - endorsers evaluate your ability to manage innovation risks effectively");
    }
    
    if (averageScore < 6) {
      tips.push("Aim for quality scores of 7+ across all validation items - provide detailed evidence and documentation for each criterion");
    }
    
    if (validationItems.filter(i => i.category === 'competitive' && i.completed).length < 2) {
      tips.push("Competitive differentiation analysis is crucial - clearly articulate what makes your innovation superior to alternatives");
    }
    
    if (!innovationDescription || innovationDescription.length < 100) {
      tips.push("Provide comprehensive innovation description (200+ words) explaining the problem, solution, and unique approach");
    }
    
    if (validationItems.filter(i => i.evidence && i.evidence.length > 50).length < 5) {
      tips.push("Add detailed evidence for each validation item - specific examples, data, and documentation strengthen endorser confidence");
    }
    
    return tips.slice(0, 8);
  };

  const generateActionPlan = () => {
    return [
      { week: "Week 1", action: "Conduct comprehensive prior art search (patents, academic papers, competitor solutions)", priority: "Critical" },
      { week: "Week 1", action: "Document innovation's unique features and create detailed comparison matrix vs existing solutions", priority: "Critical" },
      { week: "Week 1-2", action: "Complete technical feasibility analysis - identify required resources, timeline, and potential blockers", priority: "High" },
      { week: "Week 2", action: "Develop proof-of-concept or prototype demonstrating core innovation functionality", priority: "Critical" },
      { week: "Week 2", action: "Conduct market research - quantify target market size with credible data sources", priority: "High" },
      { week: "Week 2-3", action: "Perform customer validation - minimum 10 interviews with potential users/buyers", priority: "Critical" },
      { week: "Week 3", action: "Complete competitive analysis - identify top 5 competitors and document differentiation", priority: "High" },
      { week: "Week 3", action: "Assess and document all technical, market, and competitive risks with mitigation strategies", priority: "High" },
      { week: "Week 3-4", action: "Gather evidence documentation - patents, technical specs, customer testimonials, market data", priority: "Critical" },
      { week: "Week 4", action: "Create innovation validation summary report for endorser submission", priority: "Critical" },
      { week: "Week 4", action: "Review all validation items ensure scores of 7+ with supporting evidence", priority: "High" },
      { week: "Ongoing", action: "Update validation assessment as new evidence becomes available", priority: "Medium" },
    ];
  };

  const handleExport = () => {
    const report = `UK INNOVATOR FOUNDER VISA - INNOVATION VALIDATION REPORT
Generated: ${new Date().toLocaleString('en-GB')}
${'='.repeat(80)}

INNOVATION OVERVIEW
${'-'.repeat(80)}
Innovation Name: ${innovationName || 'Not specified'}

Description:
${innovationDescription || 'No description provided'}

VALIDATION SUMMARY
${'-'.repeat(80)}
Overall Validation Score: ${validationScore}%
Completion Rate: ${completionRate}% (${completedItems}/${totalItems} items completed)
Average Quality Score: ${averageScore}/10
Assessment Status: ${validationScore >= 80 ? 'STRONG - Ready for endorser submission' : validationScore >= 60 ? 'MODERATE - Additional validation recommended' : 'DEVELOPING - Significant work needed'}

VALIDATION ITEMS BY CATEGORY
${'-'.repeat(80)}

NOVELTY VALIDATION:
${validationItems.filter(i => i.category === 'novelty').map((item, idx) => `
${idx + 1}. ${item.question}
   Status: ${item.completed ? 'COMPLETED' : 'PENDING'} | Score: ${item.score}/10
   Evidence: ${item.evidence || 'No evidence provided'}
`).join('')}

PRIOR ART SEARCH:
${validationItems.filter(i => i.category === 'prior-art').map((item, idx) => `
${idx + 1}. ${item.question}
   Status: ${item.completed ? 'COMPLETED' : 'PENDING'} | Score: ${item.score}/10
   Evidence: ${item.evidence || 'No evidence provided'}
`).join('')}

TECHNICAL FEASIBILITY:
${validationItems.filter(i => i.category === 'technical').map((item, idx) => `
${idx + 1}. ${item.question}
   Status: ${item.completed ? 'COMPLETED' : 'PENDING'} | Score: ${item.score}/10
   Evidence: ${item.evidence || 'No evidence provided'}
`).join('')}

COMPETITIVE DIFFERENTIATION:
${validationItems.filter(i => i.category === 'competitive').map((item, idx) => `
${idx + 1}. ${item.question}
   Status: ${item.completed ? 'COMPLETED' : 'PENDING'} | Score: ${item.score}/10
   Evidence: ${item.evidence || 'No evidence provided'}
`).join('')}

MARKET NEED VALIDATION:
${validationItems.filter(i => i.category === 'market').map((item, idx) => `
${idx + 1}. ${item.question}
   Status: ${item.completed ? 'COMPLETED' : 'PENDING'} | Score: ${item.score}/10
   Evidence: ${item.evidence || 'No evidence provided'}
`).join('')}

RISK ASSESSMENT
${'-'.repeat(80)}
${risks.map((risk, i) => `
${i + 1}. ${risk.area || 'Unnamed Risk Area'}
   Risk Level: ${risk.level.toUpperCase()}
   Description: ${risk.description}
   Mitigation Strategy: ${risk.mitigation}
`).join('')}

CATEGORY COMPLETION ANALYSIS
${'-'.repeat(80)}
${categoryCompletionData.map(cat => 
  `${cat.name}: ${cat.completed}/${cat.total} completed (${Math.round((cat.completed/cat.total)*100)}%)`
).join('\n')}

SMART RECOMMENDATIONS
${'-'.repeat(80)}
${getSmartTips().map((tip, i) => `${i + 1}. ${tip}`).join('\n')}

4-WEEK ACTION PLAN
${'-'.repeat(80)}
${generateActionPlan().map(item => `[${item.priority}] ${item.week}: ${item.action}`).join('\n')}

ENDORSER INNOVATION EVIDENCE REQUIREMENTS
${'-'.repeat(80)}
For UK Innovator Founder visa endorsement, you must demonstrate:

1. GENUINE INNOVATION
   - Novel approach, product, or service not widely available in UK market
   - Clear differentiation from existing solutions
   - Evidence of innovative thinking and problem-solving

2. VIABILITY
   - Technical feasibility demonstrated through prototypes or proof-of-concept
   - Realistic assessment of resources, timeline, and risks
   - Evidence of capability to execute the innovation

3. SCALABILITY
   - Potential for significant job creation in the UK
   - Evidence of market size and growth potential
   - Scalable business model with clear expansion pathway

4. COMPETITIVE ADVANTAGE
   - Sustainable differentiation from competitors
   - Barriers to entry or unique positioning
   - Clear value proposition for target customers

5. MARKET VALIDATION
   - Evidence of customer demand (interviews, surveys, letters of intent)
   - Quantified market size and opportunity
   - Understanding of customer pain points and willingness to pay

RECOMMENDED DOCUMENTATION
${'-'.repeat(80)}
- Prior art search report (patent databases, academic journals, competitor analysis)
- Technical specifications and architecture documentation
- Prototype demonstration or proof-of-concept results
- Customer validation evidence (interview transcripts, survey results, LOIs)
- Market research report with size, growth, and competitive analysis
- IP strategy (patents filed/pending, trade secrets, trademarks)
- Expert endorsements or technical validation letters
- Risk assessment with detailed mitigation strategies

${'='.repeat(80)}
Report generated by UK Innovator Founder Visa Assistant
© 2025 innovatorfoundervisaassistant.co.uk
`;

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `innovation-validation-report-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      'novelty': 'Novelty Claims',
      'prior-art': 'Prior Art Search',
      'technical': 'Technical Feasibility',
      'competitive': 'Competitive Analysis',
      'market': 'Market Validation'
    };
    return labels[category] || category;
  };

  const getRiskColor = (level: RiskLevel) => {
    const colors: Record<RiskLevel, string> = {
      'low': 'border-green-500',
      'medium': 'border-yellow-500',
      'high': 'border-orange-500',
      'critical': 'border-red-500'
    };
    return colors[level];
  };

  return (
    <>
      
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        <div className="max-w-7xl mx-auto">
          
          
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2" data-testid="heading-innovation-validation">Innovation Validation</h1>
            <p className="text-lg text-muted-foreground">Comprehensive validation of innovation novelty, feasibility, and market potential</p>
            {savedDate && (
              <p className="text-sm text-muted-foreground mt-2" data-testid="text-last-saved">Last saved: {savedDate}</p>
            )}
          </div>

          <ToolUtilityBar
            toolId="innovation-validation"
            onSave={handleSave}
            onRestore={handleRestore}
            onExport={handleExport}
            getSerializedState={getSerializedState}
            toolName="Innovation Validation"
          />

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5" data-testid="tabs-innovation-validation">
              <TabsTrigger value="assessment" data-testid="tab-assessment">Assessment</TabsTrigger>
              <TabsTrigger value="validation" data-testid="tab-validation">Validation Items</TabsTrigger>
              <TabsTrigger value="risks" data-testid="tab-risks">Risk Analysis</TabsTrigger>
              <TabsTrigger value="tips" data-testid="tab-tips">Smart Tips</TabsTrigger>
              <TabsTrigger value="action" data-testid="tab-action">Action Plan</TabsTrigger>
            </TabsList>

            <TabsContent value="assessment" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Innovation Overview</CardTitle>
                  <CardDescription>Provide basic information about your innovation</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="innovation-name">Innovation Name</Label>
                    <Input
                      id="innovation-name"
                      value={innovationName}
                      onChange={(e) => setInnovationName(e.target.value)}
                      placeholder="Enter your innovation name"
                      data-testid="input-innovation-name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="innovation-description">Innovation Description</Label>
                    <Textarea
                      id="innovation-description"
                      value={innovationDescription}
                      onChange={(e) => setInnovationDescription(e.target.value)}
                      placeholder="Describe your innovation, the problem it solves, and how it differs from existing solutions (minimum 200 words recommended)"
                      rows={6}
                      data-testid="textarea-innovation-description"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {innovationDescription.length} characters
                    </p>
                  </div>
                </CardContent>
              </Card>

              <div className="grid md:grid-cols-3 gap-4">
                <Card className={validationScore >= 80 ? "border-green-500" : validationScore >= 60 ? "border-yellow-500" : "border-orange-500"}>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-2">Validation Score</p>
                      <p className="text-3xl font-bold" data-testid="text-validation-score">{validationScore}%</p>
                      <div className="flex items-center justify-center gap-2 mt-2">
                        {validationScore >= 80 ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : validationScore >= 60 ? (
                          <AlertTriangle className="h-5 w-5 text-yellow-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-orange-500" />
                        )}
                        <span className="text-sm">
                          {validationScore >= 80 ? 'Strong' : validationScore >= 60 ? 'Moderate' : 'Developing'}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-2">Completion Rate</p>
                      <p className="text-3xl font-bold text-primary" data-testid="text-completion-rate">{completionRate}%</p>
                      <p className="text-sm text-muted-foreground mt-2">{completedItems}/{totalItems} items</p>
                      <Progress value={completionRate} className="mt-2" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-2">Average Quality Score</p>
                      <p className="text-3xl font-bold text-primary" data-testid="text-average-score">{averageScore}/10</p>
                      <div className="flex items-center justify-center gap-2 mt-2">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        <span className="text-sm">
                          {averageScore >= 7 ? 'Excellent' : averageScore >= 5 ? 'Good' : 'Needs Improvement'}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {validationScore < 60 && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Your innovation validation score is below the recommended threshold. Complete more validation items and provide stronger evidence to improve your endorser submission readiness.
                  </AlertDescription>
                </Alert>
              )}

              {validationScore >= 80 && (
                <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-600 dark:text-green-400">
                    Excellent validation score! Your innovation assessment demonstrates strong evidence across all key dimensions. Ensure all documentation is complete for endorser submission.
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Validation Completion by Category</CardTitle>
                    <CardDescription>Progress across innovation assessment dimensions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={completionPieData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          label={(entry) => `${entry.name}: ${entry.value}`}
                        >
                          {completionPieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Risk Assessment Distribution</CardTitle>
                    <CardDescription>Innovation risks by severity level</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {riskBarData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={riskBarData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="level" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="count" fill="#3b82f6">
                            {riskBarData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-center text-muted-foreground py-12">No risks identified yet</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Category Progress</CardTitle>
                  <CardDescription>Detailed completion status by validation category</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {categoryCompletionData.map((category, index) => {
                      const percentage = category.total > 0 ? Math.round((category.completed / category.total) * 100) : 0;
                      return (
                        <div key={index}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{category.name}</span>
                            <span className="text-sm text-muted-foreground">
                              {category.completed}/{category.total} ({percentage}%)
                            </span>
                          </div>
                          <Progress value={percentage} className="h-2" />
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="validation" className="space-y-6">
              {['novelty', 'prior-art', 'technical', 'competitive', 'market'].map((category) => {
                const items = validationItems.filter(item => item.category === category);
                return (
                  <Card key={category}>
                    <CardHeader>
                      <CardTitle>{getCategoryLabel(category)}</CardTitle>
                      <CardDescription>
                        {items.filter(i => i.completed).length}/{items.length} items completed
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {validationItems
                        .map((item, index) => ({ item, originalIndex: index }))
                        .filter(({ item }) => item.category === category)
                        .map(({ item, originalIndex }) => (
                          <Card key={originalIndex} className="p-4">
                            <div className="space-y-3">
                              <div className="flex items-start gap-3">
                                <input
                                  type="checkbox"
                                  checked={item.completed}
                                  onChange={(e) => updateValidationItem(originalIndex, 'completed', e.target.checked)}
                                  className="h-4 w-4 mt-1"
                                  data-testid={`checkbox-validation-${originalIndex}`}
                                />
                                <div className="flex-1">
                                  <p className="font-medium">{item.question}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Label className="text-xs">Score:</Label>
                                  <Input
                                    type="number"
                                    min="0"
                                    max="10"
                                    value={item.score}
                                    onChange={(e) => updateValidationItem(originalIndex, 'score', parseInt(e.target.value) || 0)}
                                    className="w-16 h-8"
                                    data-testid={`input-score-${originalIndex}`}
                                  />
                                  <span className="text-xs text-muted-foreground">/10</span>
                                </div>
                              </div>
                              <div>
                                <Label htmlFor={`evidence-${originalIndex}`} className="text-xs">Evidence/Documentation</Label>
                                <Textarea
                                  id={`evidence-${originalIndex}`}
                                  value={item.evidence}
                                  onChange={(e) => updateValidationItem(originalIndex, 'evidence', e.target.value)}
                                  placeholder="Describe your evidence, data sources, documentation, or validation results"
                                  rows={2}
                                  className="text-sm"
                                  data-testid={`textarea-evidence-${originalIndex}`}
                                />
                              </div>
                            </div>
                          </Card>
                        ))}
                    </CardContent>
                  </Card>
                );
              })}
            </TabsContent>

            <TabsContent value="risks" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Risk Assessment</CardTitle>
                      <CardDescription>Identify and mitigate innovation risks</CardDescription>
                    </div>
                    <Button onClick={addRisk} size="sm" data-testid="button-add-risk">
                      Add Risk
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {risks.map((risk, index) => (
                    <Card key={index} className={`p-4 border-l-4 ${getRiskColor(risk.level)}`}>
                      <div className="space-y-3">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor={`risk-area-${index}`}>Risk Area</Label>
                            <Input
                              id={`risk-area-${index}`}
                              value={risk.area}
                              onChange={(e) => updateRisk(index, 'area', e.target.value)}
                              placeholder="e.g., Technical Viability, Market Adoption"
                              data-testid={`input-risk-area-${index}`}
                            />
                          </div>
                          <div className="flex items-end gap-2">
                            <div className="flex-1">
                              <Label htmlFor={`risk-level-${index}`}>Risk Level</Label>
                              <select
                                id={`risk-level-${index}`}
                                value={risk.level}
                                onChange={(e) => updateRisk(index, 'level', e.target.value)}
                                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                                data-testid={`select-risk-level-${index}`}
                              >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                                <option value="critical">Critical</option>
                              </select>
                            </div>
                            {risks.length > 1 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeRisk(index)}
                                data-testid={`button-remove-risk-${index}`}
                              >
                                Remove
                              </Button>
                            )}
                          </div>
                        </div>
                        <div>
                          <Label htmlFor={`risk-description-${index}`}>Description</Label>
                          <Textarea
                            id={`risk-description-${index}`}
                            value={risk.description}
                            onChange={(e) => updateRisk(index, 'description', e.target.value)}
                            placeholder="Describe the specific risk and its potential impact"
                            rows={2}
                            data-testid={`textarea-risk-description-${index}`}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`risk-mitigation-${index}`}>Mitigation Strategy</Label>
                          <Textarea
                            id={`risk-mitigation-${index}`}
                            value={risk.mitigation}
                            onChange={(e) => updateRisk(index, 'mitigation', e.target.value)}
                            placeholder="Explain how you will address or minimize this risk"
                            rows={2}
                            data-testid={`textarea-risk-mitigation-${index}`}
                          />
                        </div>
                      </div>
                    </Card>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tips" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Smart Recommendations</CardTitle>
                  <CardDescription>AI-powered tips to strengthen your innovation validation</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {getSmartTips().map((tip, index) => (
                      <Alert key={index}>
                        <AlertDescription className="flex items-start gap-3">
                          <span className="font-bold text-primary">{index + 1}.</span>
                          <span>{tip}</span>
                        </AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Endorser Innovation Evidence Requirements</CardTitle>
                  <CardDescription>Critical documentation needed for UK Innovator Founder visa endorsement</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Genuine Innovation</p>
                        <p className="text-sm text-muted-foreground">Novel approach not widely available in UK market with clear differentiation from existing solutions</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Technical Viability</p>
                        <p className="text-sm text-muted-foreground">Feasibility demonstrated through prototypes, proof-of-concept, or technical validation from experts</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Market Validation</p>
                        <p className="text-sm text-muted-foreground">Evidence of customer demand through interviews, surveys, letters of intent, or early traction</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Scalability Potential</p>
                        <p className="text-sm text-muted-foreground">Significant job creation potential in UK with clear expansion pathway and market growth opportunity</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Competitive Advantage</p>
                        <p className="text-sm text-muted-foreground">Sustainable differentiation with barriers to entry and unique value proposition</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Prior Art Due Diligence</p>
                        <p className="text-sm text-muted-foreground">Comprehensive search of patents, academic papers, and existing solutions to demonstrate novelty</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="action" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>4-Week Action Plan</CardTitle>
                  <CardDescription>Prioritized timeline to complete innovation validation</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {generateActionPlan().map((item, index) => (
                      <Card key={index} className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0">
                            <div className={`px-2 py-1 rounded text-xs font-bold ${
                              item.priority === 'Critical' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' :
                              item.priority === 'High' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300' :
                              'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                            }`}>
                              {item.priority}
                            </div>
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-sm">{item.week}</p>
                            <p className="text-sm text-muted-foreground mt-1">{item.action}</p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}
