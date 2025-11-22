import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Smartphone, X, Clock } from "lucide-react";
import { SessionHandoffData } from "@/hooks/useSessionHandoff";

interface SessionHandoffDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  handoffData: SessionHandoffData | null;
  isGenerating: boolean;
}

export function SessionHandoffDialog({ 
  open, 
  onOpenChange, 
  handoffData,
  isGenerating 
}: SessionHandoffDialogProps) {
  const expiresIn = handoffData?.expiresAt 
    ? Math.max(0, Math.floor((new Date(handoffData.expiresAt).getTime() - Date.now()) / 60000))
    : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" data-testid="dialog-session-handoff">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-primary" />
            Continue on Mobile
          </DialogTitle>
          <DialogDescription>
            Scan this QR code with your phone to continue on mobile
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-4">
          {isGenerating ? (
            <div className="w-[300px] h-[300px] flex items-center justify-center bg-muted rounded-lg">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : handoffData?.qrCodeDataUrl ? (
            <>
              <div className="bg-white p-4 rounded-lg border-2 border-border">
                <img 
                  src={handoffData.qrCodeDataUrl} 
                  alt="QR Code for mobile handoff" 
                  className="w-[300px] h-[300px]"
                  data-testid="img-qr-code"
                />
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span data-testid="text-expires-in">
                  Expires in {expiresIn} minutes
                </span>
              </div>

              <div className="text-center text-sm text-muted-foreground">
                <p>Open your phone's camera</p>
                <p>Point it at the QR code</p>
                <p>Tap the notification to continue</p>
              </div>
            </>
          ) : (
            <div className="text-center text-muted-foreground">
              <p>Failed to generate QR code</p>
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            data-testid="button-close-handoff"
          >
            <X className="h-4 w-4 mr-2" />
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
