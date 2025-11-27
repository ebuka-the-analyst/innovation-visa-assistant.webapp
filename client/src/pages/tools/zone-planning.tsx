import { useState, useCallback, useRef, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { ToolAccessGuard } from "@/components/ToolAccessGuard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { MapPin, CheckCircle2, Building, Users, TrendingUp, PoundSterling, Globe, Target } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useWordExport } from "@/hooks/useWordExport";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";
import { AiToolGuide, AiTraditionalToggle, type ToolConfig } from "@/components/AiToolGuide";

const AI_TOOL_CONFIG: ToolConfig = {
  toolId: "zone-planning",
  agentId: "atlas",
  agentName: "Atlas",
  agentTitle: "Growth & Strategy Expert",
  greeting: "Hello! I'm Atlas, your growth strategy specialist. Let me help you evaluate UK business zones and find the optimal location for your innovative venture.",
  questions: [
    {
      id: "businessType",
      text: "What type of business are you launching? What industry sector and technology focus?",
      fieldKey: "businessType",
      minLength: 60,
      placeholder: "Describe your business type, industry sector, technology focus, and key operations..."
    },
    {
      id: "talentNeeds",
      text: "What talent and skills do you need to hire? How important is access to specialist talent pools?",
      fieldKey: "talentNeeds",
      minLength: 60,
      placeholder: "Describe your hiring needs, required skills, and talent access priorities..."
    },
    {
      id: "fundingNeeds",
      text: "What are your funding requirements? How important is proximity to investors and VCs?",
      fieldKey: "fundingNeeds",
      minLength: 60,
      placeholder: "Share your funding needs, investor access requirements, and networking priorities..."
    },
    {
      id: "costSensitivity",
      text: "How cost-sensitive is your business? What's your budget for office space and operations?",
      fieldKey: "costSensitivity",
      minLength: 50,
      placeholder: "Describe your budget constraints and cost priorities for location selection..."
    },
    {
      id: "networkNeeds",
      text: "How important is access to industry networks, accelerators, and ecosystem support?",
      fieldKey: "networkNeeds",
      minLength: 50,
      placeholder: "Describe your networking needs and ecosystem access priorities..."
    },
    {
      id: "qualityOfLife",
      text: "How important is quality of life for you and your team? What lifestyle factors matter?",
      fieldKey: "qualityOfLife",
      minLength: 50,
      placeholder: "Describe quality of life priorities: housing, transport, culture, family considerations..."
    },
    {
      id: "governmentSupport",
      text: "Are you interested in government incentives, tax benefits, or enterprise zone advantages?",
      fieldKey: "governmentSupport",
      minLength: 50,
      placeholder: "Describe your interest in grants, tax incentives, or special zone benefits..."
    }
  ]
};

type Zone = {
  id: string;
  name: string;
  type: "tech-hub" | "enterprise-zone" | "innovation-district" | "free-port" | "standard";
  region: string;
  benefits: string[];
  considerations: string[];
  suitability: number;
  selected: boolean;
  notes: string;
};

const UK_ZONES: Zone[] = [
  {
    id: "1", name: "London Tech City (Silicon Roundabout)", type: "tech-hub", region: "London",
    benefits: ["Access to VC funding", "Talent pool", "Networking opportunities", "Global visibility"],
    considerations: ["High costs", "Competitive market", "Office space premium"],
    suitability: 90, selected: false, notes: ""
  },
  {
    id: "2", name: "Manchester Digital Hub", type: "tech-hub", region: "North West",
    benefits: ["Growing tech scene", "Lower costs than London", "BBC & MediaCity", "Strong universities"],
    considerations: ["Smaller VC presence", "Less international profile"],
    suitability: 80, selected: false, notes: ""
  },
  {
    id: "3", name: "Cambridge Science Park", type: "innovation-district", region: "East",
    benefits: ["World-class research", "University partnerships", "Biotech cluster", "IP expertise"],
    considerations: ["High property costs", "Specialized focus", "Limited space"],
    suitability: 85, selected: false, notes: ""
  },
  {
    id: "4", name: "Edinburgh Tech Quarter", type: "tech-hub", region: "Scotland",
    benefits: ["Strong fintech scene", "University talent", "Scottish Enterprise support", "Quality of life"],
    considerations: ["Smaller market", "Distance from London investors"],
    suitability: 75, selected: false, notes: ""
  },
  {
    id: "5", name: "Birmingham Innovation District", type: "innovation-district", region: "West Midlands",
    benefits: ["HS2 connectivity", "Growing scene", "Lower costs", "Diverse talent"],
    considerations: ["Emerging ecosystem", "Less established networks"],
    suitability: 70, selected: false, notes: ""
  },
  {
    id: "6", name: "Bristol & Bath Tech Cluster", type: "tech-hub", region: "South West",
    benefits: ["Creative industries", "Aerospace heritage", "University links", "Quality of life"],
    considerations: ["Smaller scale", "Transport links"],
    suitability: 75, selected: false, notes: ""
  },
  {
    id: "7", name: "Teesside Freeport", type: "free-port", region: "North East",
    benefits: ["Tax benefits", "Customs simplification", "Government investment", "Lower costs"],
    considerations: ["Remote location", "Limited services", "Specific industries"],
    suitability: 60, selected: false, notes: ""
  },
];

const ZONE_TYPE_INFO = {
  "tech-hub": { label: "Tech Hub", color: "bg-blue-500" },
  "enterprise-zone": { label: "Enterprise Zone", color: "bg-green-500" },
  "innovation-district": { label: "Innovation District", color: "bg-purple-500" },
  "free-port": { label: "Freeport", color: "bg-orange-500" },
  "standard": { label: "Standard", color: "bg-gray-500" },
};

type PlanningFactors = {
  talentAccess: number;
  costEfficiency: number;
  networkAccess: number;
  fundingProximity: number;
  qualityOfLife: number;
  govtSupport: number;
};

export default function ZonePlanning() {
  const { toast } = useToast();
  const { generateWord } = useWordExport();
  const autoSaveRef = useRef<NodeJS.Timeout | null>(null);
  const [showAutoSave, setShowAutoSave] = useState(false);
  const hideIndicatorRef = useRef<NodeJS.Timeout | null>(null);

  const [mode, setMode] = useState<'ai' | 'traditional'>(() => {
    return (localStorage.getItem('zone-planning-mode') as 'ai' | 'traditional') || 'ai';
  });

  useEffect(() => {
    localStorage.setItem('zone-planning-mode', mode);
  }, [mode]);

  const handleAiComplete = useCallback((_answers: Record<string, string>) => {
    setMode('traditional');
    toast({
      title: "AI Guidance Complete",
      description: "Your zone preferences have been captured. Now explore and compare UK zones."
    });
  }, [toast]);

  const [zones, setZones] = useState<Zone[]>(() => {
    const saved = localStorage.getItem("zone-planning-state");
    if (saved) {
      try {
        return JSON.parse(saved).zones || UK_ZONES;
      } catch {}
    }
    return UK_ZONES;
  });

  const [factors, setFactors] = useState<PlanningFactors>(() => {
    const saved = localStorage.getItem("zone-planning-state");
    if (saved) {
      try {
        return JSON.parse(saved).factors || {
          talentAccess: 80, costEfficiency: 60, networkAccess: 70,
          fundingProximity: 85, qualityOfLife: 50, govtSupport: 60,
        };
      } catch {}
    }
    return {
      talentAccess: 80, costEfficiency: 60, networkAccess: 70,
      fundingProximity: 85, qualityOfLife: 50, govtSupport: 60,
    };
  });

  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("zones");

  useEffect(() => {
    return () => {
      if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
      if (hideIndicatorRef.current) clearTimeout(hideIndicatorRef.current);
    };
  }, []);

  const triggerAutoSave = useCallback(() => {
    if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
    autoSaveRef.current = setTimeout(() => {
      localStorage.setItem("zone-planning-state", JSON.stringify({ zones, factors }));
      setShowAutoSave(true);
      if (hideIndicatorRef.current) clearTimeout(hideIndicatorRef.current);
      hideIndicatorRef.current = setTimeout(() => setShowAutoSave(false), 2000);
    }, 500);
  }, [zones, factors]);

  const toggleZoneSelection = (id: string) => {
    const newZones = zones.map((z) => (z.id === id ? { ...z, selected: !z.selected } : z));
    setZones(newZones);
    triggerAutoSave();
  };

  const updateZoneNotes = (id: string, notes: string) => {
    const newZones = zones.map((z) => (z.id === id ? { ...z, notes } : z));
    setZones(newZones);
    triggerAutoSave();
  };

  const selectedZones = zones.filter((z) => z.selected);
  const topZone = [...zones].sort((a, b) => b.suitability - a.suitability)[0];

  const radarData = [
    { factor: "Talent", value: factors.talentAccess, fullMark: 100 },
    { factor: "Cost", value: factors.costEfficiency, fullMark: 100 },
    { factor: "Network", value: factors.networkAccess, fullMark: 100 },
    { factor: "Funding", value: factors.fundingProximity, fullMark: 100 },
    { factor: "Life Quality", value: factors.qualityOfLife, fullMark: 100 },
    { factor: "Govt Support", value: factors.govtSupport, fullMark: 100 },
  ];

  const handleSave = () => {
    localStorage.setItem("zone-planning-state", JSON.stringify({ zones, factors }));
    toast({ title: "Progress Saved", description: "Your zone planning has been saved" });
  };

  const handleExportWord = () => {
    const sections = [
      { type: "heading" as const, content: "Zone Planning Report", level: 1 as const },
      { type: "paragraph" as const, content: `Top Recommended Zone: ${topZone.name}` },
      { type: "paragraph" as const, content: `Selected Zones: ${selectedZones.length}` },
      { type: "heading" as const, content: "Zone Analysis", level: 2 as const },
      { type: "table" as const, tableData: {
        headers: ["Zone", "Type", "Region", "Suitability", "Selected"],
        rows: zones.map((z) => [z.name, ZONE_TYPE_INFO[z.type].label, z.region, `${z.suitability}%`, z.selected ? "Yes" : "No"]),
      }},
      { type: "heading" as const, content: "Priority Factors", level: 2 as const },
      { type: "table" as const, tableData: {
        headers: ["Factor", "Priority (%)"],
        rows: Object.entries(factors).map(([key, val]) => [key.replace(/([A-Z])/g, " $1").trim(), `${val}%`]),
      }},
    ];
    generateWord({ title: "Zone Planning Report", filename: "zone-planning-report", sections });
    toast({ title: "Export Complete", description: "Your report has been downloaded" });
  };

  return (
    <ToolAccessGuard requiredTier="premium" toolName="Zone Planning">
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-2" data-testid="text-tool-title">
                  <MapPin className="w-8 h-8 text-primary" />
                  Zone Planning
                </h1>
                <p className="text-muted-foreground mt-1">Plan for UK tech zones and expansion areas</p>
              </div>
              <div className="flex items-center gap-3">
                {showAutoSave && (
                  <Badge variant="secondary" className="animate-pulse">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> Auto-saved
                  </Badge>
                )}
                <AiTraditionalToggle
                  mode={mode}
                  onModeChange={setMode}
                  aiLabel="AI-Guided"
                  traditionalLabel="Traditional Form"
                />
              </div>
            </div>

            {mode === 'ai' ? (
              <AiToolGuide config={AI_TOOL_CONFIG} onComplete={handleAiComplete} />
            ) : (
              <>
            <ToolUtilityBar
              toolId="zone-planning"
              toolName="Zone Planning"
              onSave={handleSave}
              onExportWord={handleExportWord}
            />

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6 mb-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" />
                    <span className="text-sm text-muted-foreground">Top Zone</span>
                  </div>
                  <p className="text-lg font-bold mt-1 truncate" data-testid="text-top-zone">{topZone.name}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <span className="text-sm text-muted-foreground">Selected</span>
                  </div>
                  <p className="text-2xl font-bold mt-1">{selectedZones.length}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2">
                    <Globe className="w-5 h-5 text-orange-500" />
                    <span className="text-sm text-muted-foreground">Zones Analyzed</span>
                  </div>
                  <p className="text-2xl font-bold mt-1">{zones.length}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-purple-500" />
                    <span className="text-sm text-muted-foreground">Avg Suitability</span>
                  </div>
                  <p className="text-2xl font-bold mt-1">
                    {Math.round(zones.reduce((sum, z) => sum + z.suitability, 0) / zones.length)}%
                  </p>
                </CardContent>
              </Card>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6">
                <TabsTrigger value="zones" data-testid="tab-zones">All Zones</TabsTrigger>
                <TabsTrigger value="compare" data-testid="tab-compare">Compare</TabsTrigger>
                <TabsTrigger value="priorities" data-testid="tab-priorities">My Priorities</TabsTrigger>
              </TabsList>

              <TabsContent value="zones">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {zones.map((zone) => (
                    <Card
                      key={zone.id}
                      className={`cursor-pointer transition-all ${zone.selected ? "ring-2 ring-primary" : ""}`}
                      onClick={() => setSelectedZoneId(selectedZoneId === zone.id ? null : zone.id)}
                    >
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold">{zone.name}</h3>
                              <Badge className={ZONE_TYPE_INFO[zone.type].color}>{ZONE_TYPE_INFO[zone.type].label}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{zone.region}</p>
                          </div>
                          <Checkbox
                            checked={zone.selected}
                            onCheckedChange={() => toggleZoneSelection(zone.id)}
                            onClick={(e) => e.stopPropagation()}
                            data-testid={`checkbox-zone-${zone.id}`}
                          />
                        </div>

                        <div className="mb-4">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm">Suitability Score</span>
                            <span className="text-sm font-bold">{zone.suitability}%</span>
                          </div>
                          <Progress value={zone.suitability} className="h-2" />
                        </div>

                        {selectedZoneId === zone.id && (
                          <div className="pt-4 border-t space-y-4">
                            <div>
                              <h4 className="text-sm font-medium text-green-600 mb-2">Benefits</h4>
                              <ul className="text-sm space-y-1">
                                {zone.benefits.map((b, i) => (
                                  <li key={i} className="flex items-center gap-2">
                                    <CheckCircle2 className="w-3 h-3 text-green-500" />
                                    {b}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-orange-600 mb-2">Considerations</h4>
                              <ul className="text-sm space-y-1">
                                {zone.considerations.map((c, i) => (
                                  <li key={i} className="flex items-center gap-2">
                                    <Circle className="w-3 h-3 text-orange-500" />
                                    {c}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <Label>Notes</Label>
                              <Textarea
                                value={zone.notes}
                                onChange={(e) => updateZoneNotes(zone.id, e.target.value)}
                                placeholder="Add your notes..."
                                className="mt-1"
                                onClick={(e) => e.stopPropagation()}
                                data-testid={`textarea-notes-${zone.id}`}
                              />
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="compare">
                <Card>
                  <CardHeader>
                    <CardTitle>Zone Comparison</CardTitle>
                    <CardDescription>
                      {selectedZones.length > 0 
                        ? `Comparing ${selectedZones.length} selected zone(s)`
                        : "Select zones to compare them"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {selectedZones.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>Select zones from the "All Zones" tab to compare them here</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-2 px-2">Zone</th>
                              <th className="text-left py-2 px-2">Type</th>
                              <th className="text-left py-2 px-2">Region</th>
                              <th className="text-left py-2 px-2">Suitability</th>
                              <th className="text-left py-2 px-2">Key Benefits</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedZones.map((zone) => (
                              <tr key={zone.id} className="border-b">
                                <td className="py-2 px-2 font-medium">{zone.name}</td>
                                <td className="py-2 px-2">
                                  <Badge className={ZONE_TYPE_INFO[zone.type].color}>{ZONE_TYPE_INFO[zone.type].label}</Badge>
                                </td>
                                <td className="py-2 px-2">{zone.region}</td>
                                <td className="py-2 px-2">
                                  <div className="flex items-center gap-2">
                                    <Progress value={zone.suitability} className="h-2 w-16" />
                                    <span>{zone.suitability}%</span>
                                  </div>
                                </td>
                                <td className="py-2 px-2 text-muted-foreground">{zone.benefits.slice(0, 2).join(", ")}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="priorities">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Your Priority Factors</CardTitle>
                      <CardDescription>Adjust the importance of each factor</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {Object.entries(factors).map(([key, value]) => (
                        <div key={key}>
                          <div className="flex justify-between items-center mb-2">
                            <Label className="capitalize">{key.replace(/([A-Z])/g, " $1").trim()}</Label>
                            <Badge variant="outline">{value}%</Badge>
                          </div>
                          <Input
                            type="range"
                            min="0"
                            max="100"
                            value={value}
                            onChange={(e) => {
                              setFactors({ ...factors, [key]: parseInt(e.target.value) });
                              triggerAutoSave();
                            }}
                            data-testid={`slider-${key}`}
                          />
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Priority Profile</CardTitle>
                      <CardDescription>Visual representation of your priorities</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <RadarChart data={radarData}>
                          <PolarGrid />
                          <PolarAngleAxis dataKey="factor" />
                          <PolarRadiusAxis angle={30} domain={[0, 100]} />
                          <Radar
                            name="Priorities"
                            dataKey="value"
                            stroke="#ffa536"
                            fill="#ffa536"
                            fillOpacity={0.5}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
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
