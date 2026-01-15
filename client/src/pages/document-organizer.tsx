import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2, Circle, Upload, Download, AlertCircle, Loader2, Trash2, Package, FileText } from "lucide-react";
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import FeatureNavigation from "@/components/FeatureNavigation";

interface UserDocument {
  id: string;
  userId: string;
  name: string;
  category: string;
  description: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  status: string;
  notes: string | null;
  expiryDate: string | null;
  createdAt: string;
  updatedAt: string;
}

const documentCategories = [
  {
    category: "Personal & Legal",
    categoryKey: "personal_legal",
    documents: [
      { name: "Passport Copy", required: true, extensions: "PDF, JPG" },
      { name: "Proof of Identity", required: true, extensions: "PDF, JPG" },
      { name: "Criminal Records Check", required: true, extensions: "PDF" }
    ]
  },
  {
    category: "Business Documentation",
    categoryKey: "business",
    documents: [
      { name: "Business Registration", required: true, extensions: "PDF" },
      { name: "Memorandum of Association", required: true, extensions: "PDF" },
      { name: "Business Plan", required: true, extensions: "PDF, DOCX" },
      { name: "Financial Projections", required: true, extensions: "XLS, XLSX, PDF" }
    ]
  },
  {
    category: "Financial Evidence",
    categoryKey: "financial",
    documents: [
      { name: "Bank Statements (3 months)", required: true, extensions: "PDF" },
      { name: "Investment Evidence", required: true, extensions: "PDF" },
      { name: "Funding Source Documentation", required: false, extensions: "PDF" },
      { name: "Tax Returns", required: false, extensions: "PDF" }
    ]
  },
  {
    category: "Innovation & IP",
    categoryKey: "innovation",
    documents: [
      { name: "Patent/IP Documentation", required: false, extensions: "PDF" },
      { name: "Technical Specifications", required: false, extensions: "PDF, DOCX" },
      { name: "Market Research", required: false, extensions: "PDF" }
    ]
  },
  {
    category: "Team & Credentials",
    categoryKey: "team",
    documents: [
      { name: "CV/Resume", required: true, extensions: "PDF, DOCX" },
      { name: "Education Certificates", required: false, extensions: "PDF, JPG" },
      { name: "Professional Licenses", required: false, extensions: "PDF, JPG" }
    ]
  }
];

export default function DocumentOrganizer() {
  const { toast } = useToast();
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);

  // Fetch existing documents from the backend
  const { data: documents = [], isLoading, refetch } = useQuery<UserDocument[]>({
    queryKey: ['/api/documents'],
  });

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async ({ file, name, category }: { file: File; name: string; category: string }) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('name', name);
      formData.append('category', category);
      formData.append('description', `Uploaded document: ${name}`);

      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      return response.json();
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
      await queryClient.refetchQueries({ queryKey: ['/api/documents'], type: 'active' });
      toast({
        title: "Document uploaded",
        description: "Your document has been saved successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    },
    onSettled: () => {
      setUploadingDoc(null);
    },
  });

  // Delete mutation with optimistic update
  const deleteMutation = useMutation({
    mutationFn: async (docId: string) => {
      const response = await fetch(`/api/documents/${docId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || "Delete failed");
      }
      return { id: docId };
    },
    onMutate: async (docId: string) => {
      await queryClient.cancelQueries({ queryKey: ['/api/documents'] });
      const previousDocuments = queryClient.getQueryData<UserDocument[]>(['/api/documents']);
      queryClient.setQueryData<UserDocument[]>(['/api/documents'], (old) => 
        old ? old.filter((doc) => doc.id !== docId) : []
      );
      return { previousDocuments };
    },
    onError: (error: Error, _id, context) => {
      if (context?.previousDocuments) {
        queryClient.setQueryData(['/api/documents'], context.previousDocuments);
      }
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive",
      });
    },
    onSuccess: () => {
      toast({
        title: "Document deleted",
        description: "The document has been removed.",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
    },
  });

  const handleFileUpload = (docName: string, categoryKey: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadingDoc(docName);
      uploadMutation.mutate({ file, name: docName, category: categoryKey });
    }
    // Reset input so same file can be re-uploaded
    e.target.value = '';
  };

  // Find if a document exists for a given name
  const getUploadedDoc = (docName: string): UserDocument | undefined => {
    return documents.find(d => d.name === docName);
  };

  const requiredDocuments = documentCategories.flatMap(cat =>
    cat.documents.filter(doc => doc.required).map(doc => doc.name)
  );

  const requiredUploadedCount = documents.filter(doc => requiredDocuments.includes(doc.name)).length;
  const completionPercentage = Math.round((requiredUploadedCount / requiredDocuments.length) * 100);

  // Download checklist as PDF
  const handleDownloadChecklist = () => {
    const checklist = documentCategories.map(cat => {
      const docs = cat.documents.map(doc => {
        const uploaded = getUploadedDoc(doc.name);
        return `${uploaded ? '✓' : '☐'} ${doc.name}${doc.required ? ' (Required)' : ''} - ${doc.extensions}`;
      }).join('\n');
      return `\n${cat.category}\n${'─'.repeat(30)}\n${docs}`;
    }).join('\n\n');

    const content = `UK INNOVATOR FOUNDER VISA - DOCUMENT CHECKLIST
Generated: ${new Date().toLocaleDateString('en-GB')}

Application Completeness: ${completionPercentage}%
Required Documents: ${requiredUploadedCount}/${requiredDocuments.length} uploaded
Total Documents: ${documents.length} uploaded

${checklist}

────────────────────────────────────────
Notes:
- All required documents must be submitted
- PDF format preferred for most documents
- Ensure all documents are in English or include certified translations
- Bank statements must be from the last 3 months
────────────────────────────────────────
`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'visa_document_checklist.txt';
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Checklist downloaded",
      description: "Your document checklist has been saved.",
    });
  };

  // Export package - download all documents as a list with links
  const handleExportPackage = async () => {
    if (documents.length === 0) {
      toast({
        title: "No documents to export",
        description: "Please upload some documents first.",
        variant: "destructive",
      });
      return;
    }

    // Create a manifest file with download links for all documents
    const manifest = documents.map((doc, idx) => 
      `${idx + 1}. ${doc.name}\n   Category: ${doc.category}\n   Type: ${doc.fileType}\n   Size: ${(doc.fileSize / 1024).toFixed(1)} KB\n   Uploaded: ${new Date(doc.createdAt).toLocaleDateString('en-GB')}\n   File: ${window.location.origin}${doc.fileUrl}`
    ).join('\n\n');

    const content = `UK INNOVATOR FOUNDER VISA - DOCUMENT PACKAGE
Generated: ${new Date().toLocaleDateString('en-GB')} at ${new Date().toLocaleTimeString('en-GB')}

Application Completeness: ${completionPercentage}%
Total Documents: ${documents.length}

────────────────────────────────────────
DOCUMENT LIST
────────────────────────────────────────

${manifest}

────────────────────────────────────────
IMPORTANT NOTES
────────────────────────────────────────
- Download all documents from the links above
- Organize them in folders by category before submission
- Verify all files open correctly
- Ensure translations are certified if not in English
────────────────────────────────────────
`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'visa_document_package.txt';
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Package exported",
      description: `Manifest with ${documents.length} document links saved. Open the file to access download links.`,
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      
      <div className="responsive-container py-16">
        <div className="max-w-4xl mx-auto">
          <FeatureNavigation currentPage="document-organizer" />
          <div className="mb-12">
            <h1 className="font-serif text-xl font-bold mb-4">Document Manager & Evidence Organizer</h1>
            <p className="text-lg text-muted-foreground">
              Intelligent document tracking and submission management. Captures all required evidence, identifies gaps, and prepares lawyer-ready packages—preventing costly rejections before they happen.
            </p>
          </div>

          <div className="mb-8 p-6 bg-primary/10 rounded-lg border border-primary/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">Application Completeness</h3>
              <span className="text-lg font-bold text-primary">{completionPercentage}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
              <div
                className="bg-primary h-full transition-all"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
            <p className="text-sm text-muted-foreground mt-3">
              {requiredUploadedCount} of {requiredDocuments.length} required documents uploaded • {documents.length} total documents saved
            </p>
          </div>

          <div className="space-y-8">
            {documentCategories.map(category => (
              <Card key={category.category} className="p-6">
                <h3 className="font-semibold text-lg mb-4">{category.category}</h3>
                <div className="space-y-4">
                  {category.documents.map(doc => {
                    const uploadedDoc = getUploadedDoc(doc.name);
                    const isUploading = uploadingDoc === doc.name;
                    return (
                      <div key={doc.name} className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
                        <div className="flex-shrink-0 mt-1">
                          {uploadedDoc ? (
                            <CheckCircle2 className="w-6 h-6 text-green-600" />
                          ) : (
                            <Circle className="w-6 h-6 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="font-medium">{doc.name}</span>
                            {doc.required && <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">Required</span>}
                          </div>
                          <p className="text-sm text-muted-foreground">{doc.extensions}</p>
                          {uploadedDoc && (
                            <div className="mt-2 text-xs text-muted-foreground flex items-center gap-2 flex-wrap">
                              <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded">
                                Uploaded
                              </span>
                              <span>{formatFileSize(uploadedDoc.fileSize)}</span>
                              <span>•</span>
                              <span>{new Date(uploadedDoc.createdAt).toLocaleDateString('en-GB')}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex-shrink-0 flex items-center gap-2">
                          {uploadedDoc && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => window.open(uploadedDoc.fileUrl, '_blank')}
                                title="Download"
                                data-testid={`button-download-${doc.name.replace(/\s+/g, '-').toLowerCase()}`}
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  if (confirm(`Delete ${doc.name}?`)) {
                                    deleteMutation.mutate(uploadedDoc.id);
                                  }
                                }}
                                disabled={deleteMutation.isPending}
                                title="Delete"
                                data-testid={`button-delete-${doc.name.replace(/\s+/g, '-').toLowerCase()}`}
                              >
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </>
                          )}
                          <label className="flex-shrink-0">
                            <Input
                              type="file"
                              className="hidden"
                              accept={doc.extensions.split(", ").map(ext => `.${ext.toLowerCase()}`).join(",")}
                              onChange={(e) => handleFileUpload(doc.name, category.categoryKey, e)}
                              disabled={isUploading}
                              data-testid={`input-file-${doc.name.replace(/\s+/g, '-').toLowerCase()}`}
                            />
                            <Button
                              variant={uploadedDoc ? "outline" : "default"}
                              size="sm"
                              onClick={(e) => e.currentTarget.parentElement?.querySelector('input')?.click()}
                              disabled={isUploading}
                              data-testid={`button-upload-${doc.name.replace(/\s+/g, '-').toLowerCase()}`}
                            >
                              {isUploading ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              ) : (
                                <Upload className="w-4 h-4 mr-2" />
                              )}
                              {uploadedDoc ? "Replace" : "Upload"}
                            </Button>
                          </label>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            ))}
          </div>

          <div className="mt-12 flex flex-wrap gap-4">
            <Button 
              className="gap-2"
              onClick={handleDownloadChecklist}
              data-testid="button-download-checklist"
            >
              <FileText className="w-4 h-4" />
              Download Checklist
            </Button>
            <Button 
              variant="outline" 
              className="gap-2"
              onClick={handleExportPackage}
              disabled={documents.length === 0}
              data-testid="button-export-package"
            >
              <Package className="w-4 h-4" />
              Export Package ({documents.length} docs)
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
