import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AuthHeader } from "@/components/AuthHeader";
import { ToolNavigation } from "@/components/ToolNavigation";
import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { FileUploadButton } from "@/components/FileUploadButton";
import { FileList } from "@/components/FileList";
import { fileUploadConfigs } from "@/lib/fileUploadConfigs";
import { useState, useEffect } from "react";
import { FolderPlus, Download } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function DocOrganizer() {
  const [folders, setFolders] = useState([
    { id: "1", name: "Business Plan", files: 4 },
    { id: "2", name: "Financial Records", files: 8 },
    { id: "3", name: "Team Info", files: 6 },
    { id: "4", name: "Product Docs", files: 5 },
    { id: "5", name: "Legal", files: 3 }
  ]);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [savedDate, setSavedDate] = useState("");

  const totalFiles = folders.reduce((sum, f) => sum + f.files, 0);

  const saveProgress = () => {
    localStorage.setItem('docOrganizerFiles', JSON.stringify(uploadedFiles));
    localStorage.setItem('docOrganizerDate', new Date().toLocaleDateString());
    setSavedDate(new Date().toLocaleDateString());
  };

  const handleFileUpload = (file: any) => {
    setUploadedFiles(prev => [...prev, file]);
  };

  const handleRemoveFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const downloadAllDocuments = () => {
    const report = `DOCUMENT ORGANIZER MANIFEST\nDate: ${new Date().toLocaleDateString()}\nTotal Documents: ${totalFiles}\nUploaded Files: ${uploadedFiles.length}`;
    const blob = new Blob([report], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'document-organizer.txt';
    a.click();
  };

  const getSerializedState = () => ({
    uploadedFiles,
    savedDate
  });

  useEffect(() => {
    const savedFiles = localStorage.getItem('docOrganizerFiles');
    if (savedFiles) setUploadedFiles(JSON.parse(savedFiles));
  }, []);

  return (
    <>
      <AuthHeader />
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        <ToolNavigation />
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Document Organizer</h1>
          <p className="text-muted-foreground mb-6">Manage all submission documents</p>

          <ToolUtilityBar
            toolId="doc-organizer"
            toolName="Document Organizer"
            onSave={saveProgress}
            onExport={downloadAllDocuments}
            getSerializedState={getSerializedState}
          />

          <div className="mb-4">
            <FileUploadButton
              config={fileUploadConfigs.documentOrganizer}
              onFileSelected={handleFileUpload}
              variant="secondary"
            />
          </div>

          <FileList files={uploadedFiles} onRemove={handleRemoveFile} />

          {savedDate && <Alert className="mb-4"><AlertDescription>Last saved: {savedDate}</AlertDescription></Alert>}

          <Card className="p-4 mb-4">
            <p className="font-semibold">Total Documents: {totalFiles + uploadedFiles.length}</p>
          </Card>

          <div className="grid md:grid-cols-2 gap-4 mb-4">
            {folders.map(f => (
              <Card key={f.id} className="p-4 hover-elevate">
                <div className="flex items-center gap-3">
                  <FolderPlus className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-semibold">{f.name}</p>
                    <p className="text-xs text-muted-foreground">{f.files} files</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <Button className="w-full gap-2 bg-primary" onClick={downloadAllDocuments} data-testid="button-download-all">
            <Download className="w-4 h-4" />
            Download All Documents
          </Button>
        </div>
      </div>
    </>
  );
}
