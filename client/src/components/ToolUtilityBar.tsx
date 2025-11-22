import { Button } from "@/components/ui/button";
import { Smartphone, Share2, Save, Lightbulb, Calendar, Download, RotateCcw } from "lucide-react";
import { useState } from "react";
import { SessionHandoffDialog } from "./SessionHandoffDialog";
import { ShareSheet } from "./ShareSheet";
import { useSessionHandoff } from "@/hooks/useSessionHandoff";
import { useIsMobile } from "@/hooks/use-mobile";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface ToolUtilityBarProps {
  toolId: string;
  toolName: string;
  onSave?: () => void;
  onSmartTips?: () => void;
  onActionPlan?: () => void;
  onExport?: () => void;
  onRestore?: () => void;
  getSerializedState?: () => any;
  onGenerateShareableLink?: () => Promise<string>;
}

export function ToolUtilityBar({
  toolId,
  toolName,
  onSave,
  onSmartTips,
  onActionPlan,
  onExport,
  onRestore,
  getSerializedState,
  onGenerateShareableLink,
}: ToolUtilityBarProps) {
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [shareSheetOpen, setShareSheetOpen] = useState(false);
  const { handoffData, isGenerating, generateQRCode } = useSessionHandoff(toolId);
  const isMobile = useIsMobile();

  const handleUploadFromPhone = async () => {
    if (getSerializedState) {
      try {
        const payload = getSerializedState();
        await generateQRCode(payload);
        setQrDialogOpen(true);
      } catch (err) {
        console.error("Failed to generate QR code:", err);
      }
    } else {
      setQrDialogOpen(true);
    }
  };

  return (
    <>
      <div className="flex flex-wrap items-center gap-2 p-4 bg-muted/50 rounded-lg border">
        <div className="flex items-center gap-2 flex-wrap">
          {onSave && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={onSave}
                  data-testid="button-save-progress"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Progress
                </Button>
              </TooltipTrigger>
              <TooltipContent>Save your progress to local storage</TooltipContent>
            </Tooltip>
          )}

          {onSmartTips && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={onSmartTips}
                  data-testid="button-smart-tips"
                >
                  <Lightbulb className="h-4 w-4 mr-2" />
                  Smart Tips
                </Button>
              </TooltipTrigger>
              <TooltipContent>Get AI-powered recommendations for your situation</TooltipContent>
            </Tooltip>
          )}

          {onActionPlan && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={onActionPlan}
                  data-testid="button-action-plan"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Action Plan
                </Button>
              </TooltipTrigger>
              <TooltipContent>Generate a prioritized 4-week action timeline</TooltipContent>
            </Tooltip>
          )}

          {onExport && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={onExport}
                  data-testid="button-export-report"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Report
                </Button>
              </TooltipTrigger>
              <TooltipContent>Download your results as a text file</TooltipContent>
            </Tooltip>
          )}

          {onRestore && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={onRestore}
                  data-testid="button-restore-progress"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Restore
                </Button>
              </TooltipTrigger>
              <TooltipContent>Restore your last saved progress</TooltipContent>
            </Tooltip>
          )}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShareSheetOpen(true)}
                data-testid="button-share-tool"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </TooltipTrigger>
            <TooltipContent>Share this tool via WhatsApp, Email, Twitter, or LinkedIn</TooltipContent>
          </Tooltip>
          
          {!isMobile && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleUploadFromPhone}
                  data-testid="button-continue-on-mobile"
                  className="hover-elevate"
                >
                  <Smartphone className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Generate QR code to continue on mobile</TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>

      <SessionHandoffDialog
        open={qrDialogOpen}
        onOpenChange={setQrDialogOpen}
        handoffData={handoffData}
        isGenerating={isGenerating}
      />

      <ShareSheet
        open={shareSheetOpen}
        onOpenChange={setShareSheetOpen}
        toolId={toolId}
        toolName={toolName}
        onGenerateShareableLink={onGenerateShareableLink}
      />
    </>
  );
}
