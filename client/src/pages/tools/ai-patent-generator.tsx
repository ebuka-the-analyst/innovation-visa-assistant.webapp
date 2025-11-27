import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { FileText, Lightbulb, Shield, Download, Loader2, CheckCircle2, Sparkles, Box } from "lucide-react";

interface PatentBlueprint {
  title: string;
  abstract: string;
  claims: string[];
  technicalField: string;
  backgroundProblem: string;
  solutionSummary: string;
  advantages: string[];
  diagrams: { name: string; description: string }[];
}

export default function AIPatentGenerator() {
  const { toast } = useToast();
  const [inventionTitle, setInventionTitle] = useState('');
  const [inventionDescription, setInventionDescription] = useState('');
  const [technicalDetails, setTechnicalDetails] = useState('');
  const [blueprint, setBlueprint] = useState<PatentBlueprint | null>(null);

  const generateMutation = useMutation({
    mutationFn: async (data: { title: string; description: string; technical: string }) => {
      const response = await apiRequest('POST', '/api/ai/generate-patent-blueprint', data);
      return response.json();
    },
    onSuccess: (data) => {
      setBlueprint(data.blueprint);
      toast({ title: "Blueprint Generated", description: "Your patent blueprint is ready for review" });
    }
  });

  const handleGenerate = () => {
    if (!inventionTitle.trim() || !inventionDescription.trim()) {
      toast({ title: "Required Fields", description: "Please provide invention title and description", variant: "destructive" });
      return;
    }
    generateMutation.mutate({ title: inventionTitle, description: inventionDescription, technical: technicalDetails });
  };

  const downloadBlueprint = () => {
    if (!blueprint) return;
    const content = `PATENT BLUEPRINT
================

Title: ${blueprint.title}

Technical Field:
${blueprint.technicalField}

Abstract:
${blueprint.abstract}

Background Problem:
${blueprint.backgroundProblem}

Solution Summary:
${blueprint.solutionSummary}

Claims:
${blueprint.claims.map((c, i) => `${i + 1}. ${c}`).join('\n')}

Advantages:
${blueprint.advantages.map(a => `- ${a}`).join('\n')}

Technical Diagrams Required:
${blueprint.diagrams.map(d => `- ${d.name}: ${d.description}`).join('\n')}
`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'patent-blueprint.txt';
    a.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-amber-500/5 to-orange-500/5 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 mb-4">
            <Shield className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-medium text-amber-600 dark:text-amber-400">AI Patent Generator</span>
          </div>
          <h1 className="text-4xl font-bold mb-3" data-testid="heading-patent-generator">AI Patent Blueprint Generator</h1>
          <p className="text-muted-foreground">Generate comprehensive patent claims and technical diagrams for your innovation</p>
        </div>

        <ToolUtilityBar toolId="ai-patent-generator" toolName="Patent Generator" />

        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-amber-500" />
                Describe Your Innovation
              </CardTitle>
              <CardDescription>Provide details about your invention for patent blueprint generation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Invention Title</label>
                <Input
                  placeholder="e.g., AI-Powered Document Analysis System"
                  value={inventionTitle}
                  onChange={(e) => setInventionTitle(e.target.value)}
                  data-testid="input-invention-title"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Invention Description</label>
                <Textarea
                  placeholder="Describe what your invention does, the problem it solves, and how it works..."
                  value={inventionDescription}
                  onChange={(e) => setInventionDescription(e.target.value)}
                  className="min-h-[150px]"
                  data-testid="input-invention-description"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Technical Details (Optional)</label>
                <Textarea
                  placeholder="Include any technical specifications, algorithms, or unique methods..."
                  value={technicalDetails}
                  onChange={(e) => setTechnicalDetails(e.target.value)}
                  className="min-h-[100px]"
                  data-testid="input-technical-details"
                />
              </div>
              <Button 
                onClick={handleGenerate} 
                disabled={generateMutation.isPending}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white"
                data-testid="button-generate-patent"
              >
                {generateMutation.isPending ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating Blueprint...</>
                ) : (
                  <><Sparkles className="w-4 h-4 mr-2" />Generate Patent Blueprint</>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Patent Blueprint
                </CardTitle>
                {blueprint && (
                  <Button variant="outline" size="sm" onClick={downloadBlueprint} data-testid="button-download-blueprint">
                    <Download className="w-4 h-4 mr-1" />Export
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {!blueprint ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Describe your innovation to generate a patent blueprint</p>
                </div>
              ) : (
                <Tabs defaultValue="overview">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="claims">Claims</TabsTrigger>
                    <TabsTrigger value="diagrams">Diagrams</TabsTrigger>
                  </TabsList>
                  <TabsContent value="overview" className="space-y-4 pt-4">
                    <div>
                      <h4 className="font-medium mb-1">Title</h4>
                      <p className="text-sm text-muted-foreground">{blueprint.title}</p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">Abstract</h4>
                      <p className="text-sm text-muted-foreground">{blueprint.abstract}</p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">Technical Field</h4>
                      <p className="text-sm text-muted-foreground">{blueprint.technicalField}</p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">Key Advantages</h4>
                      <ul className="space-y-1">
                        {blueprint.advantages.map((adv, i) => (
                          <li key={i} className="text-sm flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                            {adv}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </TabsContent>
                  <TabsContent value="claims" className="space-y-3 pt-4">
                    {blueprint.claims.map((claim, i) => (
                      <div key={i} className="p-3 bg-muted/50 rounded-lg">
                        <Badge className="mb-2">Claim {i + 1}</Badge>
                        <p className="text-sm">{claim}</p>
                      </div>
                    ))}
                  </TabsContent>
                  <TabsContent value="diagrams" className="space-y-3 pt-4">
                    {blueprint.diagrams.map((diagram, i) => (
                      <div key={i} className="p-4 border rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Box className="w-5 h-5 text-amber-500" />
                          <h4 className="font-medium">{diagram.name}</h4>
                        </div>
                        <p className="text-sm text-muted-foreground">{diagram.description}</p>
                      </div>
                    ))}
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
