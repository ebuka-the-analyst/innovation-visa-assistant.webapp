import { Button } from "@/components/ui/button";
import { Smartphone, Share2, Save, Lightbulb, Calendar, Download, RotateCcw } from "lucide-react";
import { useState } from "react";
import { SessionHandoffDialog } from "./SessionHandoffDialog";
import { ShareSheet } from "./ShareSheet";
import { useSessionHandoff } from "@/hooks/useSessionHandoff";
import { useIsMobile } from "@/hooks/use-mobile";

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
            <Button
              variant="secondary"
              size="sm"
              onClick={onSave}
              data-testid="button-save-progress"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Progress
            </Button>
          )}

          {onSmartTips && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onSmartTips}
              data-testid="button-smart-tips"
            >
              <Lightbulb className="h-4 w-4 mr-2" />
              Smart Tips
            </Button>
          )}

          {onActionPlan && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onActionPlan}
              data-testid="button-action-plan"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Action Plan
            </Button>
          )}

          {onExport && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onExport}
              data-testid="button-export-report"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          )}

          {onRestore && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onRestore}
              data-testid="button-restore-progress"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Restore
            </Button>
          )}
        </div>

        <div className="ml-auto flex items-center gap-2">
          {!isMobile && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleUploadFromPhone}
              data-testid="button-upload-from-phone"
            >
              <Smartphone className="h-4 w-4 mr-2" />
              Upload from Phone
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShareSheetOpen(true)}
            data-testid="button-share-tool"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
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
