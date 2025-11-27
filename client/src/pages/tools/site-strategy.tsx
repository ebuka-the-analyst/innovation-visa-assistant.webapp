import { useState, useCallback, useRef, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { AiToolGuide, AiTraditionalToggle, type ToolConfig } from "@/components/AiToolGuide";
import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { ToolAccessGuard } from "@/components/ToolAccessGuard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { MapPin, CheckCircle2, Building, Users, TrendingUp, PoundSterling, Briefcase, Train } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useWordExport } from "@/hooks/useWordExport";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";

type LocationScore = {
  location: string;
  talentPool: number;
  costEfficiency: number;
  infrastructure: number;
  businessEcosystem: number;
  qualityOfLife: number;
  transportLinks: number;
};

const UK_LOCATIONS: LocationScore[] = [
  { location: "London", talentPool: 95, costEfficiency: 40, infrastructure: 95, businessEcosystem: 98, qualityOfLife: 70, transportLinks: 95 },
  { location: "Manchester", talentPool: 80, costEfficiency: 70, infrastructure: 85, businessEcosystem: 82, qualityOfLife: 78, transportLinks: 85 },
  { location: "Birmingham", talentPool: 75, costEfficiency: 75, infrastructure: 80, businessEcosystem: 75, qualityOfLife: 72, transportLinks: 80 },
  { location: "Edinburgh", talentPool: 78, costEfficiency: 65, infrastructure: 82, businessEcosystem: 78, qualityOfLife: 85, transportLinks: 75 },
  { location: "Bristol", talentPool: 72, costEfficiency: 68, infrastructure: 78, businessEcosystem: 76, qualityOfLife: 82, transportLinks: 72 },
  { location: "Leeds", talentPool: 70, costEfficiency: 78, infrastructure: 75, businessEcosystem: 72, qualityOfLife: 75, transportLinks: 78 },
  { location: "Cambridge", talentPool: 88, costEfficiency: 55, infrastructure: 80, businessEcosystem: 90, qualityOfLife: 88, transportLinks: 70 },
];

const AI_TOOL_CONFIG: ToolConfig = {
  toolId: 'site-strategy',
  toolName: 'Site/Location Strategy',
  agent: 'sterling',
  greeting: "Hello! I'm Sterling, your financial and strategic analyst. I'll help you evaluate UK locations for your business. Let's understand your priorities so I can recommend the best location for your startup.",
  questions: [
    { id: 'industry', question: "What industry is your business in?", hint: "Different sectors thrive in different UK regions", fieldKey: 'industry', fieldType: 'text' },
    { id: 'talent', question: "What skills are most critical for your team?", hint: "Tech talent concentrates in London, Cambridge, Manchester; fintech in London, Edinburgh", fieldKey: 'talentNeeds', fieldType: 'text' },
    { id: 'budget', question: "What is your approximate monthly budget for office space?", hint: "London averages £50-80/sqft, regional cities £20-35/sqft", fieldKey: 'officeBudget', fieldType: 'number' },
    { id: 'lifestyle', question: "How important is quality of life vs business ecosystem?", hint: "Bristol/Edinburgh score high on lifestyle, London/Cambridge on ecosystem", fieldKey: 'lifestylePriority', fieldType: 'text' },
    { id: 'connectivity', question: "How often will you need to travel to London or internationally?", hint: "Consider airport access and high-speed rail connections", fieldKey: 'travelNeeds', fieldType: 'text' },
    { id: 'growth', question: "Where do you see your business in 3 years (team size, office needs)?", hint: "This affects scalability of your location choice", fieldKey: 'growthPlans', fieldType: 'text' },
  ],
  completionMessage: "I've analyzed your requirements. Let me show you the location comparison based on your priorities."
};

const FACTOR_WEIGHTS = {
  talentPool: { label: "Talent Pool", icon: Users, description: "Access to skilled workforce" },
  costEfficiency: { label: "Cost Efficiency", icon: PoundSterling, description: "Office and living costs" },
  infrastructure: { label: "Infrastructure", icon: Building, description: "Business infrastructure quality" },
  businessEcosystem: { label: "Business Ecosystem", icon: Briefcase, description: "Startup and business support" },
  qualityOfLife: { label: "Quality of Life", icon: TrendingUp, description: "Living standards and amenities" },
  transportLinks: { label: "Transport Links", icon: Train, description: "Connectivity and accessibility" },
};

export default function SiteStrategy() {
  const { toast } = useToast();
  const { generateWord } = useWordExport();
  const autoSaveRef = useRef<NodeJS.Timeout | null>(null);
  const [showAutoSave, setShowAutoSave] = useState(false);
  const hideIndicatorRef = useRef<NodeJS.Timeout | null>(null);

  const [mode, setMode] = useState<'ai' | 'traditional'>(() => {
    return (localStorage.getItem('site-strategy-mode') as 'ai' | 'traditional') || 'ai';
  });

  useEffect(() => {
    localStorage.setItem('site-strategy-mode', mode);
  }, [mode]);

  const handleAiComplete = (answers: Record<string, any>) => {
    if (answers.notes) setNotes(answers.notes);
    setMode('traditional');
  };

  const [weights, setWeights] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem("site-strategy-state");
    if (saved) {
      try {
        return JSON.parse(saved).weights || {
          talentPool: 20,
          costEfficiency: 15,
          infrastructure: 15,
          businessEcosystem: 25,
          qualityOfLife: 10,
          transportLinks: 15,
        };
      } catch {}
    }
    return {
      talentPool: 20,
      costEfficiency: 15,
      infrastructure: 15,
      businessEcosystem: 25,
      qualityOfLife: 10,
      transportLinks: 15,
    };
  });

  const [selectedLocation, setSelectedLocation] = useState(() => {
    const saved = localStorage.getItem("site-strategy-state");
    if (saved) {
      try {
        return JSON.parse(saved).selectedLocation || "London";
      } catch {}
    }
    return "London";
  });

  const [notes, setNotes] = useState(() => {
    const saved = localStorage.getItem("site-strategy-state");
    if (saved) {
      try {
        return JSON.parse(saved).notes || "";
      } catch {}
    }
    return "";
  });

  const [activeTab, setActiveTab] = useState("analysis");

  useEffect(() => {
    return () => {
      if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
      if (hideIndicatorRef.current) clearTimeout(hideIndicatorRef.current);
    };
  }, []);

  const triggerAutoSave = useCallback(() => {
    if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
    autoSaveRef.current = setTimeout(() => {
      localStorage.setItem("site-strategy-state", JSON.stringify({ weights, selectedLocation, notes }));
      setShowAutoSave(true);
      if (hideIndicatorRef.current) clearTimeout(hideIndicatorRef.current);
      hideIndicatorRef.current = setTimeout(() => setShowAutoSave(false), 2000);
    }, 500);
  }, [weights, selectedLocation, notes]);

  const calculateScore = (location: LocationScore) => {
    const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
    if (totalWeight === 0) return 0;
    return Math.round(
      (location.talentPool * weights.talentPool +
        location.costEfficiency * weights.costEfficiency +
        location.infrastructure * weights.infrastructure +
        location.businessEcosystem * weights.businessEcosystem +
        location.qualityOfLife * weights.qualityOfLife +
        location.transportLinks * weights.transportLinks) / totalWeight
    );
  };

  const rankedLocations = [...UK_LOCATIONS]
    .map((loc) => ({ ...loc, score: calculateScore(loc) }))
    .sort((a, b) => b.score - a.score);

  const selectedLocationData = UK_LOCATIONS.find((l) => l.location === selectedLocation);
  const radarData = selectedLocationData
    ? Object.entries(FACTOR_WEIGHTS).map(([key, info]) => ({
        factor: info.label,
        value: selectedLocationData[key as keyof LocationScore] as number,
        fullMark: 100,
      }))
    : [];

  const barData = rankedLocations.map((loc) => ({ name: loc.location, score: loc.score }));

  const handleSave = () => {
    localStorage.setItem("site-strategy-state", JSON.stringify({ weights, selectedLocation, notes }));
    toast({ title: "Progress Saved", description: "Your site strategy has been saved" });
  };

  const handleExportWord = () => {
    const sections = [
      { type: "heading" as const, content: "Site/Location Strategy Report", level: 1 as const },
      { type: "paragraph" as const, content: `Selected Location: ${selectedLocation}` },
      { type: "heading" as const, content: "Location Rankings", level: 2 as const },
      { type: "table" as const, tableData: {
        headers: ["Rank", "Location", "Score"],
        rows: rankedLocations.map((loc, i) => [`#${i + 1}`, loc.location, `${loc.score}/100`]),
      }},
      { type: "heading" as const, content: "Factor Weights", level: 2 as const },
      { type: "table" as const, tableData: {
        headers: ["Factor", "Weight"],
        rows: Object.entries(weights).map(([key, val]) => [FACTOR_WEIGHTS[key as keyof typeof FACTOR_WEIGHTS].label, `${val}%`]),
      }},
      { type: "heading" as const, content: "Notes", level: 2 as const },
      { type: "paragraph" as const, content: notes || "No additional notes" },
    ];
    generateWord({ title: "Site Strategy Report", filename: "site-strategy-report", sections });
    toast({ title: "Export Complete", description: "Your report has been downloaded" });
  };

  return (
    <ToolAccessGuard requiredTier="premium" toolName="Site/Location Strategy">
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-2" data-testid="text-tool-title">
                  <MapPin className="w-8 h-8 text-primary" />
                  Site/Location Strategy
                </h1>
                <p className="text-muted-foreground mt-1">Plan optimal office locations and expansion strategy</p>
              </div>
              {showAutoSave && (
                <Badge variant="secondary" className="animate-pulse">
                  <CheckCircle2 className="w-3 h-3 mr-1" /> Auto-saved
                </Badge>
              )}
            </div>

            <ToolUtilityBar
              toolId="site-strategy"
              toolName="Site/Location Strategy"
              onSave={handleSave}
              onExportWord={handleExportWord}
            />

            <div className="flex justify-end mt-4 mb-4">
              <AiTraditionalToggle mode={mode} onModeChange={setMode} />
            </div>

            {mode === 'ai' ? (
              <AiToolGuide config={AI_TOOL_CONFIG} onComplete={handleAiComplete} />
            ) : (
            <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 mb-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    <span className="text-sm text-muted-foreground">Top Location</span>
                  </div>
                  <p className="text-2xl font-bold mt-1" data-testid="text-top-location">{rankedLocations[0]?.location}</p>
                  <p className="text-sm text-muted-foreground">Score: {rankedLocations[0]?.score}/100</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2">
                    <Building className="w-5 h-5 text-green-500" />
                    <span className="text-sm text-muted-foreground">Selected</span>
                  </div>
                  <p className="text-2xl font-bold mt-1">{selectedLocation}</p>
                  <p className="text-sm text-muted-foreground">
                    Rank: #{rankedLocations.findIndex((l) => l.location === selectedLocation) + 1}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-orange-500" />
                    <span className="text-sm text-muted-foreground">Locations Analyzed</span>
                  </div>
                  <p className="text-2xl font-bold mt-1">{UK_LOCATIONS.length}</p>
                </CardContent>
              </Card>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6">
                <TabsTrigger value="analysis" data-testid="tab-analysis">Analysis</TabsTrigger>
                <TabsTrigger value="comparison" data-testid="tab-comparison">Comparison</TabsTrigger>
                <TabsTrigger value="weights" data-testid="tab-weights">Factor Weights</TabsTrigger>
              </TabsList>

              <TabsContent value="analysis">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Location Profile</CardTitle>
                      <CardDescription>Detailed analysis of {selectedLocation}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-4">
                        <Label>Select Location</Label>
                        <Select value={selectedLocation} onValueChange={(v) => { setSelectedLocation(v); triggerAutoSave(); }}>
                          <SelectTrigger className="mt-2" data-testid="select-location">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {UK_LOCATIONS.map((loc) => (
                              <SelectItem key={loc.location} value={loc.location}>{loc.location}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <ResponsiveContainer width="100%" height={300}>
                        <RadarChart data={radarData}>
                          <PolarGrid />
                          <PolarAngleAxis dataKey="factor" tick={{ fontSize: 11 }} />
                          <PolarRadiusAxis angle={30} domain={[0, 100]} />
                          <Radar
                            name={selectedLocation}
                            dataKey="value"
                            stroke="#ffa536"
                            fill="#ffa536"
                            fillOpacity={0.5}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Factor Breakdown</CardTitle>
                      <CardDescription>Detailed scores for {selectedLocation}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {selectedLocationData && Object.entries(FACTOR_WEIGHTS).map(([key, info]) => {
                        const Icon = info.icon;
                        const value = selectedLocationData[key as keyof LocationScore] as number;
                        return (
                          <div key={key}>
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2">
                                <Icon className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm font-medium">{info.label}</span>
                              </div>
                              <span className="text-sm font-bold">{value}/100</span>
                            </div>
                            <Progress value={value} className="h-2" />
                            <p className="text-xs text-muted-foreground mt-1">{info.description}</p>
                          </div>
                        );
                      })}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="comparison">
                <Card>
                  <CardHeader>
                    <CardTitle>Location Comparison</CardTitle>
                    <CardDescription>Compare all UK locations based on your weighted criteria</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart data={barData} layout="vertical">
                        <XAxis type="number" domain={[0, 100]} />
                        <YAxis dataKey="name" type="category" width={100} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="score" fill="#ffa536" name="Weighted Score" />
                      </BarChart>
                    </ResponsiveContainer>

                    <div className="mt-6">
                      <Label>Strategic Notes</Label>
                      <Textarea
                        value={notes}
                        onChange={(e) => { setNotes(e.target.value); triggerAutoSave(); }}
                        placeholder="Add notes about your location strategy..."
                        className="mt-2"
                        data-testid="textarea-notes"
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="weights">
                <Card>
                  <CardHeader>
                    <CardTitle>Customize Factor Weights</CardTitle>
                    <CardDescription>Adjust importance of each factor to match your priorities</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {Object.entries(FACTOR_WEIGHTS).map(([key, info]) => {
                      const Icon = info.icon;
                      return (
                        <div key={key}>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Icon className="w-4 h-4 text-primary" />
                              <span className="font-medium">{info.label}</span>
                            </div>
                            <Badge variant="outline">{weights[key]}%</Badge>
                          </div>
                          <Slider
                            value={[weights[key]]}
                            onValueChange={([v]) => {
                              setWeights((prev) => ({ ...prev, [key]: v }));
                              triggerAutoSave();
                            }}
                            max={50}
                            step={5}
                            data-testid={`slider-${key}`}
                          />
                          <p className="text-xs text-muted-foreground mt-1">{info.description}</p>
                        </div>
                      );
                    })}

                    <div className="pt-4 border-t">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Total Weight</span>
                        <Badge variant={Object.values(weights).reduce((a, b) => a + b, 0) === 100 ? "default" : "destructive"}>
                          {Object.values(weights).reduce((a, b) => a + b, 0)}%
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Weights should ideally sum to 100% for balanced comparison
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
            </>
            )}
          </div>
        </div>
      </div>
    </ToolAccessGuard>
  );
}
