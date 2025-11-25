import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";


import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, XCircle, AlertTriangle, TrendingUp, Shield, FileText, Copyright, Lock, Palette } from "lucide-react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

type IPType = 'patents' | 'trademarks' | 'copyright' | 'trade-secrets' | 'designs';

type IPAsset = {
  name: string;
  type: IPType;
  filingDate: string;
  estimatedCost: number;
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'pending' | 'filed' | 'granted' | 'rejected';
  jurisdiction: string;
  riskLevel: 'low' | 'medium' | 'high';
  notes: string;
};

const IP_TYPE_ICONS: Record<IPType, any> = {
  'patents': Shield,
  'trademarks': FileText,
  'copyright': Copyright,
  'trade-secrets': Lock,
  'designs': Palette,
};

const IP_TYPE_LABELS: Record<IPType, string> = {
  'patents': 'Patents',
  'trademarks': 'Trademarks',
  'copyright': 'Copyright',
  'trade-secrets': 'Trade Secrets',
  'designs': 'Designs',
};

const IP_TYPE_COLORS: Record<IPType, string> = {
  'patents': '#3b82f6',
  'trademarks': '#10b981',
  'copyright': '#f59e0b',
  'trade-secrets': '#8b5cf6',
  'designs': '#ec4899',
};

export default function IPStrategy() {
  const [assets, setAssets] = useState<IPAsset[]>([
    { 
      name: '', 
      type: 'patents', 
      filingDate: '', 
      estimatedCost: 0, 
      priority: 'high', 
      status: 'pending', 
      jurisdiction: 'UK',
      riskLevel: 'medium',
      notes: ''
    }
  ]);
  const [activeTab, setActiveTab] = useState('strategy');
  const [savedDate, setSavedDate] = useState('');
  const [businessSector, setBusinessSector] = useState('');
  const [competitiveAdvantage, setCompetitiveAdvantage] = useState('');

  const addAsset = () => {
    setAssets([...assets, { 
      name: '', 
      type: 'patents', 
      filingDate: '', 
      estimatedCost: 0, 
      priority: 'medium', 
      status: 'pending',
      jurisdiction: 'UK',
      riskLevel: 'medium',
      notes: ''
    }]);
  };

  const updateAsset = (index: number, field: keyof IPAsset, value: any) => {
    const updated = [...assets];
    updated[index] = { ...updated[index], [field]: value };
    setAssets(updated);
  };

  const removeAsset = (index: number) => {
    setAssets(assets.filter((_, i) => i !== index));
  };

  const totalCost = assets.reduce((sum, a) => sum + (a.estimatedCost || 0), 0);
  const criticalAssets = assets.filter(a => a.priority === 'critical').length;
  const highRiskAssets = assets.filter(a => a.riskLevel === 'high').length;
  const grantedAssets = assets.filter(a => a.status === 'granted').length;

  const calculateIPScore = () => {
    let score = 0;
    
    if (assets.length > 0 && assets.some(a => a.name)) score += 20;
    if (assets.length >= 3) score += 15;
    if (assets.some(a => a.type === 'patents')) score += 20;
    if (assets.some(a => a.type === 'trademarks')) score += 15;
    if (criticalAssets >= 2) score += 10;
    if (totalCost > 10000) score += 10;
    if (grantedAssets > 0) score += 10;
    
    return Math.min(100, score);
  };

  const ipScore = calculateIPScore();

  const assetsByType = [
    { name: 'Patents', value: assets.filter(a => a.type === 'patents').length, color: IP_TYPE_COLORS['patents'] },
    { name: 'Trademarks', value: assets.filter(a => a.type === 'trademarks').length, color: IP_TYPE_COLORS['trademarks'] },
    { name: 'Copyright', value: assets.filter(a => a.type === 'copyright').length, color: IP_TYPE_COLORS['copyright'] },
    { name: 'Trade Secrets', value: assets.filter(a => a.type === 'trade-secrets').length, color: IP_TYPE_COLORS['trade-secrets'] },
    { name: 'Designs', value: assets.filter(a => a.type === 'designs').length, color: IP_TYPE_COLORS['designs'] },
  ].filter(item => item.value > 0);

  const timelineData = assets
    .filter(a => a.filingDate)
    .map(a => ({
      name: a.name || 'Unnamed',
      date: new Date(a.filingDate).getTime(),
      month: new Date(a.filingDate).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }),
      cost: a.estimatedCost,
      type: IP_TYPE_LABELS[a.type],
    }))
    .sort((a, b) => a.date - b.date)
    .slice(0, 12);

  const costByType = [
    { type: 'Patents', cost: assets.filter(a => a.type === 'patents').reduce((sum, a) => sum + a.estimatedCost, 0) },
    { type: 'Trademarks', cost: assets.filter(a => a.type === 'trademarks').reduce((sum, a) => sum + a.estimatedCost, 0) },
    { type: 'Copyright', cost: assets.filter(a => a.type === 'copyright').reduce((sum, a) => sum + a.estimatedCost, 0) },
    { type: 'Trade Secrets', cost: assets.filter(a => a.type === 'trade-secrets').reduce((sum, a) => sum + a.estimatedCost, 0) },
    { type: 'Designs', cost: assets.filter(a => a.type === 'designs').reduce((sum, a) => sum + a.estimatedCost, 0) },
  ].filter(item => item.cost > 0);

  const getSerializedState = () => {
    return {
      assets,
      activeTab,
      businessSector,
      competitiveAdvantage,
      savedDate: new Date().toLocaleString('en-GB')
    };
  };

  const restoreSerializedState = (state: any) => {
    if ('assets' in state) setAssets(state.assets);
    if ('activeTab' in state) setActiveTab(state.activeTab);
    if ('businessSector' in state) setBusinessSector(state.businessSector);
    if ('competitiveAdvantage' in state) setCompetitiveAdvantage(state.competitiveAdvantage);
    if ('savedDate' in state) setSavedDate(state.savedDate || '');
  };

  useEffect(() => {
    const saved = localStorage.getItem('ip-strategy-state');
    if (saved) {
      const state = JSON.parse(saved);
      restoreSerializedState(state);
    }
  }, []);

  const handleSave = () => {
    const state = getSerializedState();
    localStorage.setItem('ip-strategy-state', JSON.stringify(state));
    setSavedDate(state.savedDate);
  };

  const handleRestore = () => {
    const saved = localStorage.getItem('ip-strategy-state');
    if (saved) {
      const state = JSON.parse(saved);
      restoreSerializedState(state);
    }
  };

  const getSmartTips = () => {
    const tips = [];
    
    if (assets.length === 0 || !assets.some(a => a.name)) {
      tips.push("Start by identifying your core intellectual property assets - what makes your business unique and defensible?");
    }
    
    if (!assets.some(a => a.type === 'patents')) {
      tips.push("Consider patent protection for technical innovations - UK IPO offers expedited examination for innovative businesses");
    }
    
    if (!assets.some(a => a.type === 'trademarks')) {
      tips.push("Trademark your brand name and logo early - this is essential for Innovator Founder visa applications");
    }
    
    if (totalCost < 5000) {
      tips.push("Budget at least £5,000-£10,000 for initial IP protection - this demonstrates serious commitment to endorsing bodies");
    }
    
    if (highRiskAssets > 2) {
      tips.push("You have multiple high-risk IP assets - consider professional IP audit and prior art searches before filing");
    }
    
    if (assets.some(a => a.jurisdiction === 'UK' && a.type === 'patents')) {
      tips.push("UK patent applications typically cost £4,000-£8,000 including professional fees - factor this into your budget");
    }
    
    if (!assets.some(a => a.type === 'trade-secrets')) {
      tips.push("Document trade secrets and confidential processes - these are valuable IP assets that don't require registration");
    }
    
    if (criticalAssets < 2) {
      tips.push("Identify at least 2-3 critical IP assets that form your competitive moat - essential for visa endorsement");
    }
    
    if (timelineData.length === 0) {
      tips.push("Create a realistic IP filing timeline - endorsing bodies want to see strategic planning over 12-24 months");
    }
    
    if (assets.some(a => a.status === 'pending' && !a.filingDate)) {
      tips.push("Set target filing dates for pending IP applications - this shows proactive protection strategy");
    }
    
    return tips.slice(0, 8);
  };

  const generateActionPlan = () => {
    return [
      { week: "Week 1", action: "Conduct comprehensive IP audit - identify all protectable assets including inventions, branding, designs, and trade secrets", priority: "Critical" },
      { week: "Week 1", action: "Research UK IPO requirements and compare with international IP offices if planning global expansion", priority: "High" },
      { week: "Week 1-2", action: "Engage IP attorney or patent agent to conduct prior art searches for patent applications", priority: "Critical" },
      { week: "Week 2", action: "Draft detailed descriptions of all IP assets including technical specifications and commercial applications", priority: "Critical" },
      { week: "Week 2", action: "Register trademark applications with UK IPO for company name, logo, and key product names", priority: "High" },
      { week: "Week 2-3", action: "Prepare patent applications for core innovations - include detailed claims and drawings", priority: "Critical" },
      { week: "Week 3", action: "Implement trade secret protection measures - NDAs, employee contracts, access controls", priority: "High" },
      { week: "Week 3", action: "Register design rights for product designs and user interfaces with UK IPO", priority: "Medium" },
      { week: "Week 3-4", action: "File priority patent applications in UK to establish earliest filing date", priority: "Critical" },
      { week: "Week 4", action: "Document IP strategy in business plan showing protection timeline and budget allocation", priority: "Critical" },
      { week: "Week 4", action: "Create IP portfolio summary for endorsing body showing strategic protection of competitive advantages", priority: "Critical" },
      { week: "Ongoing", action: "Monitor competitor IP filings and maintain IP register with renewal dates and costs", priority: "High" },
    ];
  };

  const handleExport = () => {
    const report = `UK INNOVATOR FOUNDER VISA - IP PROTECTION STRATEGY
Generated: ${new Date().toLocaleString('en-GB')}
${'='.repeat(70)}

EXECUTIVE SUMMARY
${'-'.repeat(70)}
Business Sector: ${businessSector || 'Not specified'}
Competitive Advantage: ${competitiveAdvantage || 'Not specified'}
IP Protection Score: ${ipScore}/100
Total IP Assets: ${assets.filter(a => a.name).length}
Total Estimated Cost: £${totalCost.toLocaleString()}
Critical Assets: ${criticalAssets}
High Risk Assets: ${highRiskAssets}
Granted/Registered: ${grantedAssets}

SCORE BREAKDOWN
${'-'.repeat(70)}
${ipScore >= 80 ? 'EXCELLENT - Strong IP portfolio with comprehensive protection strategy' : 
  ipScore >= 60 ? 'GOOD - Solid foundation but room for improvement in coverage' :
  ipScore >= 40 ? 'DEVELOPING - Basic IP awareness but needs strategic development' :
  'INSUFFICIENT - Immediate action required to build credible IP portfolio'}

IP PORTFOLIO SUMMARY
${'-'.repeat(70)}
${assets.filter(a => a.name).map((asset, i) => `
${i + 1}. ${asset.name}
   Type: ${IP_TYPE_LABELS[asset.type]}
   Status: ${asset.status.charAt(0).toUpperCase() + asset.status.slice(1)}
   Priority: ${asset.priority.charAt(0).toUpperCase() + asset.priority.slice(1)}
   Filing Date: ${asset.filingDate || 'Not set'}
   Jurisdiction: ${asset.jurisdiction}
   Estimated Cost: £${asset.estimatedCost.toLocaleString()}
   Risk Level: ${asset.riskLevel.charAt(0).toUpperCase() + asset.riskLevel.slice(1)}
   Notes: ${asset.notes || 'None'}
`).join('')}

IP ASSETS BY TYPE
${'-'.repeat(70)}
${assetsByType.map(item => `${item.name}: ${item.value} asset(s)`).join('\n')}

COST BREAKDOWN BY TYPE
${'-'.repeat(70)}
${costByType.map(item => `${item.type}: £${item.cost.toLocaleString()}`).join('\n')}
Total Budget: £${totalCost.toLocaleString()}

FILING TIMELINE
${'-'.repeat(70)}
${timelineData.length > 0 ? timelineData.map(item => 
  `${item.month}: ${item.name} (${item.type}) - £${item.cost.toLocaleString()}`
).join('\n') : 'No filing dates set - establish timeline for strategic IP protection'}

SMART RECOMMENDATIONS
${'-'.repeat(70)}
${getSmartTips().map((tip, i) => `${i + 1}. ${tip}`).join('\n')}

4-WEEK ACTION PLAN
${'-'.repeat(70)}
${generateActionPlan().map(item => `[${item.priority}] ${item.week}: ${item.action}`).join('\n')}

UK IPO REQUIREMENTS & GUIDANCE
${'-'.repeat(70)}
PATENTS:
- UK patent application fee: £60-£80 (basic filing)
- Professional fees: £3,000-£6,000 for drafting and filing
- Examination and grant fees: £100-£200
- Total typical cost: £4,000-£8,000 per patent
- Timeline: 12-36 months for grant
- Requirement: Novel, inventive, industrial application

TRADEMARKS:
- UK trademark application: £170 (one class) + £50 per additional class
- Professional fees: £500-£1,500
- Total typical cost: £700-£2,000
- Timeline: 4-6 months for registration
- Requirement: Distinctive mark for goods/services

COPYRIGHT:
- Automatic protection (no registration required in UK)
- Optional registration with Copyright Licensing Agency
- Cost: Minimal to free
- Timeline: Immediate upon creation
- Requirement: Original creative work

REGISTERED DESIGNS:
- UK design registration: £50 (first design) + £20 per additional
- Professional fees: £500-£1,500
- Total typical cost: £600-£2,000
- Timeline: 4-8 weeks for registration
- Protection period: Up to 25 years
- Requirement: New and individual character

TRADE SECRETS:
- No registration required
- Protection through confidentiality measures
- Cost: Depends on security implementation
- Requirement: Commercial value, confidentiality, reasonable steps to protect

VISA APPLICATION RELEVANCE
${'-'.repeat(70)}
Endorsing bodies assess:
- Strategic IP protection demonstrating competitive advantage
- Evidence of innovation worthy of protection
- Budget allocation showing commitment to IP
- Timeline showing proactive approach
- International protection strategy if applicable
- IP ownership clarity (founder vs company)

CRITICAL SUCCESS FACTORS
${'-'.repeat(70)}
1. File trademark applications BEFORE visa submission
2. Demonstrate patent-pending status for core innovations
3. Document trade secrets with NDA framework
4. Show IP budget in financial projections
5. Provide IP strategy narrative in business plan
6. Evidence freedom to operate (no infringement risks)

${'='.repeat(70)}
Report generated by UK Innovator Founder Visa Assistant
© 2025 innovatorfoundervisaassistant.co.uk

DISCLAIMER: This report provides strategic guidance only. Consult qualified
IP attorney or patent agent for professional advice on specific IP matters.
`;

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ip-strategy-report-${Date.now()}.txt`;
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
            <h1 className="text-4xl font-bold mb-2" data-testid="heading-ip-strategy">IP Protection Strategy</h1>
            <p className="text-lg text-muted-foreground">Comprehensive intellectual property portfolio planner for UK Innovator Founder visa</p>
            {savedDate && (
              <p className="text-sm text-muted-foreground mt-2">Last saved: {savedDate}</p>
            )}
          </div>

          <ToolUtilityBar
            toolId="ip-strategy"
            onSave={handleSave}
            onRestore={handleRestore}
            onExport={handleExport}
            getSerializedState={getSerializedState}
            toolName="IP Protection Strategy"
          />

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4" data-testid="tabs-ip-strategy">
              <TabsTrigger value="strategy" data-testid="tab-strategy">Strategy</TabsTrigger>
              <TabsTrigger value="analysis" data-testid="tab-analysis">Analysis</TabsTrigger>
              <TabsTrigger value="tips" data-testid="tab-tips">Smart Tips</TabsTrigger>
              <TabsTrigger value="action" data-testid="tab-action">Action Plan</TabsTrigger>
            </TabsList>

            <TabsContent value="strategy" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>IP Protection Status</CardTitle>
                  <CardDescription>Build a comprehensive IP portfolio to strengthen your Innovator Founder visa application</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-4 gap-4">
                    <Card className={ipScore >= 60 ? "border-green-500" : "border-orange-500"}>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">IP Protection Score</p>
                          <p className="text-3xl font-bold" data-testid="text-ip-score">{ipScore}%</p>
                          <Progress value={ipScore} className="mt-2" />
                          <p className="text-xs mt-2">
                            {ipScore >= 80 ? 'Excellent' : ipScore >= 60 ? 'Good' : ipScore >= 40 ? 'Developing' : 'Needs Work'}
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">Total Assets</p>
                          <p className="text-3xl font-bold text-primary" data-testid="text-total-assets">{assets.filter(a => a.name).length}</p>
                          <p className="text-xs mt-2">IP items registered</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">Total Cost</p>
                          <p className="text-3xl font-bold" data-testid="text-total-cost">£{totalCost.toLocaleString()}</p>
                          <p className="text-xs mt-2">Investment in IP</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">Critical Assets</p>
                          <p className="text-3xl font-bold text-orange-600" data-testid="text-critical-assets">{criticalAssets}</p>
                          <p className="text-xs mt-2">High priority items</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {ipScore < 40 && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Your IP portfolio needs significant development. Endorsing bodies expect evidence of strategic IP protection for innovative businesses.
                      </AlertDescription>
                    </Alert>
                  )}

                  {ipScore >= 40 && ipScore < 60 && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        You have a foundation but need to strengthen your IP portfolio. Consider adding more asset types and establishing clear filing timelines.
                      </AlertDescription>
                    </Alert>
                  )}

                  {ipScore >= 60 && (
                    <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-600 dark:text-green-400">
                        Good IP protection strategy! Continue refining your portfolio and ensure all documentation is ready for endorsing body review.
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="business-sector">Business Sector</Label>
                      <Input
                        id="business-sector"
                        value={businessSector}
                        onChange={(e) => setBusinessSector(e.target.value)}
                        placeholder="e.g., HealthTech, FinTech, AI/ML"
                        data-testid="input-business-sector"
                      />
                    </div>
                    <div>
                      <Label htmlFor="competitive-advantage">Core Competitive Advantage</Label>
                      <Input
                        id="competitive-advantage"
                        value={competitiveAdvantage}
                        onChange={(e) => setCompetitiveAdvantage(e.target.value)}
                        placeholder="e.g., Proprietary algorithm, Novel process"
                        data-testid="input-competitive-advantage"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">IP Assets Portfolio</h3>
                      <Button onClick={addAsset} size="sm" data-testid="button-add-asset">
                        Add IP Asset
                      </Button>
                    </div>

                    {assets.map((asset, index) => (
                      <Card key={index} className="p-4">
                        <div className="grid md:grid-cols-3 gap-4 mb-4">
                          <div className="md:col-span-2">
                            <Label htmlFor={`asset-name-${index}`}>Asset Name</Label>
                            <Input
                              id={`asset-name-${index}`}
                              value={asset.name}
                              onChange={(e) => updateAsset(index, 'name', e.target.value)}
                              placeholder="e.g., AI Prediction Algorithm, Brand Logo"
                              data-testid={`input-asset-name-${index}`}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`asset-type-${index}`}>IP Type</Label>
                            <select
                              id={`asset-type-${index}`}
                              value={asset.type}
                              onChange={(e) => updateAsset(index, 'type', e.target.value)}
                              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                              data-testid={`select-asset-type-${index}`}
                            >
                              <option value="patents">Patents</option>
                              <option value="trademarks">Trademarks</option>
                              <option value="copyright">Copyright</option>
                              <option value="trade-secrets">Trade Secrets</option>
                              <option value="designs">Designs</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <Label htmlFor={`asset-filing-date-${index}`}>Filing Date</Label>
                            <Input
                              id={`asset-filing-date-${index}`}
                              type="date"
                              value={asset.filingDate}
                              onChange={(e) => updateAsset(index, 'filingDate', e.target.value)}
                              data-testid={`input-filing-date-${index}`}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`asset-cost-${index}`}>Estimated Cost (£)</Label>
                            <Input
                              id={`asset-cost-${index}`}
                              type="number"
                              value={asset.estimatedCost || ''}
                              onChange={(e) => updateAsset(index, 'estimatedCost', parseFloat(e.target.value) || 0)}
                              placeholder="0"
                              data-testid={`input-cost-${index}`}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`asset-priority-${index}`}>Priority</Label>
                            <select
                              id={`asset-priority-${index}`}
                              value={asset.priority}
                              onChange={(e) => updateAsset(index, 'priority', e.target.value)}
                              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                              data-testid={`select-priority-${index}`}
                            >
                              <option value="critical">Critical</option>
                              <option value="high">High</option>
                              <option value="medium">Medium</option>
                              <option value="low">Low</option>
                            </select>
                          </div>
                          <div>
                            <Label htmlFor={`asset-status-${index}`}>Status</Label>
                            <select
                              id={`asset-status-${index}`}
                              value={asset.status}
                              onChange={(e) => updateAsset(index, 'status', e.target.value)}
                              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                              data-testid={`select-status-${index}`}
                            >
                              <option value="pending">Pending</option>
                              <option value="filed">Filed</option>
                              <option value="granted">Granted/Registered</option>
                              <option value="rejected">Rejected</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-3 gap-4 mb-4">
                          <div>
                            <Label htmlFor={`asset-jurisdiction-${index}`}>Jurisdiction</Label>
                            <select
                              id={`asset-jurisdiction-${index}`}
                              value={asset.jurisdiction}
                              onChange={(e) => updateAsset(index, 'jurisdiction', e.target.value)}
                              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                              data-testid={`select-jurisdiction-${index}`}
                            >
                              <option value="UK">UK</option>
                              <option value="EU">European Union</option>
                              <option value="US">United States</option>
                              <option value="International">International (PCT)</option>
                              <option value="Other">Other</option>
                            </select>
                          </div>
                          <div>
                            <Label htmlFor={`asset-risk-${index}`}>Risk Level</Label>
                            <select
                              id={`asset-risk-${index}`}
                              value={asset.riskLevel}
                              onChange={(e) => updateAsset(index, 'riskLevel', e.target.value)}
                              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                              data-testid={`select-risk-${index}`}
                            >
                              <option value="low">Low</option>
                              <option value="medium">Medium</option>
                              <option value="high">High</option>
                            </select>
                          </div>
                          <div className="flex items-end">
                            {assets.length > 1 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeAsset(index)}
                                data-testid={`button-remove-asset-${index}`}
                              >
                                Remove Asset
                              </Button>
                            )}
                          </div>
                        </div>

                        <div>
                          <Label htmlFor={`asset-notes-${index}`}>Notes / Description</Label>
                          <Input
                            id={`asset-notes-${index}`}
                            value={asset.notes}
                            onChange={(e) => updateAsset(index, 'notes', e.target.value)}
                            placeholder="Brief description of the IP asset and its strategic importance"
                            data-testid={`input-notes-${index}`}
                          />
                        </div>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analysis" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>IP Portfolio Composition</CardTitle>
                    <CardDescription>Distribution of IP assets by type</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {assetsByType.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={assetsByType}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            label={(entry) => `${entry.name}: ${entry.value}`}
                          >
                            {assetsByType.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-center text-muted-foreground py-12">Add IP assets to see portfolio distribution</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Cost Analysis by Type</CardTitle>
                    <CardDescription>Investment allocation across IP categories</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {costByType.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={costByType}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="type" />
                          <YAxis />
                          <Tooltip formatter={(value: number) => `£${value.toLocaleString()}`} />
                          <Bar dataKey="cost" fill="#3b82f6" />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-center text-muted-foreground py-12">Add costs to see investment breakdown</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Filing Timeline</CardTitle>
                  <CardDescription>Planned IP protection milestones over next 12 months</CardDescription>
                </CardHeader>
                <CardContent>
                  {timelineData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={timelineData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip 
                          formatter={(value: number) => `£${value.toLocaleString()}`}
                          labelFormatter={(label) => `Month: ${label}`}
                        />
                        <Legend />
                        <Bar dataKey="cost" fill="#10b981" name="Filing Cost" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-center text-muted-foreground py-12">Add filing dates to visualize your IP protection timeline</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>UK IPO Filing Costs Reference</CardTitle>
                  <CardDescription>Typical costs for IP protection in the UK (including professional fees)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <Shield className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium">Patents</p>
                          <p className="text-sm text-muted-foreground">£4,000 - £8,000 per patent</p>
                          <p className="text-xs text-muted-foreground mt-1">Filing, search, examination, and professional fees</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <FileText className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium">Trademarks</p>
                          <p className="text-sm text-muted-foreground">£700 - £2,000 per mark</p>
                          <p className="text-xs text-muted-foreground mt-1">One class + professional services</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Palette className="h-5 w-5 text-pink-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium">Registered Designs</p>
                          <p className="text-sm text-muted-foreground">£600 - £2,000 per design</p>
                          <p className="text-xs text-muted-foreground mt-1">Registration and professional fees</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <Copyright className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium">Copyright</p>
                          <p className="text-sm text-muted-foreground">Free (automatic protection)</p>
                          <p className="text-xs text-muted-foreground mt-1">No registration required in UK</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Lock className="h-5 w-5 text-purple-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium">Trade Secrets</p>
                          <p className="text-sm text-muted-foreground">Variable (protection costs)</p>
                          <p className="text-xs text-muted-foreground mt-1">NDAs, security measures, legal frameworks</p>
                        </div>
                      </div>
                      <div className="mt-4 p-3 bg-accent/10 rounded-lg">
                        <p className="text-sm font-medium">International Protection</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          PCT patent applications: £5,000-£15,000+ depending on countries
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tips" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Smart IP Strategy Recommendations
                  </CardTitle>
                  <CardDescription>Context-aware guidance based on your IP portfolio and visa requirements</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {getSmartTips().map((tip, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-accent/10 rounded-lg" data-testid={`tip-${index}`}>
                        <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-medium">
                          {index + 1}
                        </div>
                        <p className="text-sm flex-1">{tip}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>IP Strategy Best Practices for Innovator Founder Visa</CardTitle>
                  <CardDescription>Key considerations for endorsing body assessment</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Strategic Alignment</p>
                        <p className="text-sm text-muted-foreground">IP portfolio must align with business innovation claims and competitive advantages described in business plan</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Early Filing Priority</p>
                        <p className="text-sm text-muted-foreground">File trademark and design applications before visa submission - shows proactive protection and commitment</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Patent-Pending Status</p>
                        <p className="text-sm text-muted-foreground">For tech innovations, demonstrate patent applications are filed or planned with specific timelines</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Budget Integration</p>
                        <p className="text-sm text-muted-foreground">Include IP costs in financial projections - shows understanding of IP value and resource allocation</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Freedom to Operate</p>
                        <p className="text-sm text-muted-foreground">Conduct prior art searches and competitor IP analysis to demonstrate no infringement risks</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Ownership Clarity</p>
                        <p className="text-sm text-muted-foreground">Ensure IP ownership is properly assigned to company with founder agreements documented</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="action" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>4-Week IP Protection Action Plan</CardTitle>
                  <CardDescription>Prioritized roadmap to build credible IP portfolio for endorsing body assessment</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {generateActionPlan().map((item, index) => (
                      <div key={index} className="flex items-start gap-3 p-4 border rounded-lg" data-testid={`action-${index}`}>
                        <div className="flex-shrink-0">
                          <div className={`px-2 py-1 rounded text-xs font-medium ${
                            item.priority === 'Critical' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                            item.priority === 'High' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                            'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                          }`}>
                            {item.priority}
                          </div>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm mb-1">{item.week}</p>
                          <p className="text-sm text-muted-foreground">{item.action}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>IP Documentation Checklist for Visa Application</CardTitle>
                  <CardDescription>Essential evidence to include with endorsing body submission</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-accent/10 rounded-lg">
                      <input type="checkbox" className="h-4 w-4" data-testid="checkbox-evidence-1" />
                      <span className="text-sm">Trademark registration certificates or application receipts from UK IPO</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-accent/10 rounded-lg">
                      <input type="checkbox" className="h-4 w-4" data-testid="checkbox-evidence-2" />
                      <span className="text-sm">Patent application filing receipts showing pending status</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-accent/10 rounded-lg">
                      <input type="checkbox" className="h-4 w-4" data-testid="checkbox-evidence-3" />
                      <span className="text-sm">Registered design certificates from UK IPO</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-accent/10 rounded-lg">
                      <input type="checkbox" className="h-4 w-4" data-testid="checkbox-evidence-4" />
                      <span className="text-sm">IP assignment agreements showing company ownership of founder inventions</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-accent/10 rounded-lg">
                      <input type="checkbox" className="h-4 w-4" data-testid="checkbox-evidence-5" />
                      <span className="text-sm">NDA templates and confidentiality agreements for trade secret protection</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-accent/10 rounded-lg">
                      <input type="checkbox" className="h-4 w-4" data-testid="checkbox-evidence-6" />
                      <span className="text-sm">Prior art search reports demonstrating novelty and freedom to operate</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-accent/10 rounded-lg">
                      <input type="checkbox" className="h-4 w-4" data-testid="checkbox-evidence-7" />
                      <span className="text-sm">IP portfolio summary document integrated into business plan narrative</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-accent/10 rounded-lg">
                      <input type="checkbox" className="h-4 w-4" data-testid="checkbox-evidence-8" />
                      <span className="text-sm">IP budget allocation in financial projections showing ongoing protection costs</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-accent/10 rounded-lg">
                      <input type="checkbox" className="h-4 w-4" data-testid="checkbox-evidence-9" />
                      <span className="text-sm">Letters from IP attorneys confirming IP strategy and ongoing representation</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-accent/10 rounded-lg">
                      <input type="checkbox" className="h-4 w-4" data-testid="checkbox-evidence-10" />
                      <span className="text-sm">Evidence of international IP filings if claiming global scalability</span>
                    </div>
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
