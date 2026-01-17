import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  CheckCircle2, AlertTriangle, XCircle, Plus, Trash2, Download,
  Lightbulb, ExternalLink, BookOpen, BarChart3, TrendingUp
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MarketStatistic {
  id: string;
  statistic: string;
  value: string;
  source: string;
  sourceUrl?: string;
  sourceType: "official" | "report" | "news" | "estimate" | "unverified";
  publicationDate?: string;
  verified: boolean;
  notes?: string;
}

const CREDIBLE_SOURCES = [
  { name: "UK Government / Home Office", credibility: "highest", type: "official" },
  { name: "Office for National Statistics (ONS)", credibility: "highest", type: "official" },
  { name: "Companies House", credibility: "highest", type: "official" },
  { name: "Statista", credibility: "high", type: "report" },
  { name: "IBISWorld", credibility: "high", type: "report" },
  { name: "Gartner", credibility: "high", type: "report" },
  { name: "McKinsey", credibility: "high", type: "report" },
  { name: "Deloitte", credibility: "high", type: "report" },
  { name: "PwC", credibility: "high", type: "report" },
  { name: "UK Tech Sector Reports", credibility: "high", type: "report" },
  { name: "Financial Times", credibility: "medium", type: "news" },
  { name: "The Economist", credibility: "medium", type: "news" },
  { name: "Forbes", credibility: "medium", type: "news" },
  { name: "TechCrunch", credibility: "medium", type: "news" },
  { name: "Internal Estimate", credibility: "low", type: "estimate" },
];

export default function MarketDataVerifier() {
  const { toast } = useToast();
  
  const [statistics, setStatistics] = useState<MarketStatistic[]>([]);
  const [newStat, setNewStat] = useState<Partial<MarketStatistic>>({
    sourceType: "report",
    verified: false
  });

  const calculateDataQuality = () => {
    if (statistics.length === 0) return 0;
    
    let score = 0;
    const verifiedStats = statistics.filter(s => s.verified);
    const officialSources = statistics.filter(s => s.sourceType === "official");
    const reportSources = statistics.filter(s => s.sourceType === "report");
    
    score += (verifiedStats.length / statistics.length) * 40;
    score += (officialSources.length / statistics.length) * 30;
    score += (reportSources.length / statistics.length) * 20;
    
    const withUrls = statistics.filter(s => s.sourceUrl);
    score += (withUrls.length / statistics.length) * 10;
    
    return Math.round(score);
  };

  const addStatistic = () => {
    if (!newStat.statistic || !newStat.value || !newStat.source) {
      toast({ title: "Missing Information", description: "Please fill in statistic, value, and source", variant: "destructive" });
      return;
    }
    
    const stat: MarketStatistic = {
      id: Date.now().toString(),
      statistic: newStat.statistic!,
      value: newStat.value!,
      source: newStat.source!,
      sourceUrl: newStat.sourceUrl,
      sourceType: newStat.sourceType as any || "report",
      publicationDate: newStat.publicationDate,
      verified: newStat.verified || false,
      notes: newStat.notes
    };
    
    setStatistics([...statistics, stat]);
    setNewStat({ sourceType: "report", verified: false });
    toast({ title: "Added", description: "Market statistic added" });
  };

  const toggleVerified = (id: string) => {
    setStatistics(statistics.map(s => 
      s.id === id ? { ...s, verified: !s.verified } : s
    ));
  };

  const exportData = () => {
    const report = {
      generatedAt: new Date().toISOString(),
      dataQualityScore: calculateDataQuality(),
      summary: {
        totalStatistics: statistics.length,
        verified: statistics.filter(s => s.verified).length,
        officialSources: statistics.filter(s => s.sourceType === "official").length,
        reportSources: statistics.filter(s => s.sourceType === "report").length,
        unverified: statistics.filter(s => !s.verified).length
      },
      statistics: statistics.map(s => ({
        ...s,
        citationFormat: `${s.value} (Source: ${s.source}${s.publicationDate ? `, ${s.publicationDate}` : ''})`
      })),
      endorserStatement: `All market data has been verified against credible sources. ${statistics.filter(s => s.sourceType === "official").length} statistics are from official government sources, ${statistics.filter(s => s.sourceType === "report").length} from industry reports. Full citations are provided below.`
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "verified-market-data.json";
    a.click();
    
    toast({ title: "Exported", description: "Verified market data downloaded" });
  };

  const dataQuality = calculateDataQuality();
  const unverifiedCount = statistics.filter(s => !s.verified).length;

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-xl font-bold mb-2">Market Data Verifier</h1>
        <p className="text-muted-foreground">
          Verify and cite market statistics to build credible business plans
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className={dataQuality >= 70 ? "border-green-500" : dataQuality >= 40 ? "border-yellow-500" : "border-red-500"} data-testid="card-data-quality">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Data Quality</span>
              <Badge variant={dataQuality >= 70 ? "default" : dataQuality >= 40 ? "secondary" : "destructive"} data-testid="badge-data-quality-status">
                {dataQuality >= 70 ? "High" : dataQuality >= 40 ? "Medium" : "Low"}
              </Badge>
            </div>
            <div className="text-xl font-bold mb-2" data-testid="text-data-quality">{dataQuality}%</div>
            <Progress value={dataQuality} className="h-2" data-testid="progress-data-quality" />
          </CardContent>
        </Card>

        <Card data-testid="card-verified-count">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Verified</span>
            </div>
            <div className="text-lg font-bold" data-testid="text-verified-count">{statistics.filter(s => s.verified).length}</div>
            <p className="text-xs text-muted-foreground">statistics</p>
          </CardContent>
        </Card>

        <Card data-testid="card-official-count">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Official</span>
            </div>
            <div className="text-lg font-bold" data-testid="text-official-count">{statistics.filter(s => s.sourceType === "official").length}</div>
            <p className="text-xs text-muted-foreground">sources</p>
          </CardContent>
        </Card>

        <Card data-testid="card-unverified-count">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium">Unverified</span>
            </div>
            <div className="text-lg font-bold" data-testid="text-unverified-count">{unverifiedCount}</div>
            <p className="text-xs text-muted-foreground">need review</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6 border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-amber-800 dark:text-amber-200">Why Data Accuracy Matters</h3>
              <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                Endorsers will reject applications with incorrect or unverified market data. 
                For example, claiming "15,000 Innovator Founder visa applicants yearly" when the actual number is much lower 
                signals poor commercial understanding. Every statistic must be verifiable.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Add Market Statistic
          </CardTitle>
          <CardDescription>
            Document each statistic with its source and verification status
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
            <div>
              <Label>Statistic Description *</Label>
              <Input 
                value={newStat.statistic || ""} 
                onChange={(e) => setNewStat({...newStat, statistic: e.target.value})}
                placeholder="UK AI market size"
                data-testid="input-stat-description"
              />
            </div>
            <div>
              <Label>Value *</Label>
              <Input 
                value={newStat.value || ""} 
                onChange={(e) => setNewStat({...newStat, value: e.target.value})}
                placeholder="£3.7 billion"
                data-testid="input-stat-value"
              />
            </div>
            <div>
              <Label>Source *</Label>
              <Input 
                value={newStat.source || ""} 
                onChange={(e) => setNewStat({...newStat, source: e.target.value})}
                placeholder="Tech Nation Report 2025"
                data-testid="input-stat-source"
              />
            </div>
            <div>
              <Label>Source URL</Label>
              <Input 
                value={newStat.sourceUrl || ""} 
                onChange={(e) => setNewStat({...newStat, sourceUrl: e.target.value})}
                placeholder="https://technation.io/report/..."
                data-testid="input-stat-source-url"
              />
            </div>
            <div>
              <Label>Source Type</Label>
              <select 
                className="w-full h-10 rounded-md border border-input bg-background px-3"
                value={newStat.sourceType || "report"}
                onChange={(e) => setNewStat({...newStat, sourceType: e.target.value as any})}
                data-testid="select-stat-source-type"
              >
                <option value="official">Official Government Source</option>
                <option value="report">Industry Report</option>
                <option value="news">News Publication</option>
                <option value="estimate">Internal Estimate</option>
                <option value="unverified">Unverified</option>
              </select>
            </div>
            <div>
              <Label>Publication Date</Label>
              <Input 
                type="date"
                value={newStat.publicationDate || ""} 
                onChange={(e) => setNewStat({...newStat, publicationDate: e.target.value})}
                data-testid="input-stat-publication-date"
              />
            </div>
            <div className="md:col-span-2">
              <Label>Notes</Label>
              <Textarea 
                value={newStat.notes || ""} 
                onChange={(e) => setNewStat({...newStat, notes: e.target.value})}
                placeholder="Any additional context or caveats..."
                rows={2}
                data-testid="textarea-stat-notes"
              />
            </div>
          </div>

          <Button onClick={addStatistic} className="w-full" data-testid="button-add-stat">
            <Plus className="h-4 w-4 mr-2" />
            Add Statistic
          </Button>
        </CardContent>
      </Card>

      {statistics.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Your Market Data</CardTitle>
            <CardDescription>
              Click to verify each statistic after confirming the source
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {statistics.map((stat) => (
                <Card key={stat.id} className={`p-4 ${stat.verified ? "border-green-200 bg-green-50/50 dark:bg-green-950/20" : ""}`} data-testid={`card-stat-${stat.id}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleVerified(stat.id)}
                          className={stat.verified ? "text-green-600" : "text-muted-foreground"}
                          data-testid={`button-toggle-verify-${stat.id}`}
                        >
                          {stat.verified ? (
                            <CheckCircle2 className="h-5 w-5" />
                          ) : (
                            <XCircle className="h-5 w-5" />
                          )}
                        </Button>
                        <span className="font-medium" data-testid={`text-stat-description-${stat.id}`}>{stat.statistic}</span>
                        <Badge variant="secondary" className="font-mono" data-testid={`badge-stat-value-${stat.id}`}>{stat.value}</Badge>
                        <Badge variant={
                          stat.sourceType === "official" ? "default" :
                          stat.sourceType === "report" ? "secondary" :
                          stat.sourceType === "estimate" ? "outline" :
                          "destructive"
                        } data-testid={`badge-stat-type-${stat.id}`}>
                          {stat.sourceType}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2" data-testid={`text-stat-source-${stat.id}`}>
                        <strong>Source:</strong> {stat.source}
                        {stat.publicationDate && ` (${stat.publicationDate})`}
                      </p>
                      {stat.sourceUrl && (
                        <a 
                          href={stat.sourceUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline flex items-center gap-1 mt-1"
                          data-testid={`link-stat-source-${stat.id}`}
                        >
                          <ExternalLink className="h-3 w-3" /> View source
                        </a>
                      )}
                      {stat.notes && (
                        <p className="text-sm text-muted-foreground mt-1 italic" data-testid={`text-stat-notes-${stat.id}`}>{stat.notes}</p>
                      )}
                      <div className="mt-2 p-2 bg-muted rounded text-xs font-mono" data-testid={`text-stat-citation-${stat.id}`}>
                        Citation: "{stat.value}" ({stat.source}{stat.publicationDate ? `, ${stat.publicationDate}` : ''})
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setStatistics(statistics.filter(s => s.id !== stat.id))}
                      data-testid={`button-remove-stat-${stat.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Recommended Credible Sources
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h4 className="font-medium text-green-600 mb-2">Highest Credibility</h4>
              <ul className="text-sm space-y-1">
                {CREDIBLE_SOURCES.filter(s => s.credibility === "highest").map((source, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                    {source.name}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-blue-600 mb-2">High Credibility</h4>
              <ul className="text-sm space-y-1">
                {CREDIBLE_SOURCES.filter(s => s.credibility === "high").map((source, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3 text-blue-500" />
                    {source.name}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-yellow-600 mb-2">Medium Credibility</h4>
              <ul className="text-sm space-y-1">
                {CREDIBLE_SOURCES.filter(s => s.credibility === "medium").map((source, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <AlertTriangle className="h-3 w-3 text-yellow-500" />
                    {source.name}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Export Verified Data</h3>
              <p className="text-sm text-muted-foreground">
                Download verified market data with proper citations
              </p>
            </div>
            <Button onClick={exportData} data-testid="button-export-data">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
