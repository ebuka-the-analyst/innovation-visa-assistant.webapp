import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileText, X, Download } from "lucide-react";
import { UploadedFile } from "./FileUploadButton";

interface FileListProps {
  files: UploadedFile[];
  onRemove: (fileId: string) => void;
}

export function FileList({ files, onRemove }: FileListProps) {
  if (files.length === 0) return null;

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <Card className="p-4 mb-4 bg-blue-50 border-blue-200">
      <h3 className="font-bold mb-3 flex items-center gap-2">
        <FileText className="h-4 w-4" />
        Uploaded Documents ({files.length})
      </h3>
      <div className="space-y-2">
        {files.map(file => (
          <div key={file.id} className="flex items-center justify-between bg-white p-3 rounded-lg border">
            <div className="flex-1">
              <p className="font-semibold text-sm truncate">{file.name}</p>
              <p className="text-xs text-muted-foreground">
                {formatFileSize(file.size)} • {file.uploadedAt}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemove(file.id)}
              data-testid={`button-remove-file-${file.id}`}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );
}
