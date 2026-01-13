import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { DollarSign, FileText, Calculator, Download, Loader2, CheckCircle2, Sparkles, Scale, TrendingUp } from "lucide-react";

interface SAFETerms {
  valuationCap: string;
  discountRate: string;
  proRataRights: boolean;
  mfnClause: boolean;
  keyTerms: string[];
  investorProtections: string[];
  founderProtections: string[];
  riskFactors: string[];
}

interface ValuationAnalysis {
  suggestedValuation: string;
  methodology: string;
  comparables: { company: string; valuation: string; stage: string }[];
  factors: { factor: string; impact: 'positive' | 'negative' | 'neutral'; description: string }[];
}

export default function AIFundingNegotiator() {
  const { toast } = useToast();
  const [fundingAmount, setFundingAmount] = useState('');
  const [businessStage, setBusinessStage] = useState('');
  const [industry, setIndustry] = useState('');
  const [revenue, setRevenue] = useState('');
  const [safeTerms, setSafeTerms] = useState<SAFETerms | null>(null);
  const [valuation, setValuation] = useState<ValuationAnalysis | null>(null);

  const generateSAFEMutation = useMutation({
    mutationFn: async (data: { amount: string; stage: string; industry: string }) => {
      const response = await apiRequest('POST', '/api/ai/generate-safe-terms', data);
      return response.json();
    },
    onSuccess: (data) => {
      setSafeTerms(data.terms);
      setValuation(data.valuation);
      toast({ title: "Terms Generated", description: "SAFE agreement terms and valuation analysis ready" });
    }
  });

  const handleGenerate = () => {
    if (!fundingAmount.trim() || !businessStage) {
      toast({ title: "Required", description: "Please provide funding amount and business stage", variant: "destructive" });
      return;
    }
    generateSAFEMutation.mutate({ amount: fundingAmount, stage: businessStage, industry });
  };

  const downloadTermSheet = () => {
    if (!safeTerms) return;
    const content = `SAFE AGREEMENT TERM SHEET
========================

Funding Amount: £${fundingAmount}
Business Stage: ${businessStage}
Industry: ${industry || 'Not specified'}

TERMS:
------
Valuation Cap: ${safeTerms.valuationCap}
Discount Rate: ${safeTerms.discountRate}
Pro-Rata Rights: ${safeTerms.proRataRights ? 'Yes' : 'No'}
MFN Clause: ${safeTerms.mfnClause ? 'Yes' : 'No'}

KEY TERMS:
${safeTerms.keyTerms.map(t => `- ${t}`).join('\n')}

INVESTOR PROTECTIONS:
${safeTerms.investorProtections.map(p => `- ${p}`).join('\n')}

FOUNDER PROTECTIONS:
${safeTerms.founderProtections.map(p => `- ${p}`).join('\n')}

RISK FACTORS:
${safeTerms.riskFactors.map(r => `- ${r}`).join('\n')}
`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'safe-term-sheet.txt';
    a.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-emerald-500/5 to-teal-500/5 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 mb-4">
            <DollarSign className="w-4 h-4 text-emerald-500" />
            <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">AI Funding Negotiator</span>
          </div>
          <h1 className="text-xl font-bold mb-3" data-testid="heading-funding-negotiator">AI Funding Negotiator</h1>
          <p className="text-muted-foreground">Generate SAFE agreements, valuations, and term sheet drafts for UK investors</p>
        </div>

        <ToolUtilityBar toolId="ai-funding-negotiator" toolName="Funding Negotiator" />

        <div className="grid lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-emerald-500" />
                Funding Parameters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Funding Amount (£)</label>
                <Input
                  placeholder="e.g., 250000"
                  value={fundingAmount}
                  onChange={(e) => setFundingAmount(e.target.value)}
                  data-testid="input-funding-amount"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Business Stage</label>
                <Select value={businessStage} onValueChange={setBusinessStage}>
                  <SelectTrigger data-testid="select-stage">
                    <SelectValue placeholder="Select stage" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pre-seed">Pre-Seed</SelectItem>
                    <SelectItem value="seed">Seed</SelectItem>
                    <SelectItem value="series-a">Series A</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Industry</label>
                <Select value={industry} onValueChange={setIndustry}>
                  <SelectTrigger data-testid="select-industry">
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fintech">Fintech</SelectItem>
                    <SelectItem value="healthtech">Healthtech</SelectItem>
                    <SelectItem value="saas">SaaS</SelectItem>
                    <SelectItem value="ai">AI/ML</SelectItem>
                    <SelectItem value="ecommerce">E-commerce</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Current ARR (Optional)</label>
                <Input
                  placeholder="e.g., 50000"
                  value={revenue}
                  onChange={(e) => setRevenue(e.target.value)}
                  data-testid="input-revenue"
                />
              </div>
              <Button 
                onClick={handleGenerate} 
                disabled={generateSAFEMutation.isPending}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white"
                data-testid="button-generate-terms"
              >
                {generateSAFEMutation.isPending ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating...</>
                ) : (
                  <><Sparkles className="w-4 h-4 mr-2" />Generate SAFE Terms</>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Generated Terms
                </CardTitle>
                {safeTerms && (
                  <Button variant="outline" size="sm" onClick={downloadTermSheet} data-testid="button-download-terms">
                    <Download className="w-4 h-4 mr-1" />Export
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {!safeTerms ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Scale className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Enter funding parameters to generate SAFE terms</p>
                </div>
              ) : (
                <Tabs defaultValue="terms">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="terms">SAFE Terms</TabsTrigger>
                    <TabsTrigger value="valuation">Valuation</TabsTrigger>
                    <TabsTrigger value="protections">Protections</TabsTrigger>
                  </TabsList>
                  <TabsContent value="terms" className="space-y-4 pt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Card className="p-4 bg-emerald-500/10">
                        <p className="text-sm text-muted-foreground">Valuation Cap</p>
                        <p className="text-lg font-bold text-emerald-600">{safeTerms.valuationCap}</p>
                      </Card>
                      <Card className="p-4 bg-teal-500/10">
                        <p className="text-sm text-muted-foreground">Discount Rate</p>
                        <p className="text-lg font-bold text-teal-600">{safeTerms.discountRate}</p>
                      </Card>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={safeTerms.proRataRights ? 'bg-green-500' : 'bg-gray-500'}>
                        Pro-Rata: {safeTerms.proRataRights ? 'Yes' : 'No'}
                      </Badge>
                      <Badge className={safeTerms.mfnClause ? 'bg-green-500' : 'bg-gray-500'}>
                        MFN: {safeTerms.mfnClause ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Key Terms</h4>
                      <ul className="space-y-1">
                        {safeTerms.keyTerms.map((term, i) => (
                          <li key={i} className="text-sm flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                            {term}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </TabsContent>
                  <TabsContent value="valuation" className="space-y-4 pt-4">
                    {valuation && (
                      <>
                        <Card className="p-4 bg-gradient-to-r from-emerald-500/10 to-teal-500/10">
                          <p className="text-sm text-muted-foreground">Suggested Valuation</p>
                          <p className="text-xl font-bold">{valuation.suggestedValuation}</p>
                          <p className="text-sm text-muted-foreground mt-1">Methodology: {valuation.methodology}</p>
                        </Card>
                        <div>
                          <h4 className="font-medium mb-2">Valuation Factors</h4>
                          {valuation.factors.map((factor, i) => (
                            <div key={i} className="flex items-center justify-between p-2 border-b">
                              <span className="text-sm">{factor.factor}</span>
                              <Badge className={factor.impact === 'positive' ? 'bg-green-500' : factor.impact === 'negative' ? 'bg-red-500' : 'bg-gray-500'}>
                                {factor.impact}
                              </Badge>
                            </div>
                          ))}
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Comparable Companies</h4>
                          {valuation.comparables.map((comp, i) => (
                            <div key={i} className="flex items-center justify-between p-2 bg-muted/50 rounded mb-1">
                              <span className="text-sm font-medium">{comp.company}</span>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline">{comp.stage}</Badge>
                                <span className="text-sm">{comp.valuation}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </TabsContent>
                  <TabsContent value="protections" className="space-y-4 pt-4">
                    <div>
                      <h4 className="font-medium mb-2 text-blue-600">Investor Protections</h4>
                      <ul className="space-y-1">
                        {safeTerms.investorProtections.map((p, i) => (
                          <li key={i} className="text-sm p-2 bg-blue-500/10 rounded">{p}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2 text-green-600">Founder Protections</h4>
                      <ul className="space-y-1">
                        {safeTerms.founderProtections.map((p, i) => (
                          <li key={i} className="text-sm p-2 bg-green-500/10 rounded">{p}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2 text-orange-600">Risk Factors</h4>
                      <ul className="space-y-1">
                        {safeTerms.riskFactors.map((r, i) => (
                          <li key={i} className="text-sm p-2 bg-orange-500/10 rounded">{r}</li>
                        ))}
                      </ul>
                    </div>
                  </TabsContent>
                </Tabs>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
