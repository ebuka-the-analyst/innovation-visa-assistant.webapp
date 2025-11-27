import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { 
  Shield,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Bell,
  FileText,
  ExternalLink,
  RefreshCw,
  TrendingUp,
  Calendar,
  Search,
  Sparkles,
  Info,
  BookOpen
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { apiRequest } from "@/lib/queryClient";

interface RegulationUpdate {
  id: string;
  title: string;
  summary: string;
  impact: 'high' | 'medium' | 'low';
  date: string;
  category: 'visa' | 'immigration' | 'business' | 'tax' | 'employment';
  source: string;
  sourceUrl?: string;
  affectsApplication: boolean;
  actionRequired?: string;
}

interface ComplianceItem {
  id: string;
  requirement: string;
  status: 'compliant' | 'attention' | 'non-compliant' | 'pending';
  dueDate?: string;
  details: string;
  category: string;
  actionRequired?: string;
}

interface RegulatoryCopilotProps {
  onAlert?: (update: RegulationUpdate) => void;
}

const MOCK_UPDATES: RegulationUpdate[] = [
  {
    id: '1',
    title: 'Innovator Founder Visa Route Updates - November 2024',
    summary: 'Home Office has clarified the endorsement criteria for technology startups. Innovation must now demonstrate clear differentiation from existing market solutions.',
    impact: 'high',
    date: '2024-11-15',
    category: 'visa',
    source: 'GOV.UK',
    sourceUrl: 'https://www.gov.uk/innovator-founder-visa',
    affectsApplication: true,
    actionRequired: 'Review your innovation statement to ensure it clearly differentiates from competitors.'
  },
  {
    id: '2',
    title: 'Minimum Investment Threshold Unchanged',
    summary: 'The minimum investment requirement remains at £50,000 from approved sources. Self-funding rules continue to apply.',
    impact: 'low',
    date: '2024-11-10',
    category: 'visa',
    source: 'Home Office',
    affectsApplication: false
  },
  {
    id: '3',
    title: 'UK Corporate Tax Rate for 2024/25',
    summary: 'Corporation tax rate is 25% for companies with profits over £250,000. Small profits rate of 19% applies to profits under £50,000.',
    impact: 'medium',
    date: '2024-11-05',
    category: 'tax',
    source: 'HMRC',
    sourceUrl: 'https://www.gov.uk/corporation-tax-rates',
    affectsApplication: true,
    actionRequired: 'Update financial projections to reflect current tax rates.'
  },
  {
    id: '4',
    title: 'Job Creation Metrics for ILR',
    summary: 'To qualify for Indefinite Leave to Remain (ILR), you must create minimum 5 jobs at £25,000+ salary or 10 jobs at any salary level within 3 years.',
    impact: 'high',
    date: '2024-10-28',
    category: 'immigration',
    source: 'Home Office',
    affectsApplication: true,
    actionRequired: 'Ensure hiring plan demonstrates clear path to required job creation targets.'
  },
  {
    id: '5',
    title: 'Endorsed Bodies Contact Point Changes',
    summary: 'Several endorsing bodies have updated their application portals and contact procedures. Check individual endorser websites for latest information.',
    impact: 'medium',
    date: '2024-10-20',
    category: 'visa',
    source: 'UK Endorsing Bodies',
    affectsApplication: false
  }
];

const COMPLIANCE_ITEMS: ComplianceItem[] = [
  { id: 'c1', requirement: 'Valid Passport (6+ months validity)', status: 'compliant', category: 'Documents', details: 'Passport must be valid for at least 6 months beyond intended stay' },
  { id: 'c2', requirement: 'Endorsement Letter', status: 'pending', category: 'Endorsement', details: 'Letter from approved endorsing body confirming your business meets innovation criteria', dueDate: '2024-12-15' },
  { id: 'c3', requirement: 'Proof of Funds (£1,270 for 28 days)', status: 'attention', category: 'Financial', details: 'Bank statements showing maintenance funds held consecutively', dueDate: '2024-12-01' },
  { id: 'c4', requirement: 'English Language (B2 CEFR)', status: 'compliant', category: 'Language', details: 'IELTS 5.5 in each component or approved equivalent' },
  { id: 'c5', requirement: 'TB Test Certificate', status: 'pending', category: 'Health', details: 'Required if applying from certain countries', dueDate: '2024-12-10' },
  { id: 'c6', requirement: 'Business Plan Document', status: 'attention', category: 'Business', details: 'Comprehensive plan showing innovation, viability, and scalability' },
  { id: 'c7', requirement: 'Financial Projections (3-5 years)', status: 'pending', category: 'Financial', details: 'Realistic revenue, cost, and profitability forecasts' },
  { id: 'c8', requirement: 'Market Research Evidence', status: 'compliant', category: 'Business', details: 'TAM/SAM/SOM analysis with credible sources' },
  { id: 'c9', requirement: 'Criminal Record Certificate', status: 'pending', category: 'Background', details: 'Police clearance from countries resided 12+ months' },
  { id: 'c10', requirement: 'UK Company Registration', status: 'non-compliant', category: 'Business', details: 'Must register company with Companies House before or shortly after arrival', actionRequired: 'Register your UK company' }
];

export function RegulatoryCopilot({ onAlert }: RegulatoryCopilotProps) {
  const [updates, setUpdates] = useState<RegulationUpdate[]>(MOCK_UPDATES);
  const [complianceItems, setComplianceItems] = useState<ComplianceItem[]>(COMPLIANCE_ITEMS);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredUpdates = updates.filter(u => {
    const matchesSearch = u.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          u.summary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || u.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const complianceScore = Math.round(
    (complianceItems.filter(i => i.status === 'compliant').length / complianceItems.length) * 100
  );

  const highImpactCount = updates.filter(u => u.impact === 'high' && u.affectsApplication).length;

  const refreshUpdates = async () => {
    setIsRefreshing(true);
    try {
      const response = await apiRequest("GET", "/api/regulations/updates");
      const data = await response.json();
      if (data.updates) {
        setUpdates(data.updates);
      }
    } catch (error) {
      console.log("Using cached regulatory data");
    }
    setLastUpdated(new Date());
    setIsRefreshing(false);
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'text-green-500';
      case 'attention': return 'text-yellow-500';
      case 'non-compliant': return 'text-red-500';
      case 'pending': return 'text-blue-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant': return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'attention': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'non-compliant': return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'pending': return <Clock className="h-5 w-5 text-blue-500" />;
      default: return <Info className="h-5 w-5" />;
    }
  };

  const categories = ['visa', 'immigration', 'business', 'tax', 'employment'];

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-r from-violet-500/10 to-purple-500/10 border-violet-500/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
              <Shield className="h-7 w-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Autonomous Regulatory Copilot</h2>
              <p className="text-muted-foreground">
                Real-time UK immigration law monitoring & compliance tracking
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {highImpactCount > 0 && (
              <Badge className="bg-red-500 animate-pulse">
                <Bell className="h-3 w-3 mr-1" />
                {highImpactCount} Critical Updates
              </Badge>
            )}
            <Button 
              variant="outline" 
              onClick={refreshUpdates}
              disabled={isRefreshing}
              data-testid="button-refresh-regulations"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search regulatory updates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-regulations"
                />
              </div>
              <div className="flex gap-1">
                {categories.map(cat => (
                  <Badge
                    key={cat}
                    variant={selectedCategory === cat ? "default" : "outline"}
                    className="cursor-pointer capitalize"
                    onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                    data-testid={`badge-category-${cat}`}
                  >
                    {cat}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <AnimatePresence>
                {filteredUpdates.map((update, index) => (
                  <motion.div
                    key={update.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className={`p-4 ${update.affectsApplication ? 'border-l-4 border-l-orange-500' : ''}`}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={getImpactColor(update.impact)}>
                              {update.impact.toUpperCase()}
                            </Badge>
                            <Badge variant="outline" className="capitalize">
                              {update.category}
                            </Badge>
                            {update.affectsApplication && (
                              <Badge variant="outline" className="border-orange-500 text-orange-500">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Affects Your Application
                              </Badge>
                            )}
                          </div>
                          
                          <h3 className="font-semibold mb-1">{update.title}</h3>
                          <p className="text-sm text-muted-foreground mb-2">{update.summary}</p>
                          
                          {update.actionRequired && (
                            <div className="bg-orange-500/10 border border-orange-500/20 rounded p-2 text-sm">
                              <strong>Action Required:</strong> {update.actionRequired}
                            </div>
                          )}
                          
                          <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {update.date}
                            </span>
                            <span className="flex items-center gap-1">
                              <FileText className="h-3 w-3" />
                              {update.source}
                            </span>
                            {update.sourceUrl && (
                              <a 
                                href={update.sourceUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-primary hover:underline"
                              >
                                <ExternalLink className="h-3 w-3" />
                                View Source
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="p-4">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Compliance Score
            </h3>
            
            <div className="relative w-32 h-32 mx-auto mb-4">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-muted"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  fill="none"
                  stroke={complianceScore >= 80 ? '#22c55e' : complianceScore >= 50 ? '#eab308' : '#ef4444'}
                  strokeWidth="8"
                  strokeDasharray={`${complianceScore * 3.52} 352`}
                  className="transition-all duration-500"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl font-bold">{complianceScore}%</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span>Compliant: {complianceItems.filter(i => i.status === 'compliant').length}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <span>Attention: {complianceItems.filter(i => i.status === 'attention').length}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span>Pending: {complianceItems.filter(i => i.status === 'pending').length}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span>Issues: {complianceItems.filter(i => i.status === 'non-compliant').length}</span>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Compliance Checklist
            </h3>
            
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {complianceItems.map((item) => (
                <div 
                  key={item.id}
                  className={`p-3 rounded-lg border ${
                    item.status === 'non-compliant' ? 'border-red-500/30 bg-red-500/5' :
                    item.status === 'attention' ? 'border-yellow-500/30 bg-yellow-500/5' :
                    'border-border'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {getStatusIcon(item.status)}
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.requirement}</p>
                      <p className="text-xs text-muted-foreground mt-1">{item.details}</p>
                      {item.dueDate && (
                        <p className="text-xs text-orange-500 mt-1 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Due: {item.dueDate}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-4 bg-muted/50">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Sparkles className="h-4 w-4" />
              <span>Last updated: {lastUpdated.toLocaleString()}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Regulatory Copilot monitors GOV.UK, Home Office, HMRC, and endorsed body announcements automatically.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default RegulatoryCopilot;
