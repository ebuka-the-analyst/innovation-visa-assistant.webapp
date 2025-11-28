import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger 
} from "@/components/ui/popover";
import { Mic, MicOff, Check, AlertCircle, Settings, Volume2 } from "lucide-react";
import { useVoicePermission } from "@/contexts/VoicePermissionContext";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface VoiceMicButtonProps {
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'default' | 'lg' | 'icon';
}

export function VoiceMicButton({ className, showLabel = false, size = 'icon' }: VoiceMicButtonProps) {
  const { permission, isEnabled, requestPermission, checkPermission } = useVoicePermission();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);

  const handleEnableVoice = async () => {
    setIsRequesting(true);
    const granted = await requestPermission();
    setIsRequesting(false);
    
    if (granted) {
      toast({
        title: "Voice Enabled",
        description: "You can now use voice features throughout the app.",
      });
      setIsOpen(false);
    } else {
      toast({
        title: "Permission Denied",
        description: "Please enable microphone access in your browser settings.",
        variant: "destructive",
      });
    }
  };

  const handleRefreshPermission = async () => {
    await checkPermission();
    toast({
      title: "Permission Checked",
      description: `Microphone permission: ${permission}`,
    });
  };

  const getStatusColor = () => {
    switch (permission) {
      case 'granted': return 'text-green-500 dark:text-green-400';
      case 'denied': return 'text-red-500 dark:text-red-400';
      case 'prompt': return 'text-amber-500 dark:text-amber-400';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusBorder = () => {
    switch (permission) {
      case 'granted': return 'ring-2 ring-green-500/30 ring-offset-2 ring-offset-background';
      case 'denied': return 'ring-2 ring-red-500/30 ring-offset-2 ring-offset-background';
      case 'prompt': return 'ring-2 ring-amber-500/30 ring-offset-2 ring-offset-background';
      default: return '';
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline"
          size={size}
          className={cn(
            "relative transition-all duration-300",
            getStatusBorder(),
            className
          )}
          data-testid="button-voice-permission"
        >
          {isEnabled ? (
            <Mic className={cn("h-4 w-4", getStatusColor())} />
          ) : (
            <MicOff className={cn("h-4 w-4", getStatusColor())} />
          )}
          {showLabel && (
            <span className="ml-2">
              {isEnabled ? 'Voice On' : 'Voice Off'}
            </span>
          )}
          {permission === 'granted' && (
            <span className="absolute -top-1 -right-1 h-2.5 w-2.5 bg-green-500 rounded-full animate-pulse" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-3 rounded-xl",
              isEnabled 
                ? "bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30" 
                : "bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30"
            )}>
              {isEnabled ? (
                <Mic className="h-6 w-6 text-green-500" />
              ) : (
                <MicOff className="h-6 w-6 text-amber-500" />
              )}
            </div>
            <div>
              <h4 className="font-semibold">Voice Features</h4>
              <p className="text-sm text-muted-foreground">
                {permission === 'granted' && 'Microphone access enabled'}
                {permission === 'denied' && 'Microphone access blocked'}
                {permission === 'prompt' && 'Microphone access required'}
                {permission === 'checking' && 'Checking permission...'}
              </p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                Status: {permission}
              </p>
            </div>
          </div>

          {permission === 'granted' ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                <p className="text-sm text-green-600 dark:text-green-400">
                  Microphone access enabled! Voice features are ready.
                </p>
              </div>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={async () => {
                  try {
                    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                    toast({
                      title: "Microphone Test Successful",
                      description: "Your microphone is working correctly!",
                    });
                    stream.getTracks().forEach(track => track.stop());
                  } catch (err) {
                    toast({
                      title: "Microphone Test Failed",
                      description: String(err),
                      variant: "destructive",
                    });
                  }
                }}
                data-testid="button-test-mic"
              >
                <Mic className="h-4 w-4 mr-2" />
                Test Microphone
              </Button>
              <div className="text-xs text-muted-foreground space-y-1">
                <p className="flex items-center gap-2">
                  <Volume2 className="h-3 w-3" />
                  Voice Builder - Speak your visa documents
                </p>
                <p className="flex items-center gap-2">
                  <Volume2 className="h-3 w-3" />
                  AI Interview - Voice-guided sessions
                </p>
              </div>
            </div>
          ) : permission === 'denied' ? (
            <div className="space-y-3">
              <div className="flex items-start gap-2 p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-red-600 dark:text-red-400">
                  <p className="font-medium">Microphone access is blocked</p>
                  <p className="text-xs mt-1 opacity-80">
                    Click the lock icon in your browser's address bar and enable microphone access.
                  </p>
                </div>
              </div>
              
              <div className="p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
                <p className="text-xs text-amber-600 dark:text-amber-400 font-medium mb-2">
                  If microphone shows ON but still not working:
                </p>
                <ol className="text-xs text-amber-600/80 dark:text-amber-400/80 space-y-1 list-decimal list-inside">
                  <li>Click the lock icon in address bar</li>
                  <li>Click <strong>"Reset permissions"</strong></li>
                  <li><strong>Refresh this page</strong> (Ctrl+R or Cmd+R)</li>
                  <li>Click Enable Voice again</li>
                </ol>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={handleEnableVoice} 
                  className="flex-1"
                  disabled={isRequesting}
                  data-testid="button-try-enable-voice"
                >
                  <Mic className="h-4 w-4 mr-2" />
                  {isRequesting ? 'Requesting...' : 'Try Again'}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => window.location.reload()}
                  title="Refresh Page"
                  data-testid="button-refresh-page"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Enable <strong>microphone</strong> access (not "Sound") to use voice recording features.
              </p>
              <div className="p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  <strong>Note:</strong> "Sound" permission is for audio playback. You need to allow <strong>"Microphone"</strong> permission when the browser asks.
                </p>
              </div>
              <Button 
                onClick={handleEnableVoice} 
                className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
                disabled={isRequesting}
                data-testid="button-enable-voice"
              >
                <Mic className="h-4 w-4 mr-2" />
                {isRequesting ? 'Requesting Access...' : 'Request Microphone Access'}
              </Button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
