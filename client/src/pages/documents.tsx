import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";

import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  FileText, Upload, FolderOpen, Trash2, Download, Eye, 
  CheckCircle2, Clock, AlertTriangle, Plus, Search,
  FileImage, File, FileSpreadsheet, Shield
} from "lucide-react";
import type { UserDocument } from "@shared/schema";

const DOCUMENT_CATEGORIES = [
  { value: "passport", label: "Passport & ID", icon: Shield, description: "Identity documents" },
  { value: "bank_statement", label: "Bank Statements", icon: FileSpreadsheet, description: "Financial evidence" },
  { value: "business_plan", label: "Business Plan", icon: FileText, description: "Your visa business plan" },
  { value: "endorsement", label: "Endorsement", icon: CheckCircle2, description: "Endorser letters" },
  { value: "education", label: "Education", icon: FileText, description: "Degrees and certificates" },
  { value: "employment", label: "Employment", icon: FileText, description: "Work history evidence" },
  { value: "english", label: "English Test", icon: FileText, description: "IELTS/equivalent scores" },
  { value: "other", label: "Other Documents", icon: File, description: "Additional supporting docs" },
];

function getFileIcon(fileType: string) {
  if (fileType.includes("image")) return FileImage;
  if (fileType.includes("spreadsheet") || fileType.includes("excel")) return FileSpreadsheet;
  return FileText;
}

function getStatusBadge(status: string) {
  switch (status) {
    case "verified":
      return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"><CheckCircle2 className="w-3 h-3 mr-1" />Verified</Badge>;
    case "rejected":
      return <Badge variant="destructive"><AlertTriangle className="w-3 h-3 mr-1" />Rejected</Badge>;
    default:
      return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
  }
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DocumentsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    name: "",
    category: "",
    description: "",
    file: null as File | null,
  });
  const [uploadProgress, setUploadProgress] = useState(0);

  const { data: documents = [], isLoading } = useQuery<UserDocument[]>({
    queryKey: ["/api/documents"],
    enabled: !!user,
  });

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Upload failed");
      }
      return response.json();
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      await queryClient.refetchQueries({ queryKey: ["/api/documents"], type: 'active' });
      setUploadDialogOpen(false);
      setUploadForm({ name: "", category: "", description: "", file: null });
      setUploadProgress(0);
      toast({ title: "Document uploaded successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/documents/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || "Delete failed");
      }
      return response.json();
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      await queryClient.refetchQueries({ queryKey: ["/api/documents"], type: 'active' });
      toast({ title: "Document deleted successfully" });
    },
    onError: (error: Error) => {
      console.error("[Delete Error]", error);
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
    },
  });

  const handleUpload = async () => {
    if (!uploadForm.file || !uploadForm.name || !uploadForm.category) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }

    const formData = new FormData();
    formData.append("file", uploadForm.file);
    formData.append("name", uploadForm.name);
    formData.append("category", uploadForm.category);
    formData.append("description", uploadForm.description);

    setUploadProgress(30);
    setTimeout(() => setUploadProgress(60), 500);
    uploadMutation.mutate(formData);
    setTimeout(() => setUploadProgress(100), 1000);
  };

  const filteredDocuments = documents.filter((doc) => {
    const matchesCategory = selectedCategory === "all" || doc.category === selectedCategory;
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const documentsByCategory = DOCUMENT_CATEGORIES.map((cat) => ({
    ...cat,
    count: documents.filter((d) => d.category === cat.value).length,
  }));

  return (
    <>
      <div className="container mx-auto py-8 px-4 md:px-6 max-w-6xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl font-bold mb-1" data-testid="heading-documents">
              Document Storage
            </h1>
            <p className="text-sm text-muted-foreground">
              Securely store and manage your visa application documents
            </p>
          </div>

          <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-[#005EB8] to-[#41B6E6] text-white" data-testid="button-upload">
                <Upload className="w-4 h-4 mr-2" />
                Upload Document
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Upload Document</DialogTitle>
                <DialogDescription>
                  Add a new document to your visa application portfolio
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Document Name *</Label>
                  <Input
                    id="name"
                    value={uploadForm.name}
                    onChange={(e) => setUploadForm({ ...uploadForm, name: e.target.value })}
                    placeholder="e.g., Passport Scan"
                    data-testid="input-doc-name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={uploadForm.category} onValueChange={(v) => setUploadForm({ ...uploadForm, category: v })}>
                    <SelectTrigger id="category" data-testid="select-category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {DOCUMENT_CATEGORIES.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={uploadForm.description}
                    onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                    placeholder="Optional notes about this document"
                    rows={2}
                    data-testid="input-description"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="file">File *</Label>
                  <Input
                    id="file"
                    type="file"
                    onChange={(e) => setUploadForm({ ...uploadForm, file: e.target.files?.[0] || null })}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xls,.xlsx"
                    data-testid="input-file"
                  />
                  <p className="text-xs text-muted-foreground">
                    Accepted: PDF, Word, Excel, Images (max 10MB)
                  </p>
                </div>

                {uploadProgress > 0 && uploadProgress < 100 && (
                  <Progress value={uploadProgress} className="h-2" />
                )}

                <Button
                  onClick={handleUpload}
                  disabled={uploadMutation.isPending}
                  className="w-full"
                  data-testid="button-submit-upload"
                >
                  {uploadMutation.isPending ? "Uploading..." : "Upload Document"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {documentsByCategory.slice(0, 4).map((cat) => (
            <Card 
              key={cat.value}
              className={`cursor-pointer hover-elevate ${selectedCategory === cat.value ? 'ring-2 ring-primary' : ''}`}
              onClick={() => setSelectedCategory(selectedCategory === cat.value ? "all" : cat.value)}
            >
              <CardContent className="pt-4 pb-3">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <cat.icon className="w-4 h-4 text-primary" />
                  </div>
                  <Badge variant="secondary" className="text-xs">{cat.count}</Badge>
                </div>
                <h3 className="text-sm font-medium mt-2">{cat.label}</h3>
                <p className="text-xs text-muted-foreground">{cat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <CardTitle className="flex items-center gap-2">
                <FolderOpen className="w-5 h-5" />
                Your Documents
                <Badge variant="outline">{filteredDocuments.length}</Badge>
              </CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search documents..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 w-64"
                    data-testid="input-search"
                  />
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-40" data-testid="select-filter">
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {DOCUMENT_CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading documents...</div>
            ) : filteredDocuments.length === 0 ? (
              <div className="text-center py-12">
                <FolderOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-medium text-lg mb-2">No documents yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start building your visa application portfolio by uploading your first document.
                </p>
                <Button onClick={() => setUploadDialogOpen(true)} data-testid="button-upload-empty">
                  <Plus className="w-4 h-4 mr-2" />
                  Upload First Document
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredDocuments.map((doc) => {
                  const FileIcon = getFileIcon(doc.fileType);
                  return (
                    <div
                      key={doc.id}
                      className="flex items-center gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                      data-testid={`document-${doc.id}`}
                    >
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                        <FileIcon className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium truncate">{doc.name}</h4>
                          {getStatusBadge(doc.status || 'pending')}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span>{DOCUMENT_CATEGORIES.find(c => c.value === doc.category)?.label}</span>
                          <span>{formatFileSize(doc.fileSize)}</span>
                          <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                        </div>
                        {doc.description && (
                          <p className="text-sm text-muted-foreground mt-1 truncate">{doc.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" asChild>
                          <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" data-testid={`button-view-${doc.id}`}>
                            <Eye className="w-4 h-4" />
                          </a>
                        </Button>
                        <Button variant="ghost" size="icon" asChild>
                          <a href={doc.fileUrl} download data-testid={`button-download-${doc.id}`}>
                            <Download className="w-4 h-4" />
                          </a>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (confirm("Are you sure you want to delete this document?")) {
                              deleteMutation.mutate(doc.id);
                            }
                          }}
                          data-testid={`button-delete-${doc.id}`}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Alert className="mt-8">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            <strong>Security Notice:</strong> All documents are encrypted and stored securely. 
            Only you can access your uploaded files. We recommend uploading certified copies rather than originals.
          </AlertDescription>
        </Alert>
      </div>
    </>
  );
}
