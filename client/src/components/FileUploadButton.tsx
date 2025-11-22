import { Button } from "@/components/ui/button";
import { Upload, Camera, FileText } from "lucide-react";
import { useRef, useState } from "react";
import { useToast } from "@/hooks/use-toast";

export interface FileUploadConfig {
  acceptedTypes: string[];
  maxSizeMB: number;
  label: string;
  description: string;
  allowCamera?: boolean;
}

interface FileUploadButtonProps {
  config: FileUploadConfig;
  onFileSelected: (file: File) => void;
  variant?: "default" | "outline" | "secondary";
}

export function FileUploadButton({ 
  config, 
  onFileSelected,
  variant = "outline" 
}: FileUploadButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [showOptions, setShowOptions] = useState(false);
  const { toast } = useToast();

  const validateFile = (file: File): boolean => {
    // Check file type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    const isValidType = config.acceptedTypes.some(type => 
      fileExtension === type.toLowerCase() || 
      file.type.startsWith(type.replace('*', ''))
    );

    if (!isValidType) {
      toast({
        title: "Invalid file type",
        description: `Please upload: ${config.acceptedTypes.join(', ')}`,
        variant: "destructive"
      });
      return false;
    }

    // Check file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > config.maxSizeMB) {
      toast({
        title: "File too large",
        description: `Maximum file size is ${config.maxSizeMB}MB`,
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && validateFile(file)) {
      onFileSelected(file);
      toast({
        title: "File uploaded",
        description: file.name,
      });
    }
    // Reset input
    if (event.target) event.target.value = '';
  };

  const handleFileUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleCameraClick = () => {
    cameraInputRef.current?.click();
  };

  return (
    <div className="relative">
      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept={config.acceptedTypes.join(',')}
        onChange={handleFileChange}
        className="hidden"
        data-testid="input-file-upload"
      />
      
      {config.allowCamera && (
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          className="hidden"
          data-testid="input-camera-capture"
        />
      )}

      {/* Mobile: Show both options */}
      {config.allowCamera && window.innerWidth < 768 ? (
        <div className="flex gap-2">
          <Button
            variant={variant}
            size="sm"
            onClick={handleCameraClick}
            data-testid="button-camera-upload"
            title="Take photo"
          >
            <Camera className="h-4 w-4 mr-2" />
            Camera
          </Button>
          <Button
            variant={variant}
            size="sm"
            onClick={handleFileUploadClick}
            data-testid="button-file-upload"
            title={config.description}
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload
          </Button>
        </div>
      ) : (
        /* Desktop: Single upload button */
        <Button
          variant={variant}
          size="sm"
          onClick={handleFileUploadClick}
          data-testid="button-file-upload"
          title={config.description}
        >
          <FileText className="h-4 w-4 mr-2" />
          {config.label}
        </Button>
      )}
    </div>
  );
}
