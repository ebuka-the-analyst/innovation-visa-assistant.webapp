import { useState, useEffect, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AiToolGuide, AiTraditionalToggle, type ToolConfig } from "@/components/AiToolGuide";
import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Video, Code, FileText, CheckCircle } from "lucide-react";
import { useWordExport } from "@/hooks/useWordExport";
import { useToast } from "@/hooks/use-toast";

const AI_TOOL_CONFIG: ToolConfig = {
  toolId: 'mvp-demo-guide',
  toolName: 'MVP & Demo Builder Guide',
  agent: 'nova',
  greeting: "Hello! I'm Nova, your Innovation Specialist. A compelling MVP demo is crucial for showing endorsers your innovation in action. Let me guide you through creating an impressive demonstration of your product.",
  questions: [
    {
      id: 'product-name',
      question: "What is the name of your product/MVP? Give a brief one-line description of what it does.",
      hint: "Keep it simple and memorable",
      fieldKey: 'product_name',
      minLength: 10
    },
    {
      id: 'problem-solution',
      question: "What problem does your MVP solve and how? Explain the core value proposition clearly.",
      hint: "Endorsers want to see a clear problem-solution fit",
      fieldKey: 'problem_solution',
      minLength: 50
    },
    {
      id: 'core-features',
      question: "What are the 3-5 core features that make your MVP innovative? What makes these features unique?",
      hint: "Focus on what differentiates you from existing solutions",
      fieldKey: 'core_features',
      minLength: 50
    },
    {
      id: 'tech-stack',
      question: "What technology stack powers your MVP? Include frontend, backend, and any AI/ML components.",
      hint: "Highlight any innovative or cutting-edge technologies",
      fieldKey: 'tech_stack',
      minLength: 20
    },
    {
      id: 'demo-status',
      question: "What is the current status of your MVP? Is it live, in beta, or prototype stage? Provide demo URL if available.",
      hint: "A working demo significantly strengthens your application",
      fieldKey: 'demo_status',
      minLength: 20
    },
    {
      id: 'demo-video',
      question: "Do you have a demo video? If yes, describe what it shows. If not, what key moments should it capture?",
      hint: "Keep demos under 3 minutes, focus on the 'wow' moments",
      fieldKey: 'demo_video',
      minLength: 30
    }
  ]
};

export default function MvpDemoGuide() {
  const { generateWord } = useWordExport();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('mvp');
  const [savedDate, setSavedDate] = useState('');
  
  const [mode, setMode] = useState<'ai' | 'traditional'>(() => {
    return (localStorage.getItem('mvp-demo-guide-mode') as 'ai' | 'traditional') || 'ai';
  });

  useEffect(() => {
    localStorage.setItem('mvp-demo-guide-mode', mode);
  }, [mode]);

  const handleAiComplete = useCallback((answers: Record<string, any>) => {
    setMvpDetails(prev => ({
      ...prev,
      productName: answers.product_name || prev.productName,
      problemStatement: answers.problem_solution || prev.problemStatement,
      coreFeatures: answers.core_features || prev.coreFeatures,
      techStack: answers.tech_stack || prev.techStack,
      currentStatus: answers.demo_status?.includes('live') ? 'Live' : answers.demo_status?.includes('beta') ? 'Beta' : answers.demo_status?.includes('prototype') ? 'Prototype' : prev.currentStatus,
      demoUrl: answers.demo_status?.match(/https?:\/\/[^\s]+/)?.[0] || prev.demoUrl
    }));
    if (answers.demo_video) {
      setDemoVideo(prev => ({
        ...prev,
        keyMoments: answers.demo_video
      }));
    }
    setMode('traditional');
    toast({ title: "AI Guide Complete", description: "Your MVP details have been applied to the form" });
  }, [toast]);

  const [mvpDetails, setMvpDetails] = useState({
    productName: '',
    problemStatement: '',
    coreFeatures: '',
    techStack: '',
    currentStatus: '',
    demoUrl: '',
    githubUrl: ''
  });

  const [demoVideo, setDemoVideo] = useState({
    videoUrl: '',
    duration: '',
    platform: '',
    keyMoments: '',
    narrationScript: ''
  });

  const [checklist, setChecklist] = useState({
    mvpFunctional: false,
    coreFeatureWorks: false,
    demoRecorded: false,
    narrationClear: false,
    uiPolished: false,
    mobileFriendly: false,
    loadTimeAcceptable: false,
    errorHandling: false
  });

  const getSerializedState = () => ({
    mvpDetails, demoVideo, checklist, activeTab,
    savedDate: new Date().toLocaleString('en-GB')
  });

  const restoreSerializedState = (state: any) => {
    if (state.mvpDetails) setMvpDetails(state.mvpDetails);
    if (state.demoVideo) setDemoVideo(state.demoVideo);
    if (state.checklist) setChecklist(state.checklist);
    if (state.activeTab) setActiveTab(state.activeTab);
    if (state.savedDate) setSavedDate(state.savedDate);
  };

  useEffect(() => {
    const saved = localStorage.getItem('mvp-demo-guide-state');
    if (saved) restoreSerializedState(JSON.parse(saved));
  }, []);

  const handleSave = () => {
    const state = getSerializedState();
    localStorage.setItem('mvp-demo-guide-state', JSON.stringify(state));
    setSavedDate(state.savedDate);
    toast({ title: "Progress saved", description: "Your MVP guide has been saved" });
  };

  const handleRestore = () => {
    const saved = localStorage.getItem('mvp-demo-guide-state');
    if (saved) restoreSerializedState(JSON.parse(saved));
  };

  const calculateReadinessScore = () => {
    let score = 0;
    const checklistValues = Object.values(checklist);
    const checkedItems = checklistValues.filter(v => v).length;
    score += (checkedItems / checklistValues.length) * 50;
    
    if (mvpDetails.productName && mvpDetails.problemStatement) score += 15;
    if (mvpDetails.demoUrl) score += 15;
    if (demoVideo.videoUrl) score += 20;
    
    return Math.min(Math.round(score), 100);
  };

  const checklistItems = [
    { key: 'mvpFunctional', label: 'MVP is functional and accessible', description: 'Users can access and use the core product' },
    { key: 'coreFeatureWorks', label: 'Core feature demonstrable', description: 'The main value proposition can be shown' },
    { key: 'demoRecorded', label: 'Demo video recorded', description: 'A walkthrough video exists' },
    { key: 'narrationClear', label: 'Clear narration/captions', description: 'Video has clear explanation' },
    { key: 'uiPolished', label: 'UI is reasonably polished', description: 'Interface looks professional' },
    { key: 'mobileFriendly', label: 'Mobile-friendly (if applicable)', description: 'Works on mobile devices' },
    { key: 'loadTimeAcceptable', label: 'Load time acceptable', description: 'Demo loads quickly' },
    { key: 'errorHandling', label: 'Basic error handling', description: 'Errors are handled gracefully' }
  ];

  const getSmartTips = () => [
    "Keep your demo video under 3 minutes - endorsers are busy",
    "Show the problem first, then demonstrate your solution",
    "Use real data or realistic mock data in demonstrations",
    "Ensure your MVP URL works reliably during evaluation periods",
    "Include test credentials if login is required",
    "Practice your demo narration for smooth delivery",
    "Have a backup recording in case live demo fails"
  ];

  const generateActionPlan = () => [
    { week: "Week 1", action: "Define and prioritize core MVP features", priority: "Critical" },
    { week: "Week 1-2", action: "Build functional MVP with core feature working", priority: "Critical" },
    { week: "Week 2", action: "Polish UI and fix major bugs", priority: "High" },
    { week: "Week 3", action: "Write demo script and practice walkthrough", priority: "High" },
    { week: "Week 3", action: "Record demo video with clear narration", priority: "Critical" },
    { week: "Week 4", action: "Test all links and deploy to stable URL", priority: "High" }
  ];

  const handleExportWord = async () => {
    await generateWord({
      title: 'MVP & Demo Builder Guide',
      subtitle: `Readiness Score: ${calculateReadinessScore()}/100`,
      filename: `mvp-demo-guide-${Date.now()}.docx`,
      sections: [
        { type: 'heading', content: 'MVP Details', level: 1 },
        { type: 'paragraph', content: `Product Name: ${mvpDetails.productName}` },
        { type: 'paragraph', content: `Problem Statement: ${mvpDetails.problemStatement}` },
        { type: 'paragraph', content: `Core Features: ${mvpDetails.coreFeatures}` },
        { type: 'paragraph', content: `Tech Stack: ${mvpDetails.techStack}` },
        { type: 'paragraph', content: `Demo URL: ${mvpDetails.demoUrl}` },
        { type: 'divider' },
        { type: 'heading', content: 'Demo Video', level: 1 },
        { type: 'paragraph', content: `Video URL: ${demoVideo.videoUrl}` },
        { type: 'paragraph', content: `Duration: ${demoVideo.duration}` },
        { type: 'paragraph', content: `Key Moments: ${demoVideo.keyMoments}` },
        { type: 'divider' },
        { type: 'heading', content: 'Readiness Checklist', level: 1 },
        ...checklistItems.map(item => ({ type: 'paragraph' as const, content: `${checklist[item.key as keyof typeof checklist] ? '[READY]' : '[PENDING]'} ${item.label}` }))
      ]
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <ToolUtilityBar
          toolId="mvp-demo-guide"
          toolName="MVP & Demo Builder Guide"
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
                  <Video className="h-6 w-6 text-primary" />
                  MVP & Demo Builder Guide
                </CardTitle>
                <CardDescription>
                  Create compelling prototypes and demo videos for endorsers
                </CardDescription>
              </div>
              <AiTraditionalToggle mode={mode} onModeChange={setMode} />
            </div>
          </CardHeader>
          <CardContent>
            {mode === 'ai' ? (
              <AiToolGuide config={AI_TOOL_CONFIG} onComplete={handleAiComplete} />
            ) : (
              <>
            <div className="mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Demo Readiness</span>
                <span className="text-sm font-bold text-primary">{calculateReadinessScore()}/100</span>
              </div>
              <Progress value={calculateReadinessScore()} className="h-3" />
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="mvp" data-testid="tab-mvp">
                  <Code className="h-4 w-4 mr-2" />MVP Details
                </TabsTrigger>
                <TabsTrigger value="demo" data-testid="tab-demo">
                  <Video className="h-4 w-4 mr-2" />Demo Video
                </TabsTrigger>
                <TabsTrigger value="checklist" data-testid="tab-checklist">
                  <CheckCircle className="h-4 w-4 mr-2" />Checklist
                </TabsTrigger>
              </TabsList>

              <TabsContent value="mvp" className="space-y-4 mt-4">
                <h3 className="text-lg font-semibold">MVP Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Product Name</Label>
                    <Input
                      value={mvpDetails.productName}
                      onChange={(e) => setMvpDetails({...mvpDetails, productName: e.target.value})}
                      placeholder="Your product name"
                      data-testid="input-product-name"
                    />
                  </div>
                  <div>
                    <Label>Current Status</Label>
                    <Input
                      value={mvpDetails.currentStatus}
                      onChange={(e) => setMvpDetails({...mvpDetails, currentStatus: e.target.value})}
                      placeholder="e.g., Beta, Alpha, Prototype"
                      data-testid="input-status"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label>Problem Statement</Label>
                    <Textarea
                      value={mvpDetails.problemStatement}
                      onChange={(e) => setMvpDetails({...mvpDetails, problemStatement: e.target.value})}
                      placeholder="What problem does your MVP solve?"
                      className="min-h-[100px]"
                      data-testid="input-problem"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label>Core Features</Label>
                    <Textarea
                      value={mvpDetails.coreFeatures}
                      onChange={(e) => setMvpDetails({...mvpDetails, coreFeatures: e.target.value})}
                      placeholder="List the main features in your MVP"
                      data-testid="input-features"
                    />
                  </div>
                  <div>
                    <Label>Tech Stack</Label>
                    <Input
                      value={mvpDetails.techStack}
                      onChange={(e) => setMvpDetails({...mvpDetails, techStack: e.target.value})}
                      placeholder="e.g., React, Node.js, PostgreSQL"
                      data-testid="input-tech"
                    />
                  </div>
                  <div>
                    <Label>Demo URL</Label>
                    <Input
                      value={mvpDetails.demoUrl}
                      onChange={(e) => setMvpDetails({...mvpDetails, demoUrl: e.target.value})}
                      placeholder="https://..."
                      data-testid="input-demo-url"
                    />
                  </div>
                  <div>
                    <Label>GitHub URL (Optional)</Label>
                    <Input
                      value={mvpDetails.githubUrl}
                      onChange={(e) => setMvpDetails({...mvpDetails, githubUrl: e.target.value})}
                      placeholder="https://github.com/..."
                      data-testid="input-github"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="demo" className="space-y-4 mt-4">
                <h3 className="text-lg font-semibold">Demo Video Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Video URL</Label>
                    <Input
                      value={demoVideo.videoUrl}
                      onChange={(e) => setDemoVideo({...demoVideo, videoUrl: e.target.value})}
                      placeholder="https://youtube.com/... or https://loom.com/..."
                      data-testid="input-video-url"
                    />
                  </div>
                  <div>
                    <Label>Duration</Label>
                    <Input
                      value={demoVideo.duration}
                      onChange={(e) => setDemoVideo({...demoVideo, duration: e.target.value})}
                      placeholder="e.g., 2:30"
                      data-testid="input-duration"
                    />
                  </div>
                  <div>
                    <Label>Platform</Label>
                    <Input
                      value={demoVideo.platform}
                      onChange={(e) => setDemoVideo({...demoVideo, platform: e.target.value})}
                      placeholder="e.g., YouTube, Loom, Vimeo"
                      data-testid="input-platform"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label>Key Moments to Highlight</Label>
                    <Textarea
                      value={demoVideo.keyMoments}
                      onChange={(e) => setDemoVideo({...demoVideo, keyMoments: e.target.value})}
                      placeholder="List the key moments and timestamps in your demo"
                      data-testid="input-key-moments"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label>Narration Script</Label>
                    <Textarea
                      value={demoVideo.narrationScript}
                      onChange={(e) => setDemoVideo({...demoVideo, narrationScript: e.target.value})}
                      placeholder="Write or paste your demo narration script here"
                      className="min-h-[150px]"
                      data-testid="input-script"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="checklist" className="space-y-4 mt-4">
                <h3 className="text-lg font-semibold">Demo Readiness Checklist</h3>
                <div className="space-y-4">
                  {checklistItems.map((item) => (
                    <Card key={item.key} className="p-4">
                      <div className="flex items-start space-x-3">
                        <Checkbox
                          id={item.key}
                          checked={checklist[item.key as keyof typeof checklist]}
                          onCheckedChange={(checked) => {
                            setChecklist({...checklist, [item.key]: checked === true});
                          }}
                          data-testid={`checkbox-${item.key}`}
                        />
                        <div className="flex-1">
                          <Label htmlFor={item.key} className="font-medium cursor-pointer">
                            {item.label}
                          </Label>
                          <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
            </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
