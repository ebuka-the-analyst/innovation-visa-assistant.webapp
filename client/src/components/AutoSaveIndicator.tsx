import { useState, useEffect } from "react";
import { Save, Check, Cloud, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface AutoSaveIndicatorProps {
  isSaving?: boolean;
  lastSaved?: string | null;
  hasUnsavedChanges?: boolean;
  showNotification?: boolean;
  className?: string;
}

export function AutoSaveIndicator({
  isSaving = false,
  lastSaved = null,
  hasUnsavedChanges = false,
  showNotification = false,
  className,
}: AutoSaveIndicatorProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (showNotification) {
      setVisible(true);
      const timer = setTimeout(() => setVisible(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showNotification, lastSaved]);

  if (!visible && !hasUnsavedChanges && !lastSaved) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex items-center gap-2 text-xs transition-all duration-300",
        visible ? "opacity-100" : "opacity-70",
        className
      )}
      data-testid="autosave-indicator"
    >
      {isSaving ? (
        <>
          <Cloud className="h-3 w-3 animate-pulse text-blue-500" />
          <span className="text-blue-500">Saving...</span>
        </>
      ) : showNotification || visible ? (
        <>
          <Check className="h-3 w-3 text-green-500" />
          <span className="text-green-500">Saved</span>
        </>
      ) : hasUnsavedChanges ? (
        <>
          <AlertCircle className="h-3 w-3 text-amber-500" />
          <span className="text-amber-500">Unsaved changes</span>
        </>
      ) : lastSaved ? (
        <>
          <Save className="h-3 w-3 text-muted-foreground" />
          <span className="text-muted-foreground">Last saved: {lastSaved}</span>
        </>
      ) : null}
    </div>
  );
}

export function AutoSaveBanner({
  message = "Your progress is automatically saved",
  onClear,
  className,
}: {
  message?: string;
  onClear?: () => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 p-3 rounded-lg bg-green-500/10 border border-green-500/30",
        className
      )}
      data-testid="autosave-banner"
    >
      <div className="flex items-center gap-2">
        <Save className="h-4 w-4 text-green-600" />
        <span className="text-sm text-green-700 dark:text-green-400">
          {message}
        </span>
      </div>
      {onClear && (
        <button
          onClick={onClear}
          className="text-xs text-red-600 hover:text-red-700 hover:underline"
          data-testid="button-clear-autosave"
        >
          Clear saved data
        </button>
      )}
    </div>
  );
}
