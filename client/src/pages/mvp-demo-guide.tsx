import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Video, Code, Lightbulb, CheckCircle2, ExternalLink, 
  Zap, Monitor, Smartphone, Clock, Download, AlertTriangle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MVPFeature {
  id: string;
  name: string;
  description: string;
  status: "planned" | "in-progress" | "complete" | "demo-ready";
  demoable: boolean;
}

interface DemoAsset {
  id: string;
  type: "video" | "screenshot" | "prototype" | "documentation";
  title: string;
  url?: string;
  description: string;
  quality: "draft" | "polished";
}

export default function MVPDemoGuide() {
  const { toast } = useToast();
  
  const [features, setFeatures] = useState<MVPFeature[]>([]);
  const [assets, setAssets] = useState<DemoAsset[]>([]);
  
  const [newFeature, setNewFeature] = useState<Partial<MVPFeature>>({ status: "planned", demoable: false });
  const [newAsset, setNewAsset] = useState<Partial<DemoAsset>>({ type: "video", quality: "draft" });

  const [mvpChecklist] = useState([
    { id: "1", label: "Core value proposition is clearly demonstrable", category: "essential" },
    { id: "2", label: "User can complete at least one key workflow end-to-end", category: "essential" },
    { id: "3", label: "UI is clean and professional (doesn't look like a hackathon project)", category: "essential" },
    { id: "4", label: "Demo can be accessed via a live URL", category: "essential" },
    { id: "5", label: "Loading times are acceptable (<3 seconds)", category: "essential" },
    { id: "6", label: "No obvious bugs or crashes during demo flow", category: "essential" },
    { id: "7", label: "Mobile responsive or has dedicated mobile view", category: "nice-to-have" },
    { id: "8", label: "Has sample data that demonstrates real use case", category: "essential" },
    { id: "9", label: "Error states are handled gracefully", category: "nice-to-have" },
    { id: "10", label: "Can explain technical architecture if asked", category: "nice-to-have" },
  ]);

  const [completedChecks, setCompletedChecks] = useState<string[]>([]);

  const calculateMVPReadiness = () => {
    const essentialChecks = mvpChecklist.filter(c => c.category === "essential");
    const completedEssential = essentialChecks.filter(c => completedChecks.includes(c.id)).length;
    const demoableFeatures = features.filter(f => f.demoable).length;
    const polishedAssets = assets.filter(a => a.quality === "polished").length;
    
    let score = 0;
    score += (completedEssential / essentialChecks.length) * 50;
    score += (demoableFeatures / Math.max(features.length, 1)) * 25;
    score += Math.min(polishedAssets * 5, 25);
    
    return Math.round(score);
  };

  const toggleCheck = (id: string) => {
    if (completedChecks.includes(id)) {
      setCompletedChecks(completedChecks.filter(c => c !== id));
    } else {
      setCompletedChecks([...completedChecks, id]);
    }
  };

  const addFeature = () => {
    if (!newFeature.name) {
      toast({ title: "Missing Information", description: "Please fill in feature name", variant: "destructive" });
      return;
    }
    const feature: MVPFeature = {
      id: Date.now().toString(),
      name: newFeature.name!,
      description: newFeature.description || "",
      status: newFeature.status as any || "planned",
      demoable: newFeature.demoable || false
    };
    setFeatures([...features, feature]);
    setNewFeature({ status: "planned", demoable: false });
    toast({ title: "Added", description: "Feature added" });
  };

  const addAsset = () => {
    if (!newAsset.title) {
      toast({ title: "Missing Information", description: "Please fill in asset title", variant: "destructive" });
      return;
    }
    const asset: DemoAsset = {
      id: Date.now().toString(),
      type: newAsset.type as any || "video",
      title: newAsset.title!,
      url: newAsset.url,
      description: newAsset.description || "",
      quality: newAsset.quality as any || "draft"
    };
    setAssets([...assets, asset]);
    setNewAsset({ type: "video", quality: "draft" });
    toast({ title: "Added", description: "Demo asset added" });
  };

  const exportGuide = () => {
    const report = {
      generatedAt: new Date().toISOString(),
      mvpReadinessScore: calculateMVPReadiness(),
      checklist: mvpChecklist.map(c => ({
        ...c,
        completed: completedChecks.includes(c.id)
      })),
      features,
      demoAssets: assets,
      endorserStatement: `The MVP demonstrates ${features.filter(f => f.demoable).length} demoable features with ${assets.filter(a => a.quality === "polished").length} polished demo assets. ${completedChecks.length} of ${mvpChecklist.length} readiness criteria are met.`
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "mvp-demo-readiness.json";
    a.click();
    
    toast({ title: "Exported", description: "MVP demo guide downloaded" });
  };

  const mvpReadiness = calculateMVPReadiness();

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">MVP & Demo Builder Guide</h1>
        <p className="text-muted-foreground">
          Create compelling prototypes and demo videos that endorsers want to see
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className={mvpReadiness >= 70 ? "border-green-500" : mvpReadiness >= 40 ? "border-yellow-500" : "border-red-500"} data-testid="card-mvp-readiness">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Demo Readiness</span>
              <Badge variant={mvpReadiness >= 70 ? "default" : mvpReadiness >= 40 ? "secondary" : "destructive"} data-testid="badge-mvp-status">
                {mvpReadiness >= 70 ? "Ready" : mvpReadiness >= 40 ? "Almost" : "Not Ready"}
              </Badge>
            </div>
            <div className="text-3xl font-bold mb-2" data-testid="text-mvp-readiness">{mvpReadiness}%</div>
            <Progress value={mvpReadiness} className="h-2" data-testid="progress-mvp-readiness" />
          </CardContent>
        </Card>

        <Card data-testid="card-checklist-count">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Checklist</span>
            </div>
            <div className="text-2xl font-bold" data-testid="text-checklist-count">{completedChecks.length}/{mvpChecklist.length}</div>
            <p className="text-xs text-muted-foreground">items complete</p>
          </CardContent>
        </Card>

        <Card data-testid="card-features-count">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Features</span>
            </div>
            <div className="text-2xl font-bold" data-testid="text-features-count">{features.filter(f => f.demoable).length}/{features.length}</div>
            <p className="text-xs text-muted-foreground">demoable</p>
          </CardContent>
        </Card>

        <Card data-testid="card-assets-count">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Video className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium">Assets</span>
            </div>
            <div className="text-2xl font-bold" data-testid="text-assets-count">{assets.filter(a => a.quality === "polished").length}</div>
            <p className="text-xs text-muted-foreground">polished</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6 border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-amber-800 dark:text-amber-200">Why MVPs Matter to Endorsers</h3>
              <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                A detailed plan is NOT enough. Endorsers want to see that you can actually BUILD what you describe. 
                Even a simple clickable prototype or recorded walkthrough demonstrates capability. 
                80% of successful applicants have some form of working demo.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" />
            Demo Readiness Checklist
          </CardTitle>
          <CardDescription>
            Complete these items before your endorser meeting
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <h4 className="font-medium text-green-600">Essential Items</h4>
            {mvpChecklist.filter(c => c.category === "essential").map((item) => (
              <div key={item.id} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <Checkbox 
                  id={item.id}
                  checked={completedChecks.includes(item.id)}
                  onCheckedChange={() => toggleCheck(item.id)}
                  data-testid={`checkbox-mvp-${item.id}`}
                />
                <label htmlFor={item.id} className="text-sm cursor-pointer flex-1">
                  {item.label}
                </label>
              </div>
            ))}
            
            <h4 className="font-medium text-blue-600 mt-6">Nice to Have</h4>
            {mvpChecklist.filter(c => c.category === "nice-to-have").map((item) => (
              <div key={item.id} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <Checkbox 
                  id={item.id}
                  checked={completedChecks.includes(item.id)}
                  onCheckedChange={() => toggleCheck(item.id)}
                  data-testid={`checkbox-mvp-${item.id}`}
                />
                <label htmlFor={item.id} className="text-sm cursor-pointer flex-1">
                  {item.label}
                </label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            MVP Features Tracker
          </CardTitle>
          <CardDescription>
            Track which features are demo-ready
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
            <div>
              <Label>Feature Name *</Label>
              <Input 
                value={newFeature.name || ""} 
                onChange={(e) => setNewFeature({...newFeature, name: e.target.value})}
                placeholder="User authentication"
                data-testid="input-feature-name"
              />
            </div>
            <div>
              <Label>Status</Label>
              <select 
                className="w-full h-10 rounded-md border border-input bg-background px-3"
                value={newFeature.status || "planned"}
                onChange={(e) => setNewFeature({...newFeature, status: e.target.value as any})}
                data-testid="select-feature-status"
              >
                <option value="planned">Planned</option>
                <option value="in-progress">In Progress</option>
                <option value="complete">Complete</option>
                <option value="demo-ready">Demo Ready</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <Label>Description</Label>
              <Textarea 
                value={newFeature.description || ""} 
                onChange={(e) => setNewFeature({...newFeature, description: e.target.value})}
                placeholder="What does this feature do?"
                rows={2}
                data-testid="textarea-feature-description"
              />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox 
                id="demoable"
                checked={newFeature.demoable}
                onCheckedChange={(checked) => setNewFeature({...newFeature, demoable: !!checked})}
                data-testid="checkbox-feature-demoable"
              />
              <label htmlFor="demoable" className="text-sm cursor-pointer">
                Can be demonstrated live
              </label>
            </div>
          </div>

          <Button onClick={addFeature} className="w-full" data-testid="button-add-feature">
            Add Feature
          </Button>

          {features.length > 0 && (
            <div className="space-y-2">
              {features.map((feature) => (
                <div key={feature.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg" data-testid={`card-feature-${feature.id}`}>
                  <div className="flex items-center gap-3">
                    {feature.demoable ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" data-testid={`icon-feature-demoable-${feature.id}`} />
                    ) : (
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    )}
                    <div>
                      <span className="font-medium" data-testid={`text-feature-name-${feature.id}`}>{feature.name}</span>
                      <Badge variant={
                        feature.status === "demo-ready" ? "default" :
                        feature.status === "complete" ? "secondary" :
                        "outline"
                      } className="ml-2" data-testid={`badge-feature-status-${feature.id}`}>
                        {feature.status}
                      </Badge>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setFeatures(features.filter(f => f.id !== feature.id))}
                    data-testid={`button-remove-feature-${feature.id}`}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            Demo Assets
          </CardTitle>
          <CardDescription>
            Collect videos, screenshots, and prototypes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
            <div>
              <Label>Asset Title *</Label>
              <Input 
                value={newAsset.title || ""} 
                onChange={(e) => setNewAsset({...newAsset, title: e.target.value})}
                placeholder="3-minute MVP walkthrough"
                data-testid="input-asset-title"
              />
            </div>
            <div>
              <Label>Type</Label>
              <select 
                className="w-full h-10 rounded-md border border-input bg-background px-3"
                value={newAsset.type || "video"}
                onChange={(e) => setNewAsset({...newAsset, type: e.target.value as any})}
                data-testid="select-asset-type"
              >
                <option value="video">Video Demo</option>
                <option value="screenshot">Screenshots</option>
                <option value="prototype">Interactive Prototype</option>
                <option value="documentation">Technical Docs</option>
              </select>
            </div>
            <div>
              <Label>URL</Label>
              <Input 
                value={newAsset.url || ""} 
                onChange={(e) => setNewAsset({...newAsset, url: e.target.value})}
                placeholder="https://loom.com/share/..."
                data-testid="input-asset-url"
              />
            </div>
            <div>
              <Label>Quality</Label>
              <select 
                className="w-full h-10 rounded-md border border-input bg-background px-3"
                value={newAsset.quality || "draft"}
                onChange={(e) => setNewAsset({...newAsset, quality: e.target.value as any})}
                data-testid="select-asset-quality"
              >
                <option value="draft">Draft</option>
                <option value="polished">Polished</option>
              </select>
            </div>
          </div>

          <Button onClick={addAsset} className="w-full" data-testid="button-add-asset">
            Add Demo Asset
          </Button>

          {assets.length > 0 && (
            <div className="space-y-2">
              {assets.map((asset) => (
                <div key={asset.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg" data-testid={`card-asset-${asset.id}`}>
                  <div className="flex items-center gap-3">
                    {asset.type === "video" && <Video className="h-4 w-4 text-red-500" />}
                    {asset.type === "screenshot" && <Monitor className="h-4 w-4 text-blue-500" />}
                    {asset.type === "prototype" && <Smartphone className="h-4 w-4 text-purple-500" />}
                    {asset.type === "documentation" && <Code className="h-4 w-4 text-gray-500" />}
                    <div>
                      <span className="font-medium" data-testid={`text-asset-title-${asset.id}`}>{asset.title}</span>
                      <Badge variant={asset.quality === "polished" ? "default" : "outline"} className="ml-2" data-testid={`badge-asset-quality-${asset.id}`}>
                        {asset.quality}
                      </Badge>
                    </div>
                  </div>
                  {asset.url && (
                    <a href={asset.url} target="_blank" rel="noopener noreferrer" data-testid={`link-asset-${asset.id}`}>
                      <ExternalLink className="h-4 w-4 text-blue-500" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Demo Video Best Practices
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-green-600 mb-2">Do</h4>
              <ul className="text-sm space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                  <span>Keep it under 5 minutes - endorsers are busy</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                  <span>Start with the problem, then show your solution</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                  <span>Use Loom, Vimeo, or unlisted YouTube</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                  <span>Show real user workflows, not just features</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                  <span>Include your face (picture-in-picture) for authenticity</span>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-red-600 mb-2">Don't</h4>
              <ul className="text-sm space-y-2">
                <li className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5" />
                  <span>Read from a script - be natural</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5" />
                  <span>Show obviously fake/lorem ipsum data</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5" />
                  <span>Include long loading times or errors</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5" />
                  <span>Use low-quality audio or shaky screen recordings</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5" />
                  <span>Just demo features without explaining value</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Export Demo Readiness Report</h3>
              <p className="text-sm text-muted-foreground">
                Download your MVP status for review
              </p>
            </div>
            <Button onClick={exportGuide} data-testid="button-export-mvp">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
