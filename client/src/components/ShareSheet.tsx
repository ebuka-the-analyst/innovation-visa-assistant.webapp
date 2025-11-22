import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Share2, Mail, MessageCircle, X } from "lucide-react";
import { SiX, SiLinkedin } from "react-icons/si";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useState } from "react";

interface ShareSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  toolId: string;
  toolName: string;
  onGenerateShareableLink?: () => Promise<string>;
}

export function ShareSheet({ 
  open, 
  onOpenChange, 
  toolId,
  toolName,
  onGenerateShareableLink 
}: ShareSheetProps) {
  const { toast } = useToast();
  const [includeProgress, setIncludeProgress] = useState(false);
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);

  const baseUrl = window.location.origin;
  const toolPath = window.location.pathname;
  
  const trackShare = async (channel: string, sessionToken?: string) => {
    try {
      await apiRequest("POST", "/api/referrals", { 
        toolId, 
        channel,
        sessionToken: sessionToken || null
      });
    } catch (err) {
      console.error("Failed to track referral:", err);
    }
  };

  const getShareUrl = async () => {
    if (includeProgress && onGenerateShareableLink) {
      setIsGeneratingLink(true);
      try {
        return await onGenerateShareableLink();
      } finally {
        setIsGeneratingLink(false);
      }
    }
    return `${baseUrl}${toolPath}`;
  };

  const shareViaWhatsApp = async () => {
    const shareUrl = await getShareUrl();
    const text = `Check out this UK Innovation Visa tool: ${toolName}`;
    const url = `https://wa.me/?text=${encodeURIComponent(text + '\n' + shareUrl)}`;
    window.open(url, '_blank');
    trackShare('whatsapp');
  };

  const shareViaEmail = async () => {
    const shareUrl = await getShareUrl();
    const subject = encodeURIComponent(`UK Innovation Visa Tool: ${toolName}`);
    const body = encodeURIComponent(
      `I thought you might find this UK Innovation Visa tool helpful:\n\n${toolName}\n\n${shareUrl}\n\nThis is from the UK's #1 Innovation Visa Partner - BhenMedia`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    trackShare('email');
  };

  const shareViaTwitter = async () => {
    const shareUrl = await getShareUrl();
    const text = encodeURIComponent(`Check out this UK Innovation Visa tool: ${toolName}`);
    const url = `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank');
    trackShare('twitter');
  };

  const shareViaLinkedIn = async () => {
    const shareUrl = await getShareUrl();
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank');
    trackShare('linkedin');
  };

  const shareViaNative = async () => {
    if (navigator.share) {
      const shareUrl = await getShareUrl();
      try {
        await navigator.share({
          title: toolName,
          text: `Check out this UK Innovation Visa tool: ${toolName}`,
          url: shareUrl,
        });
        trackShare('native');
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Share failed:', err);
        }
      }
    }
  };

  const copyLink = async () => {
    const shareUrl = await getShareUrl();
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Link copied!",
        description: "Share link copied to clipboard",
      });
      trackShare('copy');
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" data-testid="dialog-share-sheet">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-primary" />
            Share This Tool
          </DialogTitle>
          <DialogDescription>
            Share {toolName} with friends and colleagues
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-4">
          {onGenerateShareableLink && (
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="flex flex-col gap-1">
                <Label htmlFor="include-progress">Include my progress</Label>
                <p className="text-sm text-muted-foreground">
                  Share a link with your current data
                </p>
              </div>
              <Switch
                id="include-progress"
                checked={includeProgress}
                onCheckedChange={setIncludeProgress}
                data-testid="switch-include-progress"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="h-auto flex-col gap-2 p-4"
              onClick={shareViaWhatsApp}
              disabled={isGeneratingLink}
              data-testid="button-share-whatsapp"
            >
              <MessageCircle className="h-6 w-6 text-green-600" />
              <span className="text-sm">WhatsApp</span>
            </Button>

            <Button
              variant="outline"
              className="h-auto flex-col gap-2 p-4"
              onClick={shareViaEmail}
              disabled={isGeneratingLink}
              data-testid="button-share-email"
            >
              <Mail className="h-6 w-6 text-blue-600" />
              <span className="text-sm">Email</span>
            </Button>

            <Button
              variant="outline"
              className="h-auto flex-col gap-2 p-4"
              onClick={shareViaTwitter}
              disabled={isGeneratingLink}
              data-testid="button-share-twitter"
            >
              <SiX className="h-6 w-6" />
              <span className="text-sm">Twitter/X</span>
            </Button>

            <Button
              variant="outline"
              className="h-auto flex-col gap-2 p-4"
              onClick={shareViaLinkedIn}
              disabled={isGeneratingLink}
              data-testid="button-share-linkedin"
            >
              <SiLinkedin className="h-6 w-6 text-blue-700" />
              <span className="text-sm">LinkedIn</span>
            </Button>
          </div>

          <div className="flex gap-2">
            {navigator.share && (
              <Button
                variant="secondary"
                className="flex-1"
                onClick={shareViaNative}
                disabled={isGeneratingLink}
                data-testid="button-share-native"
              >
                <Share2 className="h-4 w-4 mr-2" />
                More Options
              </Button>
            )}
            <Button
              variant="secondary"
              className="flex-1"
              onClick={copyLink}
              disabled={isGeneratingLink}
              data-testid="button-copy-link"
            >
              Copy Link
            </Button>
          </div>
        </div>

        <div className="flex justify-end">
          <Button 
            variant="ghost" 
            onClick={() => onOpenChange(false)}
            data-testid="button-close-share"
          >
            <X className="h-4 w-4 mr-2" />
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
