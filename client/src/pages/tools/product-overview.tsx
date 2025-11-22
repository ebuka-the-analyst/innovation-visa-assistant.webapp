import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AuthHeader } from "@/components/AuthHeader";
import { ToolNavigation } from "@/components/ToolNavigation";
import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { FileUploadButton } from "@/components/FileUploadButton";
import { FileList } from "@/components/FileList";
import { fileUploadConfigs } from "@/lib/fileUploadConfigs";
import { useState, useEffect } from "react";
import { Download, Zap, Target } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

export default function ProductOverview() {
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

  return (
    <>
      <AuthHeader />
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        <ToolNavigation />
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Product Overview</h1>
          <p className="text-muted-foreground mb-6">Create a comprehensive overview of your product offering</p>

          <ToolUtilityBar
            toolId="product-overview"
            toolName="Product Overview"
            onSave={saveProgress}
            onExport={exportOverview}
            getSerializedState={getSerializedState}
          />

          <div className="mb-4">
            <FileUploadButton config={fileUploadConfigs.documentOrganizer} onFileSelected={handleFileUpload} variant="secondary" />
          </div>
          <FileList files={uploadedFiles} onRemove={handleRemoveFile} />
          {savedDate && <Alert className="mb-4"><AlertDescription>Last saved: {savedDate}</AlertDescription></Alert>}

          <Card className="p-6 mb-6">
            <h3 className="font-bold mb-4 flex gap-2"><Zap className="w-5 h-5" />Product Details</h3>
            <div className="space-y-4">
              <Input value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="Product Name" />
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What does your product do?" rows={3} />
              </div>
              <div>
                <label className="text-sm font-medium">Key Features</label>
                <Textarea value={features} onChange={(e) => setFeatures(e.target.value)} placeholder="• Feature 1\n• Feature 2" rows={3} />
              </div>
              <div>
                <label className="text-sm font-medium">Unique Value Proposition</label>
                <Textarea value={usp} onChange={(e) => setUsp(e.target.value)} placeholder="What makes your product unique?" rows={2} />
              </div>
              <div>
                <label className="text-sm font-medium">Target Market</label>
                <Textarea value={targetMarket} onChange={(e) => setTargetMarket(e.target.value)} placeholder="Who are your ideal customers?" rows={2} />
              </div>
              <Button onClick={generateOverview} className="w-full gap-2 bg-secondary">
                <Target className="w-4 h-4" />
                Generate Overview
              </Button>
            </div>
          </Card>

          {overview && <Card className="p-6 mb-6 bg-orange-50"><p className="text-sm whitespace-pre-wrap">{overview}</p></Card>}

          <Button className="w-full gap-2 bg-primary" onClick={exportOverview} data-testid="button-export-overview">
            <Download className="w-4 h-4" />
            Export Product Overview
          </Button>
        </div>
      </div>
    </>
  );
}
