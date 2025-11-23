import { Card } from "@/components/ui/card";
import { AuthHeader } from "@/components/AuthHeader";
import { ToolNavigation } from "@/components/ToolNavigation";
import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { FileUploadButton } from "@/components/FileUploadButton";
import { FileList } from "@/components/FileList";
import { fileUploadConfigs } from "@/lib/fileUploadConfigs";
import { useState, useEffect } from "react";
import { Globe, Users, TrendingUp, AlertCircle, Award, Target } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, LineChart, Line } from "recharts";

// UK Innovator Founder Visa Context (November 2025)
// Scalability Criterion: Large market opportunity demonstrates growth potential
// Viability Criterion: Addressable market supports business sustainability

export default function MarketSizing() {
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [savedDate, setSavedDate] = useState("");
  const [tam, setTam] = useState(5000000000); // Total Addressable Market
  const [sam, setSam] = useState(500000000); // Serviceable Addressable Market
  const [som, setSom] = useState(50000000); // Serviceable Obtainable Market
  const [targetSegment, setTargetSegment] = useState("UK SMBs using cloud software");
  const [growthRate, setGrowthRate] = useState(25);

  const saveProgress = () => {
    localStorage.setItem('marketSizingFiles', JSON.stringify(uploadedFiles));
    localStorage.setItem('marketSizingData', JSON.stringify({ tam, sam, som, targetSegment, growthRate }));
    localStorage.setItem('marketSizingDate', new Date().toLocaleDateString());
    setSavedDate(new Date().toLocaleDateString());
  };

  const handleFileUpload = (file: any) => setUploadedFiles(prev => [...prev, file]);
  const handleRemoveFile = (id: string) => setUploadedFiles(prev => prev.filter(f => f.id !== id));

  const getMarketHealth = (): { score: number; grade: string } => {
    let score = 0;
    
    if (tam >= 1000000000) score += 30;
    else if (tam >= 500000000) score += 20;
    else score += 10;
    
    const samRatio = sam / tam;
    if (samRatio >= 0.1) score += 25;
    else if (samRatio >= 0.05) score += 15;
    else score += 5;
    
    const somRatio = som / sam;
    if (somRatio >= 0.1) score += 25;
    else if (somRatio >= 0.05) score += 15;
    else score += 5;
    
    if (growthRate >= 30) score += 20;
    else if (growthRate >= 20) score += 15;
    else score += 5;
    
    let grade = 'F - Small';
    if (score >= 85) grade = 'A - Huge';
    else if (score >= 70) grade = 'B - Large';
    else if (score >= 55) grade = 'C - Moderate';
    else if (score >= 40) grade = 'D - Limited';
    
    return { score, grade };
  };

  const exportReport = () => {
    const { score, grade } = getMarketHealth();
    const content = `UK INNOVATOR FOUNDER VISA - MARKET SIZING
Generated: ${new Date().toLocaleDateString()}

Market Opportunity: ${score}% (${grade})

MARKET SIZING (TAM/SAM/SOM):
Total Addressable Market (TAM): £${(tam / 1000000000).toFixed(2)}B
Serviceable Addressable Market (SAM): £${(sam / 1000000).toFixed(0)}M
Serviceable Obtainable Market (SOM): £${(som / 1000000).toFixed(0)}M

SAM as % of TAM: ${((sam / tam) * 100).toFixed(1)}%
SOM as % of SAM: ${((som / sam) * 100).toFixed(1)}%

TARGET SEGMENT:
${targetSegment}

MARKET GROWTH:
Annual Growth Rate: ${growthRate}%

INNOVATOR FOUNDER VISA CONTEXT:
Scalability: ${score >= 70 ? `Large market opportunity (${score}%) demonstrates strong growth potential` : 'Market size should exceed £500M SAM for strong scalability narrative'}
Viability: ${sam >= 100000000 ? 'Addressable market supports sustainable business model' : 'Market opportunity may limit viability'}

${score >= 75 ? '✅ Market size supports visa criteria' : '⚠️ Market opportunity needs strengthening'}

Formula: Market Health = TAM Size (30) + SAM Ratio (25) + SOM Ratio (25) + Growth Rate (20)
GOV.UK: Innovator Founder Visa scalability criterion (November 2025)
`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'innovator-founder-market-sizing.txt';
    a.click();
  };

  const getSmartRecommendations = () => {
    const tips: string[] = [];
    if (tam < 1000000000) tips.push("⚠️ TAM <£1B - consider broader market definition for scalability");
    if (sam < 100000000) tips.push("📊 SAM <£100M - validate addressable market size");
    if (som < 10000000) tips.push("💡 SOM <£10M - increase obtainable market estimate");
    if (growthRate < 20) tips.push("🚨 Growth rate <20% - highlight faster-growing segments");
    const { score } = getMarketHealth();
    if (score >= 80) tips.push("✅ Strong market opportunity supports scalability criterion");
    return tips.length ? tips : ["✅ Market sizing is solid"];
  };

  const getMarketFunnel = () => [
    { stage: "TAM", value: tam / 1000000, description: "Total Market" },
    { stage: "SAM", value: sam / 1000000, description: "Addressable" },
    { stage: "SOM", value: som / 1000000, description: "Obtainable" }
  ];

  const getGrowthProjection = () => {
    const years = [0, 1, 2, 3, 4, 5];
    return years.map(year => ({
      year: year === 0 ? 'Today' : `Year ${year}`,
      sam: Math.round((sam / 1000000) * Math.pow(1 + growthRate / 100, year)),
      som: Math.round((som / 1000000) * Math.pow(1 + growthRate / 100, year))
    }));
  };

  const getMarketSegments = () => [
    { segment: "UK", size: sam * 0.3 },
    { segment: "EU", size: sam * 0.4 },
    { segment: "US", size: sam * 0.2 },
    { segment: "Rest of World", size: sam * 0.1 }
  ];

  const getCaptureRate = () => {
    const years = Array.from({ length: 5 }, (_, i) => i + 1);
    return years.map(year => ({
      year: `Year ${year}`,
      target: (som / sam) * 100 * (1 + year * 0.5),
      actual: (som / sam) * 100 * (0.8 + year * 0.4)
    }));
  };

  useEffect(() => {
    const s = localStorage.getItem('marketSizingData');
    if (s) {
      const data = JSON.parse(s);
      setTam(data.tam || 5000000000);
      setSam(data.sam || 500000000);
      setSom(data.som || 50000000);
      setTargetSegment(data.targetSegment || "");
      setGrowthRate(data.growthRate || 25);
    }
    const f = localStorage.getItem('marketSizingFiles');
    if (f) setUploadedFiles(JSON.parse(f));
    const d = localStorage.getItem('marketSizingDate');
    if (d) setSavedDate(d);
  }, []);

  const { score: opportunityScore, grade } = getMarketHealth();
  const COLORS = ['#ffa536', '#11b6e9', '#10b981', '#ef4444'];

  return (
    <>
      <AuthHeader />
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        <ToolNavigation />
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Market Sizing</h1>
          <p className="text-muted-foreground mb-6">Quantify market opportunity (Innovator Founder Visa)</p>

          <ToolUtilityBar toolId="market-size" toolName="Market Sizing" onSave={saveProgress} onExport={exportReport} getSerializedState={() => ({ uploadedFiles, tam, sam, som, targetSegment, growthRate, savedDate })} />

          {savedDate && <Alert className="mb-6 border-green-200 bg-green-50 dark:bg-green-950"><AlertCircle className="h-4 w-4 text-green-600" /><AlertDescription className="text-green-700 dark:text-green-300">Last saved: {savedDate}</AlertDescription></Alert>}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <Award className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">Market Opportunity</span>
              </div>
              <p className="text-3xl font-bold">{opportunityScore}%</p>
              <p className="text-xs text-muted-foreground mt-1">{grade}</p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <Globe className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">TAM</span>
              </div>
              <p className="text-3xl font-bold">£{(tam / 1000000000).toFixed(1)}B</p>
              <p className="text-xs text-muted-foreground mt-1">Total market</p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <Target className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">SAM</span>
              </div>
              <p className="text-3xl font-bold">£{Math.round(sam / 1000000)}M</p>
              <p className="text-xs text-muted-foreground mt-1">Addressable</p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">SOM</span>
              </div>
              <p className="text-3xl font-bold">£{Math.round(som / 1000000)}M</p>
              <p className="text-xs text-muted-foreground mt-1">Obtainable</p>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Market Funnel (TAM/SAM/SOM)</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={getMarketFunnel()} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" label={{ value: '£ Millions', position: 'insideBottom', offset: -5 }} />
                  <YAxis type="category" dataKey="stage" width={60} />
                  <Tooltip formatter={(value: number) => `£${value.toFixed(0)}M`} />
                  <Bar dataKey="value" fill="#ffa536">
                    {getMarketFunnel().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">5-Year Growth Projection</h3>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={getGrowthProjection()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis label={{ value: '£ Millions', angle: -90, position: 'insideLeft' }} />
                  <Tooltip formatter={(value: number) => `£${value}M`} />
                  <Legend />
                  <Area type="monotone" dataKey="sam" stackId="1" stroke="#ffa536" fill="#ffa536" fillOpacity={0.6} name="SAM" />
                  <Area type="monotone" dataKey="som" stackId="2" stroke="#10b981" fill="#10b981" fillOpacity={0.6} name="SOM" />
                </AreaChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Geographic Distribution</h3>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={getMarketSegments()} dataKey="size" nameKey="segment" cx="50%" cy="50%" outerRadius={80} label={(entry) => `£${Math.round(entry.size / 1000000)}M`}>
                    {getMarketSegments().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `£${Math.round(value / 1000000)}M`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Market Capture Rate</h3>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={getCaptureRate()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis label={{ value: '% of SAM', angle: -90, position: 'insideLeft' }} />
                  <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
                  <Legend />
                  <Line type="monotone" dataKey="target" stroke="#ffa536" strokeWidth={2} name="Target" />
                  <Line type="monotone" dataKey="actual" stroke="#10b981" strokeWidth={2} name="Realistic" />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </div>

          <Card className="p-6 mb-6">
            <h3 className="font-semibold mb-4">Recommendations</h3>
            <div className="space-y-3">
              {getSmartRecommendations().map((tip, i) => {
                const isCritical = tip.includes('🚨');
                const isWarning = tip.includes('⚠️');
                return (
                  <Alert key={i} className={isCritical ? "border-red-200 bg-red-50 dark:bg-red-950" : isWarning ? "border-orange-200 bg-orange-50 dark:bg-orange-950" : "border-blue-200 bg-blue-50 dark:bg-blue-950"}>
                    <AlertDescription className={isCritical ? "text-red-700 dark:text-red-300" : isWarning ? "text-orange-700 dark:text-orange-300" : "text-blue-700 dark:text-blue-300"}>{tip}</AlertDescription>
                  </Alert>
                );
              })}
            </div>
          </Card>

          <Card className="p-6 mb-6">
            <h3 className="font-semibold mb-4">Market Sizing Inputs</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="text-sm font-medium block mb-2">TAM - Total Addressable Market (£)</label>
                <Input type="number" value={tam} onChange={(e) => setTam(Number(e.target.value))} data-testid="input-tam" />
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">SAM - Serviceable Addressable Market (£)</label>
                <Input type="number" value={sam} onChange={(e) => setSam(Number(e.target.value))} data-testid="input-sam" />
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">SOM - Serviceable Obtainable Market (£)</label>
                <Input type="number" value={som} onChange={(e) => setSom(Number(e.target.value))} data-testid="input-som" />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 mb-4">
              <div>
                <label className="text-sm font-medium block mb-2">Target Segment Description</label>
                <Textarea value={targetSegment} onChange={(e) => setTargetSegment(e.target.value)} placeholder="Define your ideal customer segment..." rows={3} data-testid="textarea-segment" />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium block mb-2">Annual Market Growth Rate: {growthRate}%</label>
              <Slider value={[growthRate]} onValueChange={(v) => setGrowthRate(v[0])} max={100} step={5} data-testid="slider-growth" />
            </div>
          </Card>

          <Card className="p-6 mb-6">
            <h3 className="font-semibold mb-4">Upload Market Research</h3>
            <FileUploadButton onFileSelected={handleFileUpload} config={fileUploadConfigs.companyDocuments} />
            {uploadedFiles.length > 0 && (
              <div className="mt-4">
                <FileList files={uploadedFiles} onRemove={handleRemoveFile} />
              </div>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
