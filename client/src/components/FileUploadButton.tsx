import { Button } from "@/components/ui/button";
import { Upload, Camera, FileText } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: string;
}

export interface FileUploadConfig {
  acceptedTypes: string[];
  maxSizeMB: number;
  label: string;
  description: string;
  allowCamera?: boolean;
}

interface FileUploadButtonProps {
  config: FileUploadConfig;
  onFileSelected: (file: UploadedFile) => void;
  variant?: "default" | "outline" | "secondary";
}

export function FileUploadButton({ 
  config, 
  onFileSelected,
  variant = "outline" 
}: FileUploadButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const { toast } = useToast();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const validateFile = (file: File): boolean => {
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    const isValidType = config.acceptedTypes.some(type => 
      fileExtension === type.toLowerCase()
    );

    if (!isValidType) {
      toast({
        title: "Invalid file type",
        description: `Please upload: ${config.acceptedTypes.join(', ')}`,
        variant: "destructive"
      });
      return false;
    }

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
      const uploadedFile: UploadedFile = {
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: file.size,
        type: file.type,
        uploadedAt: new Date().toLocaleString()
      };
      onFileSelected(uploadedFile);
      toast({
        title: "File uploaded",
        description: file.name,
      });
    }
    if (event.target) event.target.value = '';
  };

  return (
    <div className="relative">
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

      {isMobile && config.allowCamera ? (
        <div className="flex gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={variant}
                size="sm"
                onClick={() => cameraInputRef.current?.click()}
                data-testid="button-camera-upload"
              >
                <Camera className="h-4 w-4 mr-2" />
                Camera
              </Button>
            </TooltipTrigger>
            <TooltipContent>Take a photo with your device camera</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={variant}
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                data-testid="button-file-upload"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </Button>
            </TooltipTrigger>
            <TooltipContent>Upload a file from your device</TooltipContent>
          </Tooltip>
        </div>
      ) : (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={variant}
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              data-testid="button-file-upload"
            >
              <FileText className="h-4 w-4 mr-2" />
              {config.label}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{config.description}</TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}
