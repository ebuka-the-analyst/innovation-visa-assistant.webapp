import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  FileText, Download, Search, Filter, Lock, Star, Copy,
  FileSignature, Briefcase, PoundSterling, Scale, Users, ChevronRight,
  Sparkles, Eye, CheckCircle, Crown
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { SEOHead } from "@/components/SEOHead";

function renderMarkdown(text: string): JSX.Element[] {
  const lines = text.split('\n');
  return lines.map((line, index) => {
    let processedLine = line
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code class="bg-muted px-1 py-0.5 rounded text-xs">$1</code>');
    
    if (line.match(/^\d+\.\s/)) {
      return <div key={index} className="ml-4 my-1" dangerouslySetInnerHTML={{ __html: processedLine }} />;
    } else if (line.match(/^\s+-\s/)) {
      return <div key={index} className="ml-8 my-0.5" dangerouslySetInnerHTML={{ __html: processedLine }} />;
    } else if (line.trim() === '') {
      return <div key={index} className="h-2" />;
    } else {
      return <div key={index} dangerouslySetInnerHTML={{ __html: processedLine }} />;
    }
  });
}

interface DocumentTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  content: string;
  placeholders: { key: string; label: string; description?: string }[] | null;
  usageGuide: string | null;
  exampleFilled: string | null;
  requiredTier: string;
  downloadCount: number;
  rating: number | null;
  isAccessible: boolean;
}

const categoryIcons: Record<string, typeof FileText> = {
  business_plan: Briefcase,
  cover_letter: FileSignature,
  evidence: CheckCircle,
  financial: PoundSterling,
  legal: Scale,
  team: Users,
  pitch: Sparkles,
  other: FileText
};

const categoryLabels: Record<string, string> = {
  business_plan: "Business Plans",
  cover_letter: "Cover Letters",
  evidence: "Evidence Documents",
  financial: "Financial Documents",
  legal: "Legal Documents",
  team: "Team Documents",
  pitch: "Pitch Decks",
  other: "Other"
};

const tierColors: Record<string, string> = {
  free: "bg-gray-500",
  basic: "bg-blue-500",
  premium: "bg-purple-500",
  enterprise: "bg-amber-500",
  ultimate: "bg-gradient-to-r from-amber-500 to-orange-500"
};

function TemplateCard({ template, onPreview, onDownload }: { 
  template: DocumentTemplate; 
  onPreview: () => void;
  onDownload: () => void;
}) {
  const CategoryIcon = categoryIcons[template.category] || FileText;

  return (
    <Card className={`transition-all duration-200 ${!template.isAccessible ? 'opacity-70' : 'hover-elevate'}`} data-testid={`template-card-${template.id}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${template.isAccessible ? 'bg-primary/10' : 'bg-muted'}`}>
              <CategoryIcon className={`w-5 h-5 ${template.isAccessible ? 'text-primary' : 'text-muted-foreground'}`} />
            </div>
            <div className="min-w-0">
              <CardTitle className="text-base truncate">{template.name}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-xs capitalize">
                  {categoryLabels[template.category] || template.category}
                </Badge>
                {!template.isAccessible && (
                  <Badge variant="outline" className={`text-xs ${tierColors[template.requiredTier]} text-white border-none`}>
                    <Lock className="w-3 h-3 mr-1" />
                    {template.requiredTier}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          {template.rating && (
            <div className="flex items-center gap-1 text-amber-500 shrink-0">
              <Star className="w-4 h-4 fill-current" />
              <span className="text-sm font-medium">{template.rating}</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-2">{template.description}</p>
        
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Download className="w-3 h-3" />
            {template.downloadCount} downloads
          </span>
          {template.placeholders && (
            <span>{template.placeholders.length} customizable fields</span>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={onPreview}
            data-testid={`button-preview-${template.id}`}
          >
            <Eye className="w-4 h-4 mr-1" />
            Preview
          </Button>
          <Button 
            size="sm" 
            className="flex-1"
            disabled={!template.isAccessible}
            onClick={onDownload}
            data-testid={`button-download-${template.id}`}
          >
            {template.isAccessible ? (
              <>
                <Download className="w-4 h-4 mr-1" />
                Use Template
              </>
            ) : (
              <>
                <Crown className="w-4 h-4 mr-1" />
                Upgrade
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function TemplatePreviewDialog({ 
  template, 
  open, 
  onOpenChange,
  onUse
}: { 
  template: DocumentTemplate | null; 
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUse: () => void;
}) {
  if (!template) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            {template.name}
          </DialogTitle>
          <DialogDescription>
            {template.description}
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-[60vh]">
        <div className="space-y-4 pr-4">
          {template.usageGuide && (
            <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Usage Guide
              </h4>
              <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                {renderMarkdown(template.usageGuide)}
              </div>
            </div>
          )}
          
          {template.placeholders && template.placeholders.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Customizable Fields</h4>
              <div className="grid gap-2">
                {template.placeholders.map((p, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <Badge variant="outline">{`{{${p.key}}}`}</Badge>
                    <span className="text-muted-foreground">{p.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div>
            <h4 className="font-medium mb-2">Template Content</h4>
            <ScrollArea className="h-64 border rounded-lg p-4 bg-muted/30">
              <pre className="text-sm whitespace-pre-wrap font-mono">
                {template.content}
              </pre>
            </ScrollArea>
          </div>
          
          {template.exampleFilled && (
            <div>
              <h4 className="font-medium mb-2">Example (Filled)</h4>
              <ScrollArea className="h-48 border rounded-lg p-4 bg-green-50 dark:bg-green-950/30">
                <pre className="text-sm whitespace-pre-wrap">
                  {template.exampleFilled}
                </pre>
              </ScrollArea>
            </div>
          )}
        </div>
        </ScrollArea>
        
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={onUse} disabled={!template.isAccessible}>
            {template.isAccessible ? (
              <>
                <Download className="w-4 h-4 mr-2" />
                Use This Template
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 mr-2" />
                Upgrade to Access
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function TemplateEditorDialog({
  template,
  open,
  onOpenChange
}: {
  template: DocumentTemplate | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { toast } = useToast();
  const [values, setValues] = useState<Record<string, string>>({});
  const [generatedContent, setGeneratedContent] = useState("");

  const downloadMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", `/api/templates/${template?.id}/download`, { customizations: values });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/templates'] });
      toast({ title: "Template downloaded!", description: "Check your downloads folder" });
    }
  });

  if (!template) return null;

  const generateContent = () => {
    let content = template.content;
    Object.entries(values).forEach(([key, value]) => {
      content = content.replace(new RegExp(`{{${key}}}`, 'g'), value || `[${key}]`);
    });
    setGeneratedContent(content);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedContent || template.content);
    toast({ title: "Copied to clipboard!" });
  };

  const handleDownload = () => {
    const content = generatedContent || template.content;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${template.name.replace(/\s+/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    downloadMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Customize: {template.name}
          </DialogTitle>
          <DialogDescription>
            Fill in the fields below to customize your document
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid md:grid-cols-2 gap-6 overflow-hidden">
          <div className="space-y-4 overflow-y-auto max-h-[50vh] pr-2">
            <h4 className="font-medium">Fill in Your Details</h4>
            {template.placeholders?.map((p, i) => (
              <div key={i} className="space-y-2">
                <Label htmlFor={p.key}>{p.label}</Label>
                {p.description && (
                  <p className="text-xs text-muted-foreground">{p.description}</p>
                )}
                <Textarea
                  id={p.key}
                  value={values[p.key] || ''}
                  onChange={(e) => setValues({ ...values, [p.key]: e.target.value })}
                  placeholder={`Enter ${p.label.toLowerCase()}...`}
                  className="min-h-[80px]"
                  data-testid={`input-${p.key}`}
                />
              </div>
            ))}
            <Button onClick={generateContent} className="w-full" data-testid="button-generate">
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Document
            </Button>
          </div>
          
          <div className="space-y-4 overflow-hidden">
            <h4 className="font-medium">Preview</h4>
            <ScrollArea className="h-[45vh] border rounded-lg p-4 bg-muted/30">
              <pre className="text-sm whitespace-pre-wrap">
                {generatedContent || template.content}
              </pre>
            </ScrollArea>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={handleCopy} data-testid="button-copy">
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </Button>
              <Button className="flex-1" onClick={handleDownload} data-testid="button-save">
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function TemplateLibrary() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [previewTemplate, setPreviewTemplate] = useState<DocumentTemplate | null>(null);
  const [editTemplate, setEditTemplate] = useState<DocumentTemplate | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showEditor, setShowEditor] = useState(false);

  const { data: templates, isLoading } = useQuery<DocumentTemplate[]>({
    queryKey: ['/api/templates'],
    enabled: !!user
  });

  if (authLoading || isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="h-12 bg-muted rounded" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-48 bg-muted rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <SEOHead
          title="Document Template Library | UK Innovator Founder Visa Assistant"
          description="Access 50+ professional document templates for your UK Innovator Founder Visa application."
        />
        <div className="container mx-auto py-8 px-4 max-w-2xl text-center">
          <FileText className="w-16 h-16 mx-auto text-primary mb-4" />
          <h1 className="text-2xl font-bold mb-4">Sign In to Access Templates</h1>
          <p className="text-muted-foreground mb-6">
            Create an account to access our library of professional document templates.
          </p>
          <div className="flex justify-center gap-4">
            <Button asChild>
              <Link href="/login" data-testid="link-login">Sign In</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/signup" data-testid="link-signup">Create Account</Link>
            </Button>
          </div>
        </div>
      </>
    );
  }

  const allTemplates = templates || [];
  const categories = Array.from(new Set(allTemplates.map(t => t.category)));
  
  const filteredTemplates = allTemplates.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase()) ||
                          t.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === "all" || t.category === category;
    return matchesSearch && matchesCategory;
  });

  const accessibleCount = allTemplates.filter(t => t.isAccessible).length;
  const lockedCount = allTemplates.length - accessibleCount;

  return (
    <>
      <SEOHead
        title="Document Template Library | UK Innovator Founder Visa Assistant"
        description="Access 50+ professional document templates for UK Innovator Founder Visa applications. Business plans, cover letters, evidence documents, and more."
      />
      
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3" data-testid="heading-templates">
            <FileText className="w-8 h-8 text-primary" />
            Document Template Library
          </h1>
          <p className="text-muted-foreground">
            Professional templates to strengthen your visa application
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-primary" data-testid="text-total-templates">{allTemplates.length}</div>
              <p className="text-sm text-muted-foreground">Total Templates</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-green-500" data-testid="text-accessible-count">{accessibleCount}</div>
              <p className="text-sm text-muted-foreground">Available to You</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-amber-500" data-testid="text-locked-count">{lockedCount}</div>
              <p className="text-sm text-muted-foreground">Locked</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-blue-500" data-testid="text-categories-count">{categories.length}</div>
              <p className="text-sm text-muted-foreground">Categories</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
              data-testid="input-search"
            />
          </div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full md:w-[200px]" data-testid="select-category">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat}>
                  {categoryLabels[cat] || cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {lockedCount > 0 && (
          <Alert className="mb-6 bg-gradient-to-r from-purple-50 to-amber-50 dark:from-purple-950/30 dark:to-amber-950/30 border-purple-200 dark:border-purple-800">
            <Crown className="w-4 h-4 text-purple-600" />
            <AlertDescription className="flex items-center justify-between">
              <span>Upgrade to access {lockedCount} more premium templates</span>
              <Button size="sm" asChild>
                <Link href="/pricing" data-testid="link-upgrade">
                  View Plans <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {filteredTemplates.length === 0 ? (
          <Card className="p-12 text-center">
            <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Templates Found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filter criteria
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map(template => (
              <TemplateCard
                key={template.id}
                template={template}
                onPreview={() => {
                  setPreviewTemplate(template);
                  setShowPreview(true);
                }}
                onDownload={() => {
                  if (template.isAccessible) {
                    setEditTemplate(template);
                    setShowEditor(true);
                  } else {
                    toast({
                      title: "Upgrade Required",
                      description: `This template requires ${template.requiredTier} tier or higher`,
                      variant: "destructive"
                    });
                  }
                }}
              />
            ))}
          </div>
        )}

        <TemplatePreviewDialog
          template={previewTemplate}
          open={showPreview}
          onOpenChange={setShowPreview}
          onUse={() => {
            if (previewTemplate?.isAccessible) {
              setEditTemplate(previewTemplate);
              setShowPreview(false);
              setShowEditor(true);
            }
          }}
        />

        <TemplateEditorDialog
          template={editTemplate}
          open={showEditor}
          onOpenChange={setShowEditor}
        />
      </div>
    </>
  );
}
