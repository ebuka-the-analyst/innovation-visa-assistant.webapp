import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2, Circle, Upload, Download, AlertCircle } from "lucide-react";
import { useState } from "react";
import { AuthHeader } from "@/components/AuthHeader";

const documentCategories = [
  {
    category: "Personal & Legal",
    documents: [
      { name: "Passport Copy", required: true, extensions: "PDF, JPG" },
      { name: "Proof of Identity", required: true, extensions: "PDF, JPG" },
      { name: "Criminal Records Check", required: true, extensions: "PDF" }
    ]
  },
  {
    category: "Business Documentation",
    documents: [
      { name: "Business Registration", required: true, extensions: "PDF" },
      { name: "Memorandum of Association", required: true, extensions: "PDF" },
      { name: "Business Plan", required: true, extensions: "PDF, DOCX" },
      { name: "Financial Projections", required: true, extensions: "XLS, XLSX" }
    ]
  },
  {
    category: "Financial Evidence",
    documents: [
      { name: "Bank Statements (3 months)", required: true, extensions: "PDF" },
      { name: "Investment Evidence", required: true, extensions: "PDF" },
      { name: "Funding Source Documentation", required: false, extensions: "PDF" },
      { name: "Tax Returns", required: false, extensions: "PDF" }
    ]
  },
  {
    category: "Innovation & IP",
    documents: [
      { name: "Patent/IP Documentation", required: false, extensions: "PDF" },
      { name: "Technical Specifications", required: false, extensions: "PDF, DOCX" },
      { name: "Market Research", required: false, extensions: "PDF" }
    ]
  },
  {
    category: "Team & Credentials",
    documents: [
      { name: "CV/Resume", required: true, extensions: "PDF, DOCX" },
      { name: "Education Certificates", required: false, extensions: "PDF, JPG" },
      { name: "Professional Licenses", required: false, extensions: "PDF, JPG" }
    ]
  }
];

interface UploadedDoc {
  name: string;
  uploaded: boolean;
  file?: File;
}

export default function DocumentOrganizer() {
  const [uploads, setUploads] = useState<{ [key: string]: UploadedDoc }>({});

  const handleFileUpload = (docName: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setUploads(prev => ({
        ...prev,
        [docName]: {
          name: docName,
          uploaded: true,
          file: e.target.files![0]
        }
      }));
    }
  };

  const requiredDocuments = documentCategories.flatMap(cat =>
    cat.documents.filter(doc => doc.required).map(doc => doc.name)
  );

  const uploadedCount = Object.values(uploads).filter(u => u.uploaded).length;
  const requiredUploadedCount = Object.entries(uploads)
    .filter(([docName, doc]) => doc.uploaded && requiredDocuments.includes(docName))
    .length;

  const completionPercentage = Math.round((requiredUploadedCount / requiredDocuments.length) * 100);

  return (
    <div className="min-h-screen">
      <AuthHeader />
      <div className="container mx-auto px-4 md:px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="mb-12">
            <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">Document Evidence Organizer</h1>
            <p className="text-lg text-muted-foreground">
              Track, upload, and organize all required documents for your visa application
            </p>
          </div>

          <div className="mb-8 p-6 bg-primary/10 rounded-lg border border-primary/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">Application Completeness</h3>
              <span className="text-2xl font-bold text-primary">{completionPercentage}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
              <div
                className="bg-primary h-full transition-all"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
            <p className="text-sm text-muted-foreground mt-3">
              {requiredUploadedCount} of {requiredDocuments.length} required documents uploaded
            </p>
          </div>

          <div className="space-y-8">
            {documentCategories.map(category => (
              <Card key={category.category} className="p-6">
                <h3 className="font-semibold text-lg mb-4">{category.category}</h3>
                <div className="space-y-4">
                  {category.documents.map(doc => {
                    const isUploaded = uploads[doc.name]?.uploaded;
                    return (
                      <div key={doc.name} className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
                        <div className="flex-shrink-0 mt-1">
                          {isUploaded ? (
                            <CheckCircle2 className="w-6 h-6 text-green-600" />
                          ) : (
                            <Circle className="w-6 h-6 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{doc.name}</span>
                            {doc.required && <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">Required</span>}
                          </div>
                          <p className="text-sm text-muted-foreground">{doc.extensions}</p>
                        </div>
                        <label className="flex-shrink-0">
                          <Input
                            type="file"
                            className="hidden"
                            accept={doc.extensions.split(", ").map(ext => `.${ext.toLowerCase()}`).join(",")}
                            onChange={(e) => handleFileUpload(doc.name, e)}
                            data-testid={`input-file-${doc.name.replace(/\s+/g, '-').toLowerCase()}`}
                          />
                          <Button
                            variant={isUploaded ? "outline" : "default"}
                            size="sm"
                            onClick={(e) => e.currentTarget.parentElement?.querySelector('input')?.click()}
                            data-testid={`button-upload-${doc.name.replace(/\s+/g, '-').toLowerCase()}`}
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            {isUploaded ? "Replace" : "Upload"}
                          </Button>
                        </label>
                      </div>
                    );
                  })}
                </div>
              </Card>
            ))}
          </div>

          <div className="mt-12 flex gap-4">
            <Button className="gap-2">
              <Download className="w-4 h-4" />
              Download Checklist
            </Button>
            <Button variant="outline" className="gap-2">
              Export Package
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
