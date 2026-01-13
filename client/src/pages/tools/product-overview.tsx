import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { AiToolGuide, AiTraditionalToggle, type ToolConfig } from "@/components/AiToolGuide";
import { useTierAccess } from "@/hooks/useTierAccess";
import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { FileUploadButton } from "@/components/FileUploadButton";
import { FileList } from "@/components/FileList";
import { fileUploadConfigs } from "@/lib/fileUploadConfigs";
import { useState, useEffect } from "react";
import { Download, Zap, Target } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

const AI_TOOL_CONFIG: ToolConfig = {
  toolId: "product-overview",
  toolName: "Product Overview",
  agent: "nova",
  greeting: "Hello! I'm Nova, your innovation strategist. Let's create a comprehensive product overview that clearly communicates your offering's value for your visa application.",
  questions: [
    {
      id: "name",
      question: "What is the name of your product or service?",
      hint: "The official name of your product or service",
      fieldKey: "productName",
      minLength: 2
    },
    {
      id: "description",
      question: "Describe what your product does and the problem it solves.",
      hint: "Explain the core functionality and value proposition",
      fieldKey: "description",
      minLength: 100
    },
    {
      id: "features",
      question: "What are the key features and capabilities of your product?",
      hint: "List 3-5 main features that differentiate your product",
      fieldKey: "features",
      minLength: 80
    },
    {
      id: "usp",
      question: "What makes your product unique compared to existing solutions?",
      hint: "Focus on genuine differentiation, not just improvements",
      fieldKey: "usp",
      minLength: 80
    },
    {
      id: "target",
      question: "Who are your ideal customers and target market?",
      hint: "Be specific about customer segments and their needs",
      fieldKey: "targetMarket",
      minLength: 60
    }
  ],
  completionMessage: "Great! Your product overview has been captured. This clear articulation of your offering will strengthen your visa application."
};

export default function ProductOverview() {
  const { userTier } = useTierAccess();
  
  // Free users default to traditional mode, paid users can use AI mode
  const isPaidUser = userTier !== 'free';
  const [mode, setMode] = useState<'ai' | 'traditional'>(() => {
    const saved = localStorage.getItem('product-overview-mode');
    // Free users always start in traditional mode
    return (saved === 'ai' && isPaidUser) ? 'ai' : 'traditional';
  });

  // Force traditional mode for free users and clear localStorage
  useEffect(() => {
    if (!isPaidUser && mode === 'ai') {
      setMode('traditional');
      localStorage.setItem('product-overview-mode', 'traditional');
    }
  }, [isPaidUser, mode]);

  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [savedDate, setSavedDate] = useState("");
  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");
  const [features, setFeatures] = useState("");
  const [usp, setUsp] = useState("");
  const [targetMarket, setTargetMarket] = useState("");
  const [overview, setOverview] = useState("");

  const saveProgress = () => {
    localStorage.setItem('productOverviewFiles', JSON.stringify(uploadedFiles));
    localStorage.setItem('productOverviewData', JSON.stringify({ productName, description, features, usp, targetMarket }));
    localStorage.setItem('productOverviewDate', new Date().toLocaleDateString());
    setSavedDate(new Date().toLocaleDateString());
  };

  const generateOverview = () => {
    const content = `PRODUCT OVERVIEW\n\nProduct: ${productName}\n\nDescription:\n${description}\n\nKey Features:\n${features}\n\nUnique Value Proposition:\n${usp}\n\nTarget Market:\n${targetMarket}`;
    setOverview(content);
  };

  const handleFileUpload = (file: any) => setUploadedFiles(prev => [...prev, file]);
  const handleRemoveFile = (id: string) => setUploadedFiles(prev => prev.filter(f => f.id !== id));

  const exportOverview = () => {
    const blob = new Blob([overview], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `product-overview-${productName}.txt`;
    a.click();
  };

  const getSerializedState = () => ({ uploadedFiles, productName, description, features, usp, targetMarket, overview, savedDate });

  useEffect(() => {
    localStorage.setItem('product-overview-mode', mode);
  }, [mode]);

  const handleAiComplete = (answers: Record<string, string>) => {
    if (answers.productName) setProductName(answers.productName);
    if (answers.description) setDescription(answers.description);
    if (answers.features) setFeatures(answers.features);
    if (answers.usp) setUsp(answers.usp);
    if (answers.targetMarket) setTargetMarket(answers.targetMarket);
    setMode('traditional');
  };

  useEffect(() => {
    const s = localStorage.getItem('productOverviewData');
    if (s) {
      const data = JSON.parse(s);
      setProductName(data.productName || "");
      setDescription(data.description || "");
      setFeatures(data.features || "");
      setUsp(data.usp || "");
      setTargetMarket(data.targetMarket || "");
    }
    const f = localStorage.getItem('productOverviewFiles');
    if (f) setUploadedFiles(JSON.parse(f));
  }, []);

  const traditionalContent = (
    <>
      <div className="mb-4">
        <FileUploadButton config={fileUploadConfigs.documentOrganizer} onFileSelected={handleFileUpload} variant="secondary" />
      </div>
      <FileList files={uploadedFiles} onRemove={handleRemoveFile} />
      {savedDate && <Alert className="mb-4"><AlertDescription>Last saved: {savedDate}</AlertDescription></Alert>}

      <Card className="p-6 mb-6">
        <h3 className="font-bold mb-4 flex gap-2"><Zap className="w-5 h-5" />Product Details</h3>
        <div className="space-y-4">
          <Input value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="Product Name" data-testid="input-product-name" />
          <div>
            <label className="text-sm font-medium">Description</label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What does your product do?" rows={3} data-testid="textarea-description" />
          </div>
          <div>
            <label className="text-sm font-medium">Key Features</label>
            <Textarea value={features} onChange={(e) => setFeatures(e.target.value)} placeholder="• Feature 1\n• Feature 2" rows={3} data-testid="textarea-features" />
          </div>
          <div>
            <label className="text-sm font-medium">Unique Value Proposition</label>
            <Textarea value={usp} onChange={(e) => setUsp(e.target.value)} placeholder="What makes your product unique?" rows={2} data-testid="textarea-usp" />
          </div>
          <div>
            <label className="text-sm font-medium">Target Market</label>
            <Textarea value={targetMarket} onChange={(e) => setTargetMarket(e.target.value)} placeholder="Who are your ideal customers?" rows={2} data-testid="textarea-target-market" />
          </div>
          <Button onClick={generateOverview} className="w-full gap-2 bg-secondary" data-testid="button-generate-overview">
            <Target className="w-4 h-4" />
            Generate Overview
          </Button>
        </div>
      </Card>

      {overview && <Card className="p-6 mb-6 bg-orange-50 dark:bg-orange-950"><p className="text-sm whitespace-pre-wrap">{overview}</p></Card>}

      <Button className="w-full gap-2 bg-primary" onClick={exportOverview} data-testid="button-export-overview">
        <Download className="w-4 h-4" />
        Export Product Overview
      </Button>
    </>
  );

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl font-bold" data-testid="heading-product-overview">Product Overview</h1>
              <p className="text-muted-foreground">Create a comprehensive overview of your product offering</p>
            </div>
            <AiTraditionalToggle mode={mode} onModeChange={setMode} userTier={userTier} />
          </div>

          <ToolUtilityBar
            toolId="product-overview"
            toolName="Product Overview"
            onSave={saveProgress}
            onExport={exportOverview}
            getSerializedState={getSerializedState}
          />

          {mode === 'ai' ? (
            <AiToolGuide config={AI_TOOL_CONFIG} onComplete={handleAiComplete} userTier={userTier} />
          ) : traditionalContent}
        </div>
      </div>
    </>
  );
}
