import { useState, useEffect, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AiToolGuide, AiTraditionalToggle, type ToolConfig } from "@/components/AiToolGuide";
import { useTierAccess } from "@/hooks/useTierAccess";
import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Plus, Trash2, ExternalLink, AlertTriangle } from "lucide-react";
import { useWordExport } from "@/hooks/useWordExport";
import { useToast } from "@/hooks/use-toast";

const AI_TOOL_CONFIG: ToolConfig = {
  toolId: 'market-data-verifier',
  toolName: 'Market Data Verifier',
  agent: 'atlas',
  greeting: "Hello! I'm Atlas, your Growth Strategist. Verifying market data with credible sources is crucial for building a compelling case for endorsers. Let me guide you through documenting and validating your market claims systematically.",
  questions: [
    {
      id: 'market-size',
      question: "What is the total addressable market (TAM) for your product? Provide the market size claim and where you found this data.",
      hint: "Use credible sources like Statista, IBISWorld, or government statistics",
      fieldKey: 'market_size',
      minLength: 30
    },
    {
      id: 'market-growth',
      question: "What is the projected market growth rate? Include the source and publication date of this data.",
      hint: "Recent data (within 2-3 years) carries more weight with endorsers",
      fieldKey: 'market_growth',
      minLength: 30
    },
    {
      id: 'competitor-data',
      question: "What claims do you make about competitors or market leaders? List these with their sources.",
      hint: "Company reports, press releases, and industry publications are good sources",
      fieldKey: 'competitor_data',
      minLength: 30
    },
    {
      id: 'uk-specific',
      question: "What UK-specific market data do you cite? The UK Innovator visa requires UK market relevance.",
      hint: "ONS, Gov.uk, Tech Nation, and British Business Bank are excellent UK sources",
      fieldKey: 'uk_specific',
      minLength: 30
    },
    {
      id: 'customer-data',
      question: "What customer behavior or demand statistics do you reference? How are these verified?",
      hint: "Include survey data, industry reports, or your own validated research",
      fieldKey: 'customer_data',
      minLength: 20
    },
    {
      id: 'verification-status',
      question: "Which of your market claims still need verification? What sources will you use?",
      hint: "Be honest about gaps - we'll help you find credible sources",
      fieldKey: 'verification_status',
      minLength: 20
    }
  ]
};

interface MarketClaim {
  id: string;
  claim: string;
  sourceType: string;
  sourceName: string;
  sourceUrl: string;
  publicationDate: string;
  verified: boolean;
  notes: string;
}

export default function MarketDataVerifier() {
  const { generateWord } = useWordExport();
  const { toast } = useToast();
  const { userTier } = useTierAccess();
  const [savedDate, setSavedDate] = useState('');
  
  // Free users default to traditional mode, paid users can use AI mode
  const isPaidUser = userTier !== 'free';
  const [mode, setMode] = useState<'ai' | 'traditional'>(() => {
    const saved = localStorage.getItem('market-data-verifier-mode');
    // Free users always start in traditional mode
    return (saved === 'ai' && isPaidUser) ? 'ai' : 'traditional';
  });

  // Force traditional mode for free users and clear localStorage
  useEffect(() => {
    if (!isPaidUser && mode === 'ai') {
      setMode('traditional');
      localStorage.setItem('market-data-verifier-mode', 'traditional');
    }
  }, [isPaidUser, mode]);

  useEffect(() => {
    localStorage.setItem('market-data-verifier-mode', mode);
  }, [mode]);

  const handleAiComplete = useCallback((answers: Record<string, any>) => {
    const newClaims: MarketClaim[] = [];
    if (answers.market_size) {
      newClaims.push({ id: Date.now().toString(), claim: answers.market_size, sourceType: 'industry', sourceName: '', sourceUrl: '', publicationDate: '', verified: false, notes: '' });
    }
    if (answers.market_growth) {
      newClaims.push({ id: (Date.now() + 1).toString(), claim: answers.market_growth, sourceType: 'industry', sourceName: '', sourceUrl: '', publicationDate: '', verified: false, notes: '' });
    }
    if (answers.competitor_data) {
      newClaims.push({ id: (Date.now() + 2).toString(), claim: answers.competitor_data, sourceType: 'company', sourceName: '', sourceUrl: '', publicationDate: '', verified: false, notes: '' });
    }
    if (answers.uk_specific) {
      newClaims.push({ id: (Date.now() + 3).toString(), claim: answers.uk_specific, sourceType: 'government', sourceName: '', sourceUrl: '', publicationDate: '', verified: false, notes: '' });
    }
    if (newClaims.length > 0) {
      setClaims(newClaims);
    }
    setMode('traditional');
    toast({ title: "AI Guide Complete", description: "Your market claims have been added to the form" });
  }, [toast]);

  const [claims, setClaims] = useState<MarketClaim[]>([
    { id: '1', claim: '', sourceType: '', sourceName: '', sourceUrl: '', publicationDate: '', verified: false, notes: '' }
  ]);

  const getSerializedState = () => ({
    claims, savedDate: new Date().toLocaleString('en-GB')
  });

  const restoreSerializedState = (state: any) => {
    if (state.claims) setClaims(state.claims);
    if (state.savedDate) setSavedDate(state.savedDate);
  };

  useEffect(() => {
    const saved = localStorage.getItem('market-data-verifier-state');
    if (saved) restoreSerializedState(JSON.parse(saved));
  }, []);

  const handleSave = () => {
    const state = getSerializedState();
    localStorage.setItem('market-data-verifier-state', JSON.stringify(state));
    setSavedDate(state.savedDate);
    toast({ title: "Progress saved", description: "Your market data has been saved" });
  };

  const handleRestore = () => {
    const saved = localStorage.getItem('market-data-verifier-state');
    if (saved) restoreSerializedState(JSON.parse(saved));
  };

  const calculateVerificationScore = () => {
    const totalClaims = claims.filter(c => c.claim).length;
    if (totalClaims === 0) return 0;
    const verifiedClaims = claims.filter(c => c.claim && c.verified && c.sourceName && c.sourceUrl).length;
    return Math.round((verifiedClaims / totalClaims) * 100);
  };

  const sourceTypes = [
    { value: 'government', label: 'Government/Official Statistics' },
    { value: 'industry', label: 'Industry Report' },
    { value: 'academic', label: 'Academic Research' },
    { value: 'news', label: 'News/Media' },
    { value: 'company', label: 'Company Report' },
    { value: 'analyst', label: 'Market Analyst' },
    { value: 'trade', label: 'Trade Association' },
    { value: 'other', label: 'Other' }
  ];

  const credibleSources = [
    { name: 'Office for National Statistics (ONS)', url: 'https://www.ons.gov.uk', type: 'UK economic data' },
    { name: 'Statista', url: 'https://www.statista.com', type: 'Market statistics' },
    { name: 'IBISWorld', url: 'https://www.ibisworld.com', type: 'Industry reports' },
    { name: 'Companies House', url: 'https://www.gov.uk/government/organisations/companies-house', type: 'Company data' },
    { name: 'Gov.uk Statistics', url: 'https://www.gov.uk/search/research-and-statistics', type: 'Government statistics' },
    { name: 'British Business Bank', url: 'https://www.british-business-bank.co.uk', type: 'SME finance data' },
    { name: 'Tech Nation', url: 'https://technation.io', type: 'UK tech sector data' },
    { name: 'Eurostat', url: 'https://ec.europa.eu/eurostat', type: 'European statistics' }
  ];

  const getSmartTips = () => [
    "Use government and official statistics as primary sources - most credible for endorsers",
    "Ensure all statistics are from the last 2-3 years to demonstrate current market conditions",
    "Include page numbers or specific URLs for easy verification",
    "Cross-reference claims with multiple sources when possible",
    "Avoid Wikipedia and user-generated content as primary sources",
    "Industry reports from reputable firms (Gartner, McKinsey) carry significant weight"
  ];

  const generateActionPlan = () => [
    { week: "Week 1", action: "List all market claims in your business plan that need verification", priority: "Critical" },
    { week: "Week 1", action: "Identify appropriate sources for each claim category", priority: "High" },
    { week: "Week 2", action: "Research and document sources for each market statistic", priority: "Critical" },
    { week: "Week 2", action: "Download/save PDFs of key reports for reference", priority: "Medium" },
    { week: "Week 3", action: "Update business plan with proper citations", priority: "High" },
    { week: "Week 3", action: "Create appendix with source references", priority: "Medium" }
  ];

  const handleExportWord = async () => {
    await generateWord({
      title: 'Market Data Verification Report',
      subtitle: `Verification Score: ${calculateVerificationScore()}%`,
      filename: `market-data-verification-report-${Date.now()}.docx`,
      sections: [
        { type: 'heading', content: 'Verified Market Claims', level: 1 },
        {
          type: 'table',
          tableData: {
            headers: ['Claim', 'Source', 'URL', 'Date'],
            rows: claims.filter(c => c.claim && c.verified).map(c => [c.claim, c.sourceName, c.sourceUrl, c.publicationDate])
          }
        },
        { type: 'divider' },
        { type: 'heading', content: 'Unverified Claims', level: 1 },
        ...claims.filter(c => c.claim && !c.verified).map(c => ({ type: 'paragraph' as const, content: c.claim })),
        { type: 'divider' },
        { type: 'heading', content: 'Credible Source Directory', level: 1 },
        ...credibleSources.map(s => ({ type: 'paragraph' as const, content: `${s.name}: ${s.type} (${s.url})` }))
      ]
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 py-8">
      <div className="responsive-container max-w-6xl">
        <ToolUtilityBar
          toolId="market-data-verifier"
          toolName="Market Data Verifier"
          onSave={handleSave}
          onRestore={handleRestore}
          onExportWord={handleExportWord}
          getSerializedState={getSerializedState}
        />

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-6 w-6 text-primary" />
                  Market Data Verifier
                </CardTitle>
                <CardDescription>
                  Verify and cite market statistics with credible sources
                </CardDescription>
              </div>
              <AiTraditionalToggle mode={mode} onModeChange={setMode} userTier={userTier} />
            </div>
          </CardHeader>
          <CardContent>
            {mode === 'ai' ? (
              <AiToolGuide config={AI_TOOL_CONFIG} onComplete={handleAiComplete} userTier={userTier} />
            ) : (
              <>
            <div className="mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Verification Score</span>
                <span className="text-sm font-bold text-primary">{calculateVerificationScore()}%</span>
              </div>
              <Progress value={calculateVerificationScore()} className="h-3" />
              <p className="text-sm text-muted-foreground mt-2">
                {claims.filter(c => c.claim && c.verified).length} of {claims.filter(c => c.claim).length} claims verified
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <h3 className="text-lg font-semibold">Market Claims & Sources</h3>
                {claims.map((claim, index) => (
                  <Card key={claim.id} className={`p-4 ${claim.verified ? 'border-green-200 bg-green-50/30 dark:bg-green-950/10' : ''}`}>
                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <Label>Market Claim/Statistic</Label>
                          <Textarea
                            value={claim.claim}
                            onChange={(e) => {
                              const updated = [...claims];
                              updated[index].claim = e.target.value;
                              setClaims(updated);
                            }}
                            placeholder="e.g., The UK fintech market is worth £11 billion..."
                            data-testid={`input-claim-${index}`}
                          />
                        </div>
                        {claim.verified && <Badge className="ml-2 bg-green-500">Verified</Badge>}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Source Type</Label>
                          <select
                            className="w-full h-10 px-3 rounded-md border border-input bg-background"
                            value={claim.sourceType}
                            onChange={(e) => {
                              const updated = [...claims];
                              updated[index].sourceType = e.target.value;
                              setClaims(updated);
                            }}
                            data-testid={`select-source-type-${index}`}
                          >
                            <option value="">Select source type...</option>
                            {sourceTypes.map(st => (
                              <option key={st.value} value={st.value}>{st.label}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <Label>Source Name</Label>
                          <Input
                            value={claim.sourceName}
                            onChange={(e) => {
                              const updated = [...claims];
                              updated[index].sourceName = e.target.value;
                              setClaims(updated);
                            }}
                            placeholder="e.g., Office for National Statistics"
                            data-testid={`input-source-name-${index}`}
                          />
                        </div>
                        <div>
                          <Label>Source URL</Label>
                          <Input
                            value={claim.sourceUrl}
                            onChange={(e) => {
                              const updated = [...claims];
                              updated[index].sourceUrl = e.target.value;
                              setClaims(updated);
                            }}
                            placeholder="https://..."
                            data-testid={`input-source-url-${index}`}
                          />
                        </div>
                        <div>
                          <Label>Publication Date</Label>
                          <Input
                            type="date"
                            value={claim.publicationDate}
                            onChange={(e) => {
                              const updated = [...claims];
                              updated[index].publicationDate = e.target.value;
                              setClaims(updated);
                            }}
                            data-testid={`input-pub-date-${index}`}
                          />
                        </div>
                      </div>

                      <div>
                        <Label>Notes</Label>
                        <Input
                          value={claim.notes}
                          onChange={(e) => {
                            const updated = [...claims];
                            updated[index].notes = e.target.value;
                            setClaims(updated);
                          }}
                          placeholder="Page number, specific section, etc."
                          data-testid={`input-notes-${index}`}
                        />
                      </div>

                      <div className="flex justify-between items-center">
                        <Button
                          variant={claim.verified ? "default" : "outline"}
                          size="sm"
                          onClick={() => {
                            const updated = [...claims];
                            updated[index].verified = !updated[index].verified;
                            setClaims(updated);
                          }}
                          data-testid={`button-verify-${index}`}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          {claim.verified ? 'Verified' : 'Mark as Verified'}
                        </Button>
                        {claims.length > 1 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setClaims(claims.filter((_, i) => i !== index))}
                            data-testid={`button-remove-claim-${index}`}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />Remove
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
                <Button
                  variant="outline"
                  onClick={() => setClaims([...claims, { id: Date.now().toString(), claim: '', sourceType: '', sourceName: '', sourceUrl: '', publicationDate: '', verified: false, notes: '' }])}
                  data-testid="button-add-claim"
                >
                  <Plus className="h-4 w-4 mr-2" />Add Market Claim
                </Button>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Credible Source Directory</h3>
                <p className="text-sm text-muted-foreground">
                  Recommended sources for UK market data and statistics.
                </p>
                {credibleSources.map((source, index) => (
                  <Card key={index} className="p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-sm">{source.name}</p>
                        <p className="text-xs text-muted-foreground">{source.type}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                      >
                        <a href={source.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </Card>
                ))}

                <Card className="p-4 border-yellow-200 bg-yellow-50/50 dark:bg-yellow-950/20">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Avoid Unreliable Sources</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Wikipedia, blog posts, and unverified social media are not credible for endorsement applications.
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
            </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
