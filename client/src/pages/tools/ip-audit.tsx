import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AiToolGuide, AiTraditionalToggle, type ToolConfig } from "@/components/AiToolGuide";
import { useTierAccess } from "@/hooks/useTierAccess";

import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, XCircle, AlertTriangle, Shield, FileText, Copyright, Lock, Palette, Eye } from "lucide-react";
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

type IPType = 'patents' | 'trademarks' | 'copyright' | 'trade-secrets' | 'designs';
type ProtectionStrength = 'strong' | 'moderate' | 'weak' | 'none';
type OwnershipClarity = 'clear' | 'shared' | 'unclear' | 'disputed';
type DocumentationStatus = 'complete' | 'partial' | 'missing';

type IPAsset = {
  name: string;
  type: IPType;
  description: string;
  protectionStrength: ProtectionStrength;
  ownershipClarity: OwnershipClarity;
  documentationStatus: DocumentationStatus;
  registrationNumber: string;
  registrationDate: string;
  expiryDate: string;
  jurisdiction: string;
  valuationEstimate: number;
  competitiveAdvantage: string;
  hasLicenses: boolean;
  hasDefensivePriorArt: boolean;
  notes: string;
};

const IP_TYPE_LABELS: Record<IPType, string> = {
  'patents': 'Patents',
  'trademarks': 'Trademarks',
  'copyright': 'Copyright',
  'trade-secrets': 'Trade Secrets',
  'designs': 'Registered Designs',
};

const IP_TYPE_COLORS: Record<IPType, string> = {
  'patents': '#3b82f6',
  'trademarks': '#10b981',
  'copyright': '#f59e0b',
  'trade-secrets': '#8b5cf6',
  'designs': '#ec4899',
};

const PROTECTION_STRENGTH_COLORS: Record<ProtectionStrength, string> = {
  'strong': '#10b981',
  'moderate': '#f59e0b',
  'weak': '#ef4444',
  'none': '#6b7280',
};

const AI_TOOL_CONFIG: ToolConfig = {
  toolId: 'ip-audit',
  toolName: 'IP Portfolio Audit',
  agent: 'nova',
  greeting: "Hi! I'm Nova, your Innovation Specialist. I'll help you audit your intellectual property portfolio to identify strengths, gaps, and opportunities. A strong IP position is critical for visa endorsement!",
  questions: [
    {
      id: 'business-context',
      question: "What's your business name and industry sector?",
      hint: "This helps contextualize your IP needs against industry standards",
      fieldKey: 'businessContext',
      minLength: 20
    },
    {
      id: 'core-innovation',
      question: "What are your core innovations that give you competitive advantage?",
      hint: "Describe the key technology, processes, or methods that differentiate your business",
      fieldKey: 'coreInnovation',
      minLength: 80
    },
    {
      id: 'existing-ip',
      question: "What intellectual property do you currently have? (Patents, trademarks, copyrights, trade secrets, designs)",
      hint: "List each type with status: pending, filed, granted, or informal protection",
      fieldKey: 'existingIP',
      minLength: 60
    },
    {
      id: 'ip-ownership',
      question: "Who owns your IP assets? Are there any shared ownership or assignment issues?",
      hint: "Clear ownership is crucial - include any agreements with co-founders, contractors, or employers",
      fieldKey: 'ipOwnership',
      minLength: 50
    },
    {
      id: 'ip-documentation',
      question: "What documentation do you have for your IP? (Registration certificates, assignment agreements, inventor declarations)",
      hint: "Endorsing bodies will want to verify IP claims - complete documentation is essential",
      fieldKey: 'ipDocumentation',
      minLength: 50
    },
    {
      id: 'ip-gaps',
      question: "What IP protection gaps or vulnerabilities concern you most?",
      hint: "E.g., unprotected brand, patentable innovations not filed, weak trade secret policies",
      fieldKey: 'ipGaps',
      minLength: 40
    }
  ],
  completionMessage: "Your IP landscape is mapped! Add each asset to the Audit tab with detailed information to get a comprehensive IP score and gap analysis."
};

export default function IPAudit() {
  const [assets, setAssets] = useState<IPAsset[]>([
    {
      name: '',
      type: 'patents',
      description: '',
      protectionStrength: 'moderate',
      ownershipClarity: 'clear',
      documentationStatus: 'partial',
      registrationNumber: '',
      registrationDate: '',
      expiryDate: '',
      jurisdiction: 'UK',
      valuationEstimate: 0,
      competitiveAdvantage: '',
      hasLicenses: false,
      hasDefensivePriorArt: false,
      notes: ''
    }
  ]);
  const [activeTab, setActiveTab] = useState('audit');
  const [savedDate, setSavedDate] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [industrySector, setIndustrySector] = useState('');
  const { userTier } = useTierAccess();
  
  // Free users default to traditional mode, paid users can use AI mode
  const isPaidUser = userTier !== 'free';
  const [mode, setMode] = useState<'ai' | 'traditional'>(() => {
    const saved = localStorage.getItem('ip-audit-mode');
    // Free users always start in traditional mode
    return (saved === 'ai' && isPaidUser) ? 'ai' : 'traditional';
  });

  // Force traditional mode for free users and clear localStorage
  useEffect(() => {
    if (!isPaidUser && mode === 'ai') {
      setMode('traditional');
      localStorage.setItem('ip-audit-mode', 'traditional');
    }
  }, [isPaidUser, mode]);

  useEffect(() => {
    localStorage.setItem('ip-audit-mode', mode);
  }, [mode]);

  const handleAiComplete = (answers: Record<string, any>) => {
    if (answers.businessContext) {
      const parts = answers.businessContext.split(',');
      setBusinessName(parts[0]?.trim() || '');
      setIndustrySector(parts[1]?.trim() || '');
    }
    setMode('traditional');
    setActiveTab('audit');
  };

  const addAsset = () => {
    setAssets([...assets, {
      name: '',
      type: 'patents',
      description: '',
      protectionStrength: 'moderate',
      ownershipClarity: 'clear',
      documentationStatus: 'partial',
      registrationNumber: '',
      registrationDate: '',
      expiryDate: '',
      jurisdiction: 'UK',
      valuationEstimate: 0,
      competitiveAdvantage: '',
      hasLicenses: false,
      hasDefensivePriorArt: false,
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

  const calculateIPScore = () => {
    let score = 0;
    const validAssets = assets.filter(a => a.name);
    
    if (validAssets.length === 0) return 0;
    
    if (validAssets.length >= 1) score += 10;
    if (validAssets.length >= 3) score += 10;
    if (validAssets.length >= 5) score += 10;
    
    const hasPatents = validAssets.some(a => a.type === 'patents');
    const hasTrademarks = validAssets.some(a => a.type === 'trademarks');
    const hasCopyright = validAssets.some(a => a.type === 'copyright');
    const hasTradeSecrets = validAssets.some(a => a.type === 'trade-secrets');
    const hasDesigns = validAssets.some(a => a.type === 'designs');
    
    if (hasPatents) score += 15;
    if (hasTrademarks) score += 15;
    if (hasCopyright) score += 5;
    if (hasTradeSecrets) score += 5;
    if (hasDesigns) score += 10;
    
    const strongProtection = validAssets.filter(a => a.protectionStrength === 'strong').length;
    score += Math.min(15, strongProtection * 5);
    
    const clearOwnership = validAssets.filter(a => a.ownershipClarity === 'clear').length;
    score += Math.min(10, clearOwnership * 2);
    
    const completeDocumentation = validAssets.filter(a => a.documentationStatus === 'complete').length;
    score += Math.min(10, completeDocumentation * 2);
    
    return Math.min(100, score);
  };

  const ipScore = calculateIPScore();
  const validAssets = assets.filter(a => a.name);
  const strongProtectionCount = validAssets.filter(a => a.protectionStrength === 'strong').length;
  const clearOwnershipCount = validAssets.filter(a => a.ownershipClarity === 'clear').length;
  const completeDocsCount = validAssets.filter(a => a.documentationStatus === 'complete').length;
  const totalValuation = validAssets.reduce((sum, a) => sum + (a.valuationEstimate || 0), 0);

  const identifiedGaps = () => {
    const gaps = [];
    const hasPatents = validAssets.some(a => a.type === 'patents');
    const hasTrademarks = validAssets.some(a => a.type === 'trademarks');
    const hasCopyright = validAssets.some(a => a.type === 'copyright');
    const hasTradeSecrets = validAssets.some(a => a.type === 'trade-secrets');
    const hasDesigns = validAssets.some(a => a.type === 'designs');
    
    if (!hasPatents) gaps.push({ type: 'Patents', severity: 'high', description: 'No patent protection identified - consider patenting core innovations' });
    if (!hasTrademarks) gaps.push({ type: 'Trademarks', severity: 'critical', description: 'No trademark protection - brand identity is vulnerable' });
    if (!hasCopyright) gaps.push({ type: 'Copyright', severity: 'medium', description: 'No copyright documentation - consider registering creative works' });
    if (!hasTradeSecrets) gaps.push({ type: 'Trade Secrets', severity: 'medium', description: 'No documented trade secrets - identify and protect confidential information' });
    if (!hasDesigns) gaps.push({ type: 'Designs', severity: 'low', description: 'No registered designs - consider design protection for product appearance' });
    
    const weakProtection = validAssets.filter(a => a.protectionStrength === 'weak' || a.protectionStrength === 'none');
    if (weakProtection.length > 0) {
      gaps.push({ type: 'Weak Protection', severity: 'high', description: `${weakProtection.length} asset(s) have weak or no protection` });
    }
    
    const unclearOwnership = validAssets.filter(a => a.ownershipClarity !== 'clear');
    if (unclearOwnership.length > 0) {
      gaps.push({ type: 'Ownership Issues', severity: 'critical', description: `${unclearOwnership.length} asset(s) have unclear ownership` });
    }
    
    const missingDocs = validAssets.filter(a => a.documentationStatus === 'missing');
    if (missingDocs.length > 0) {
      gaps.push({ type: 'Missing Documentation', severity: 'high', description: `${missingDocs.length} asset(s) lack proper documentation` });
    }
    
    return gaps;
  };

  const assetsByType = [
    { name: 'Patents', value: validAssets.filter(a => a.type === 'patents').length, color: IP_TYPE_COLORS['patents'] },
    { name: 'Trademarks', value: validAssets.filter(a => a.type === 'trademarks').length, color: IP_TYPE_COLORS['trademarks'] },
    { name: 'Copyright', value: validAssets.filter(a => a.type === 'copyright').length, color: IP_TYPE_COLORS['copyright'] },
    { name: 'Trade Secrets', value: validAssets.filter(a => a.type === 'trade-secrets').length, color: IP_TYPE_COLORS['trade-secrets'] },
    { name: 'Designs', value: validAssets.filter(a => a.type === 'designs').length, color: IP_TYPE_COLORS['designs'] },
  ].filter(item => item.value > 0);

  const protectionStrengthData = [
    { strength: 'Strong', count: validAssets.filter(a => a.protectionStrength === 'strong').length, color: PROTECTION_STRENGTH_COLORS['strong'] },
    { strength: 'Moderate', count: validAssets.filter(a => a.protectionStrength === 'moderate').length, color: PROTECTION_STRENGTH_COLORS['moderate'] },
    { strength: 'Weak', count: validAssets.filter(a => a.protectionStrength === 'weak').length, color: PROTECTION_STRENGTH_COLORS['weak'] },
    { strength: 'None', count: validAssets.filter(a => a.protectionStrength === 'none').length, color: PROTECTION_STRENGTH_COLORS['none'] },
  ].filter(item => item.count > 0);

  const ownershipClarityData = [
    { clarity: 'Clear', count: validAssets.filter(a => a.ownershipClarity === 'clear').length },
    { clarity: 'Shared', count: validAssets.filter(a => a.ownershipClarity === 'shared').length },
    { clarity: 'Unclear', count: validAssets.filter(a => a.ownershipClarity === 'unclear').length },
    { clarity: 'Disputed', count: validAssets.filter(a => a.ownershipClarity === 'disputed').length },
  ].filter(item => item.count > 0);

  const documentationStatusData = [
    { status: 'Complete', count: validAssets.filter(a => a.documentationStatus === 'complete').length },
    { status: 'Partial', count: validAssets.filter(a => a.documentationStatus === 'partial').length },
    { status: 'Missing', count: validAssets.filter(a => a.documentationStatus === 'missing').length },
  ].filter(item => item.count > 0);

  const getSerializedState = () => {
    return {
      assets,
      activeTab,
      businessName,
      industrySector,
      savedDate: new Date().toLocaleString('en-GB')
    };
  };

  const restoreSerializedState = (state: any) => {
    if ('assets' in state) setAssets(state.assets);
    if ('activeTab' in state) setActiveTab(state.activeTab);
    if ('businessName' in state) setBusinessName(state.businessName);
    if ('industrySector' in state) setIndustrySector(state.industrySector);
    if ('savedDate' in state) setSavedDate(state.savedDate || '');
  };

  useEffect(() => {
    const saved = localStorage.getItem('ip-audit-state');
    if (saved) {
      const state = JSON.parse(saved);
      restoreSerializedState(state);
    }
  }, []);

  const handleSave = () => {
    const state = getSerializedState();
    localStorage.setItem('ip-audit-state', JSON.stringify(state));
    setSavedDate(state.savedDate);
  };

  const handleRestore = () => {
    const saved = localStorage.getItem('ip-audit-state');
    if (saved) {
      const state = JSON.parse(saved);
      restoreSerializedState(state);
    }
  };

  const getSmartTips = () => {
    const tips = [];
    
    if (validAssets.length === 0) {
      tips.push("Start by documenting all existing IP assets - even informal protections like trade secrets and unregistered designs have value");
    }
    
    if (!validAssets.some(a => a.type === 'trademarks')) {
      tips.push("Trademark protection is essential for UK Innovator Founder visa - register your business name and logo with UK IPO immediately");
    }
    
    if (!validAssets.some(a => a.type === 'patents')) {
      tips.push("Patent protection demonstrates innovation credibility - file provisional patents for core inventions before visa application");
    }
    
    if (validAssets.some(a => a.ownershipClarity !== 'clear')) {
      tips.push("Unclear IP ownership is a major red flag for endorsing bodies - execute IP assignment agreements with all founders and employees");
    }
    
    if (validAssets.some(a => a.documentationStatus === 'missing')) {
      tips.push("Missing documentation undermines IP value - create comprehensive IP register with registration certificates, licensing agreements, and prior art searches");
    }
    
    if (strongProtectionCount < validAssets.length / 2) {
      tips.push("Strengthen IP protection by filing formal registrations - strong protection signals serious business commitment to visa assessors");
    }
    
    if (!validAssets.some(a => a.hasDefensivePriorArt)) {
      tips.push("Conduct prior art searches for all patent applications - this demonstrates due diligence and reduces infringement risk");
    }
    
    if (totalValuation === 0) {
      tips.push("IP valuation strengthens visa application - obtain professional IP valuation report showing economic value of your portfolio");
    }
    
    if (validAssets.length < 3) {
      tips.push("Build comprehensive IP portfolio with multiple asset types - diversity demonstrates systematic innovation approach");
    }
    
    if (!validAssets.some(a => a.type === 'trade-secrets')) {
      tips.push("Document trade secrets and confidential processes - these are valuable IP assets that complement registered rights");
    }
    
    return tips.slice(0, 8);
  };

  const generateActionPlan = () => {
    return [
      { week: "Week 1", action: "Conduct comprehensive IP asset discovery - identify all patents, trademarks, copyrights, trade secrets, and designs", priority: "Critical" },
      { week: "Week 1", action: "Create detailed IP register spreadsheet documenting all assets with registration numbers, dates, and jurisdictions", priority: "Critical" },
      { week: "Week 1-2", action: "Assess ownership clarity for each asset - review employment contracts, founder agreements, and assignment documents", priority: "Critical" },
      { week: "Week 2", action: "Execute IP assignment agreements transferring all founder-created IP to company", priority: "Critical" },
      { week: "Week 2", action: "File trademark applications for business name, logo, and key product names with UK IPO", priority: "Critical" },
      { week: "Week 2-3", action: "Conduct prior art searches for patentable inventions and assess freedom to operate", priority: "High" },
      { week: "Week 3", action: "Prepare provisional patent applications for core innovations to establish priority dates", priority: "Critical" },
      { week: "Week 3", action: "Document trade secrets with confidentiality procedures, employee NDAs, and access controls", priority: "High" },
      { week: "Week 3-4", action: "Gather all IP documentation - registration certificates, filing receipts, licensing agreements, assignment deeds", priority: "Critical" },
      { week: "Week 4", action: "Obtain professional IP valuation report from qualified IP valuation specialist", priority: "High" },
      { week: "Week 4", action: "Create IP protection strategy document for inclusion in visa business plan", priority: "Critical" },
      { week: "Week 4", action: "Review IP portfolio completeness with immigration specialist to ensure visa compliance", priority: "High" },
      { week: "Ongoing", action: "Monitor competitor IP filings and maintain IP register with renewal deadlines", priority: "Medium" },
    ];
  };

  const handleExport = () => {
    const gaps = identifiedGaps();
    const report = `UK INNOVATOR FOUNDER VISA - IP PORTFOLIO AUDIT REPORT
Generated: ${new Date().toLocaleString('en-GB')}
${'='.repeat(70)}

EXECUTIVE SUMMARY
${'-'.repeat(70)}
Business Name: ${businessName || 'Not specified'}
Industry Sector: ${industrySector || 'Not specified'}
IP Portfolio Strength Score: ${ipScore}/100
Total IP Assets: ${validAssets.length}
Total Portfolio Valuation: £${totalValuation.toLocaleString()}

PORTFOLIO HEALTH INDICATORS
${'-'.repeat(70)}
Strong Protection: ${strongProtectionCount} asset(s)
Clear Ownership: ${clearOwnershipCount} asset(s)
Complete Documentation: ${completeDocsCount} asset(s)

SCORE ASSESSMENT
${'-'.repeat(70)}
${ipScore >= 80 ? 'EXCELLENT - Comprehensive IP portfolio with strong protection and clear documentation' : 
  ipScore >= 60 ? 'GOOD - Solid IP foundation but opportunities for strengthening protection' :
  ipScore >= 40 ? 'DEVELOPING - Basic IP awareness but requires strategic development' :
  'INSUFFICIENT - Immediate action required to build credible IP portfolio for visa application'}

IP ASSETS INVENTORY
${'-'.repeat(70)}
${validAssets.length > 0 ? validAssets.map((asset, i) => `
${i + 1}. ${asset.name}
   Type: ${IP_TYPE_LABELS[asset.type]}
   Description: ${asset.description || 'Not provided'}
   Protection Strength: ${asset.protectionStrength.charAt(0).toUpperCase() + asset.protectionStrength.slice(1)}
   Ownership Clarity: ${asset.ownershipClarity.charAt(0).toUpperCase() + asset.ownershipClarity.slice(1)}
   Documentation Status: ${asset.documentationStatus.charAt(0).toUpperCase() + asset.documentationStatus.slice(1)}
   Registration Number: ${asset.registrationNumber || 'Not registered'}
   Registration Date: ${asset.registrationDate || 'Not registered'}
   Expiry Date: ${asset.expiryDate || 'N/A'}
   Jurisdiction: ${asset.jurisdiction}
   Estimated Valuation: £${asset.valuationEstimate.toLocaleString()}
   Competitive Advantage: ${asset.competitiveAdvantage || 'Not specified'}
   Licensed: ${asset.hasLicenses ? 'Yes' : 'No'}
   Prior Art Search: ${asset.hasDefensivePriorArt ? 'Completed' : 'Not completed'}
   Notes: ${asset.notes || 'None'}
`).join('') : 'No IP assets documented - immediate action required'}

PORTFOLIO DISTRIBUTION
${'-'.repeat(70)}
${assetsByType.length > 0 ? assetsByType.map(item => `${item.name}: ${item.value} asset(s)`).join('\n') : 'No assets documented'}

PROTECTION STRENGTH ANALYSIS
${'-'.repeat(70)}
${protectionStrengthData.length > 0 ? protectionStrengthData.map(item => `${item.strength}: ${item.count} asset(s)`).join('\n') : 'No protection assessment available'}

OWNERSHIP CLARITY ANALYSIS
${'-'.repeat(70)}
${ownershipClarityData.length > 0 ? ownershipClarityData.map(item => `${item.clarity}: ${item.count} asset(s)`).join('\n') : 'No ownership assessment available'}

DOCUMENTATION STATUS
${'-'.repeat(70)}
${documentationStatusData.length > 0 ? documentationStatusData.map(item => `${item.status}: ${item.count} asset(s)`).join('\n') : 'No documentation assessment available'}

IDENTIFIED GAPS & VULNERABILITIES
${'-'.repeat(70)}
${gaps.length > 0 ? gaps.map((gap, i) => `
[${gap.severity.toUpperCase()}] ${gap.type}
${gap.description}
`).join('') : 'No critical gaps identified - strong IP portfolio'}

SMART RECOMMENDATIONS
${'-'.repeat(70)}
${getSmartTips().map((tip, i) => `${i + 1}. ${tip}`).join('\n')}

4-WEEK ACTION PLAN
${'-'.repeat(70)}
${generateActionPlan().map(item => `[${item.priority}] ${item.week}: ${item.action}`).join('\n')}

UK IP PROTECTION REQUIREMENTS FOR VISA
${'-'.repeat(70)}
PATENTS:
- Demonstrates technical innovation and R&D capability
- File provisional patents to establish priority dates
- Budget £4,000-£8,000 per patent including professional fees
- Prior art search essential to demonstrate freedom to operate
- Patent-pending status acceptable for visa application

TRADEMARKS:
- Essential for brand protection and business credibility
- UK trademark registration: £170-£270 (1-2 classes)
- EU trademark registration: £850 (covers all EU member states)
- File before visa submission to show established brand
- Registered trademark demonstrates commitment to UK market

COPYRIGHT:
- Automatic protection for original creative works
- No registration required in UK but document creation dates
- Valuable for software code, written materials, designs
- Copyright assignment agreements critical for clarity

TRADE SECRETS:
- Document confidential business information and processes
- Implement confidentiality measures and employee NDAs
- Trade secret protection demonstrates competitive moat
- No registration required but must prove reasonable protection steps

REGISTERED DESIGNS:
- Protects product appearance and aesthetic features
- UK design registration: £50 for first design
- Protection period up to 25 years with renewals
- Important for consumer products and distinctive designs

OWNERSHIP REQUIREMENTS
${'-'.repeat(70)}
- All IP must be clearly owned by UK company (not individual founders)
- Execute IP assignment deeds transferring founder IP to company
- Employee IP assignment clauses in all employment contracts
- Consultant IP assignment clauses in all contractor agreements
- Clear chain of title essential for visa endorsement

DOCUMENTATION REQUIREMENTS
${'-'.repeat(70)}
- IP register listing all assets with registration details
- Registration certificates and filing receipts
- IP assignment agreements and deeds
- Licensing agreements if applicable
- Prior art search reports for patent applications
- IP valuation reports from qualified specialists
- Trade secret protection procedures and policies

VISA APPLICATION IMPACT
${'-'.repeat(70)}
Endorsing bodies assess:
- Strategic IP protection demonstrating innovation
- IP ownership clarity and documentation completeness
- IP value and competitive advantage
- Evidence of freedom to operate (no infringement risks)
- Budget allocation for IP protection and maintenance
- International IP strategy if planning global expansion

CRITICAL SUCCESS FACTORS
${'-'.repeat(70)}
1. File trademark applications before visa submission
2. Establish patent-pending status for core innovations
3. Execute IP assignment agreements with all contributors
4. Create comprehensive IP register with complete documentation
5. Obtain professional IP valuation report
6. Document trade secret protection procedures
7. Conduct freedom to operate analysis
8. Include IP strategy in business plan narrative

${'='.repeat(70)}
Report generated by UK Innovator Founder Visa Assistant
© 2025 innovatorfoundervisaassistant.co.uk

DISCLAIMER: This report provides IP audit guidance only. Consult qualified
IP attorney or patent agent for professional advice on IP protection strategy.
`;

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ip-audit-report-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const gaps = identifiedGaps();

  return (
    <>
      
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        <div className="max-w-7xl mx-auto">
          
          
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2" data-testid="heading-ip-audit">IP Portfolio Audit</h1>
            <p className="text-lg text-muted-foreground">Comprehensive intellectual property assessment for UK Innovator Founder visa</p>
            {savedDate && (
              <p className="text-sm text-muted-foreground mt-2">Last saved: {savedDate}</p>
            )}
          </div>

          <ToolUtilityBar
            toolId="ip-audit"
            onSave={handleSave}
            onRestore={handleRestore}
            onExport={handleExport}
            getSerializedState={getSerializedState}
            toolName="IP Portfolio Audit"
          />

          <div className="mb-6">
            <AiTraditionalToggle mode={mode} onModeChange={setMode} userTier={userTier} />
          </div>

          {mode === 'ai' ? (
            <AiToolGuide 
              config={AI_TOOL_CONFIG} 
              onComplete={handleAiComplete}
              onSwitchToTraditional={() => setMode('traditional')}
              userTier={userTier}
            />
          ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4" data-testid="tabs-ip-audit">
              <TabsTrigger value="audit" data-testid="tab-audit">Audit</TabsTrigger>
              <TabsTrigger value="analysis" data-testid="tab-analysis">Analysis</TabsTrigger>
              <TabsTrigger value="tips" data-testid="tab-tips">Smart Tips</TabsTrigger>
              <TabsTrigger value="action" data-testid="tab-action">Action Plan</TabsTrigger>
            </TabsList>

            <TabsContent value="audit" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>IP Portfolio Status</CardTitle>
                  <CardDescription>Assess your IP assets, identify gaps, and evaluate protection strength</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-4 gap-4">
                    <Card className={ipScore >= 60 ? "border-green-500" : ipScore >= 40 ? "border-orange-500" : "border-destructive"}>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">Portfolio Strength</p>
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
                          <p className="text-3xl font-bold text-primary" data-testid="text-total-assets">{validAssets.length}</p>
                          <p className="text-xs mt-2">IP items documented</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">Strong Protection</p>
                          <p className="text-3xl font-bold text-green-600" data-testid="text-strong-protection">{strongProtectionCount}</p>
                          <p className="text-xs mt-2">Well-protected assets</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">Portfolio Value</p>
                          <p className="text-3xl font-bold" data-testid="text-portfolio-value">£{totalValuation.toLocaleString()}</p>
                          <p className="text-xs mt-2">Estimated valuation</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {ipScore < 40 && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Your IP portfolio requires significant development. Endorsing bodies expect evidence of strategic IP protection for innovative businesses.
                      </AlertDescription>
                    </Alert>
                  )}

                  {ipScore >= 40 && ipScore < 60 && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        You have a foundation but need to strengthen your IP portfolio. Focus on formal registrations and complete documentation.
                      </AlertDescription>
                    </Alert>
                  )}

                  {ipScore >= 60 && (
                    <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-600 dark:text-green-400">
                        Good IP protection! Continue refining your portfolio and ensure all documentation is ready for endorsing body review.
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="business-name">Business Name</Label>
                      <Input
                        id="business-name"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        placeholder="Enter business name"
                        data-testid="input-business-name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="industry-sector">Industry Sector</Label>
                      <Input
                        id="industry-sector"
                        value={industrySector}
                        onChange={(e) => setIndustrySector(e.target.value)}
                        placeholder="e.g., HealthTech, FinTech, AI/ML"
                        data-testid="input-industry-sector"
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
                        <div className="space-y-4">
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor={`asset-name-${index}`}>Asset Name</Label>
                              <Input
                                id={`asset-name-${index}`}
                                value={asset.name}
                                onChange={(e) => updateAsset(index, 'name', e.target.value)}
                                placeholder="e.g., AI Prediction Algorithm Patent, Company Logo Trademark"
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
                                <option value="designs">Registered Designs</option>
                              </select>
                            </div>
                          </div>

                          <div>
                            <Label htmlFor={`asset-description-${index}`}>Description</Label>
                            <Input
                              id={`asset-description-${index}`}
                              value={asset.description}
                              onChange={(e) => updateAsset(index, 'description', e.target.value)}
                              placeholder="Brief description of the IP asset"
                              data-testid={`input-asset-description-${index}`}
                            />
                          </div>

                          <div className="grid md:grid-cols-3 gap-4">
                            <div>
                              <Label htmlFor={`protection-strength-${index}`}>Protection Strength</Label>
                              <select
                                id={`protection-strength-${index}`}
                                value={asset.protectionStrength}
                                onChange={(e) => updateAsset(index, 'protectionStrength', e.target.value)}
                                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                                data-testid={`select-protection-strength-${index}`}
                              >
                                <option value="strong">Strong (Registered & Enforceable)</option>
                                <option value="moderate">Moderate (Pending/Informal)</option>
                                <option value="weak">Weak (Limited Protection)</option>
                                <option value="none">None (No Protection)</option>
                              </select>
                            </div>
                            <div>
                              <Label htmlFor={`ownership-clarity-${index}`}>Ownership Clarity</Label>
                              <select
                                id={`ownership-clarity-${index}`}
                                value={asset.ownershipClarity}
                                onChange={(e) => updateAsset(index, 'ownershipClarity', e.target.value)}
                                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                                data-testid={`select-ownership-clarity-${index}`}
                              >
                                <option value="clear">Clear (Documented Assignment)</option>
                                <option value="shared">Shared (Joint Ownership)</option>
                                <option value="unclear">Unclear (No Documentation)</option>
                                <option value="disputed">Disputed</option>
                              </select>
                            </div>
                            <div>
                              <Label htmlFor={`documentation-status-${index}`}>Documentation</Label>
                              <select
                                id={`documentation-status-${index}`}
                                value={asset.documentationStatus}
                                onChange={(e) => updateAsset(index, 'documentationStatus', e.target.value)}
                                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                                data-testid={`select-documentation-status-${index}`}
                              >
                                <option value="complete">Complete</option>
                                <option value="partial">Partial</option>
                                <option value="missing">Missing</option>
                              </select>
                            </div>
                          </div>

                          <div className="grid md:grid-cols-4 gap-4">
                            <div>
                              <Label htmlFor={`registration-number-${index}`}>Registration Number</Label>
                              <Input
                                id={`registration-number-${index}`}
                                value={asset.registrationNumber}
                                onChange={(e) => updateAsset(index, 'registrationNumber', e.target.value)}
                                placeholder="e.g., UK00003XXXXXX"
                                data-testid={`input-registration-number-${index}`}
                              />
                            </div>
                            <div>
                              <Label htmlFor={`registration-date-${index}`}>Registration Date</Label>
                              <Input
                                id={`registration-date-${index}`}
                                type="date"
                                value={asset.registrationDate}
                                onChange={(e) => updateAsset(index, 'registrationDate', e.target.value)}
                                data-testid={`input-registration-date-${index}`}
                              />
                            </div>
                            <div>
                              <Label htmlFor={`expiry-date-${index}`}>Expiry Date</Label>
                              <Input
                                id={`expiry-date-${index}`}
                                type="date"
                                value={asset.expiryDate}
                                onChange={(e) => updateAsset(index, 'expiryDate', e.target.value)}
                                data-testid={`input-expiry-date-${index}`}
                              />
                            </div>
                            <div>
                              <Label htmlFor={`jurisdiction-${index}`}>Jurisdiction</Label>
                              <Input
                                id={`jurisdiction-${index}`}
                                value={asset.jurisdiction}
                                onChange={(e) => updateAsset(index, 'jurisdiction', e.target.value)}
                                placeholder="e.g., UK, EU, US"
                                data-testid={`input-jurisdiction-${index}`}
                              />
                            </div>
                          </div>

                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor={`valuation-${index}`}>Estimated Valuation (£)</Label>
                              <Input
                                id={`valuation-${index}`}
                                type="number"
                                value={asset.valuationEstimate || ''}
                                onChange={(e) => updateAsset(index, 'valuationEstimate', parseFloat(e.target.value) || 0)}
                                placeholder="0"
                                data-testid={`input-valuation-${index}`}
                              />
                            </div>
                            <div>
                              <Label htmlFor={`competitive-advantage-${index}`}>Competitive Advantage</Label>
                              <Input
                                id={`competitive-advantage-${index}`}
                                value={asset.competitiveAdvantage}
                                onChange={(e) => updateAsset(index, 'competitiveAdvantage', e.target.value)}
                                placeholder="How this IP provides competitive edge"
                                data-testid={`input-competitive-advantage-${index}`}
                              />
                            </div>
                          </div>

                          <div className="grid md:grid-cols-2 gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={asset.hasLicenses}
                                onChange={(e) => updateAsset(index, 'hasLicenses', e.target.checked)}
                                className="h-4 w-4"
                                data-testid={`checkbox-has-licenses-${index}`}
                              />
                              <span className="text-sm">Has Licensing Agreements</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={asset.hasDefensivePriorArt}
                                onChange={(e) => updateAsset(index, 'hasDefensivePriorArt', e.target.checked)}
                                className="h-4 w-4"
                                data-testid={`checkbox-prior-art-${index}`}
                              />
                              <span className="text-sm">Prior Art Search Completed</span>
                            </label>
                          </div>

                          <div>
                            <Label htmlFor={`notes-${index}`}>Notes</Label>
                            <Input
                              id={`notes-${index}`}
                              value={asset.notes}
                              onChange={(e) => updateAsset(index, 'notes', e.target.value)}
                              placeholder="Additional notes or comments"
                              data-testid={`input-notes-${index}`}
                            />
                          </div>

                          {assets.length > 1 && (
                            <div className="flex justify-end">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeAsset(index)}
                                data-testid={`button-remove-asset-${index}`}
                              >
                                Remove Asset
                              </Button>
                            </div>
                          )}
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
                    <CardTitle>IP Assets by Type</CardTitle>
                    <CardDescription>Distribution of IP portfolio</CardDescription>
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
                      <p className="text-center text-muted-foreground py-12">Add IP assets to see distribution</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Protection Strength Analysis</CardTitle>
                    <CardDescription>Quality of IP protection</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {protectionStrengthData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={protectionStrengthData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="strength" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="count" fill="#3b82f6">
                            {protectionStrengthData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-center text-muted-foreground py-12">Add IP assets to analyze protection strength</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Ownership Clarity</CardTitle>
                    <CardDescription>IP ownership status distribution</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {ownershipClarityData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={ownershipClarityData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="clarity" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="count" fill="#10b981" />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-center text-muted-foreground py-12">No ownership data available</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Documentation Status</CardTitle>
                    <CardDescription>Completeness of IP documentation</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {documentationStatusData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={documentationStatusData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="status" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="count" fill="#f59e0b" />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-center text-muted-foreground py-12">No documentation data available</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Identified Gaps & Vulnerabilities</CardTitle>
                  <CardDescription>Areas requiring attention for visa application</CardDescription>
                </CardHeader>
                <CardContent>
                  {gaps.length > 0 ? (
                    <div className="space-y-3">
                      {gaps.map((gap, index) => (
                        <Alert key={index} variant={gap.severity === 'critical' ? 'destructive' : 'default'}>
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            <span className="font-semibold">[{gap.severity.toUpperCase()}] {gap.type}:</span> {gap.description}
                          </AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  ) : (
                    <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-600 dark:text-green-400">
                        No critical gaps identified. Your IP portfolio demonstrates comprehensive protection.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tips" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Smart IP Audit Tips</CardTitle>
                  <CardDescription>Expert recommendations for strengthening your IP portfolio</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {getSmartTips().map((tip, index) => (
                      <Alert key={index}>
                        <Eye className="h-4 w-4" />
                        <AlertDescription>{tip}</AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>UK IP Protection Best Practices</CardTitle>
                  <CardDescription>Essential guidance for visa applicants</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">File Trademarks Early</p>
                        <p className="text-sm text-muted-foreground">UK trademark registration takes 4-6 months - start before visa application</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Establish Patent Priority</p>
                        <p className="text-sm text-muted-foreground">File provisional patents to establish priority dates - patent-pending status is acceptable</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Clarify IP Ownership</p>
                        <p className="text-sm text-muted-foreground">Execute IP assignment agreements transferring all founder IP to company</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Document Trade Secrets</p>
                        <p className="text-sm text-muted-foreground">Implement confidentiality procedures and employee NDAs for valuable know-how</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Obtain IP Valuation</p>
                        <p className="text-sm text-muted-foreground">Professional IP valuation report demonstrates economic value to endorsing bodies</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Conduct Prior Art Searches</p>
                        <p className="text-sm text-muted-foreground">Freedom to operate analysis demonstrates due diligence and reduces infringement risk</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="action" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>4-Week IP Audit Action Plan</CardTitle>
                  <CardDescription>Prioritized timeline to strengthen your IP portfolio for visa application</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {generateActionPlan().map((item, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 rounded-lg border">
                        <div className={`px-2 py-1 rounded text-xs font-semibold ${
                          item.priority === 'Critical' ? 'bg-destructive text-destructive-foreground' :
                          item.priority === 'High' ? 'bg-orange-500 text-white' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          {item.priority}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{item.week}</p>
                          <p className="text-sm text-muted-foreground mt-1">{item.action}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>IP Protection Costs (UK)</CardTitle>
                  <CardDescription>Budget allocation for comprehensive IP portfolio</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 rounded-lg bg-muted">
                      <span className="font-medium">UK Trademark (1 class)</span>
                      <span className="font-bold">£700-£2,000</span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-lg bg-muted">
                      <span className="font-medium">UK Patent Application</span>
                      <span className="font-bold">£4,000-£8,000</span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-lg bg-muted">
                      <span className="font-medium">Registered Design (UK)</span>
                      <span className="font-bold">£600-£2,000</span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-lg bg-muted">
                      <span className="font-medium">IP Valuation Report</span>
                      <span className="font-bold">£2,000-£5,000</span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-lg bg-muted">
                      <span className="font-medium">Prior Art Search</span>
                      <span className="font-bold">£500-£1,500</span>
                    </div>
                    <div className="flex justify-between items-center p-4 rounded-lg bg-primary text-primary-foreground">
                      <span className="font-bold text-lg">Typical Initial Budget</span>
                      <span className="font-bold text-lg">£8,000-£20,000</span>
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
