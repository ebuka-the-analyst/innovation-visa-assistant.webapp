import { useState, useEffect, useRef, useCallback } from "react";
import { Save, Check, Cloud, AlertCircle, RefreshCw, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface AutoSaveIndicatorProps {
  isSaving?: boolean;
  lastSaved?: string | null;
  hasUnsavedChanges?: boolean;
  showNotification?: boolean;
  className?: string;
}

export function useAutoSaveWithIndicator<T extends Record<string, any>>(
  storageKey: string,
  initialData: T
): {
  data: T;
  setData: (newData: T | ((prev: T) => T)) => void;
  updateField: <K extends keyof T>(field: K, value: T[K]) => void;
  clearSaved: () => void;
  restoreSaved: () => T | null;
  hasSavedData: boolean;
  lastSaved: Date | null;
  isSaving: boolean;
  indicatorProps: {
    isSaving: boolean;
    lastSaved: string | null;
    hasUnsavedChanges: boolean;
    showNotification: boolean;
  };
} {
  const fullKey = `autosave_${storageKey}`;
  
  const [data, setDataState] = useState<T>(() => {
    try {
      const saved = localStorage.getItem(fullKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        const timestamp = parsed._lastSaved;
        delete parsed._lastSaved;
        return { ...initialData, ...parsed };
      }
    } catch (e) {
      console.error('Failed to load saved data:', e);
    }
    return initialData;
  });
  
  const [hasSavedData, setHasSavedData] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const previousDataRef = useRef<string>(JSON.stringify(initialData));

  useEffect(() => {
    try {
      const saved = localStorage.getItem(fullKey);
      setHasSavedData(!!saved);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed._lastSaved) {
          setLastSaved(new Date(parsed._lastSaved));
        }
      }
    } catch (e) {}
  }, [fullKey]);

  const setData = useCallback((newData: T | ((prev: T) => T)) => {
    setDataState(prev => {
      const updated = typeof newData === 'function' ? (newData as (prev: T) => T)(prev) : newData;
      const newDataString = JSON.stringify(updated);
      
      if (newDataString === previousDataRef.current) {
        return prev;
      }
      
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      
      setIsSaving(true);
      
      saveTimeoutRef.current = setTimeout(() => {
        try {
          const saveData = {
            ...updated,
            _lastSaved: new Date().toISOString()
          };
          localStorage.setItem(fullKey, JSON.stringify(saveData));
          previousDataRef.current = newDataString;
          setHasSavedData(true);
          setLastSaved(new Date());
          setIsSaving(false);
          setShowNotification(true);
          setTimeout(() => setShowNotification(false), 2000);
        } catch (err) {
          console.error('Auto-save failed:', err);
          setIsSaving(false);
        }
      }, 500);
      
      return updated;
    });
  }, [fullKey]);

  const updateField = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
    setData(prev => ({ ...prev, [field]: value }));
  }, [setData]);

  const clearSaved = useCallback(() => {
    localStorage.removeItem(fullKey);
    setHasSavedData(false);
    setLastSaved(null);
    setDataState(initialData);
    previousDataRef.current = JSON.stringify(initialData);
  }, [fullKey, initialData]);

  const restoreSaved = useCallback((): T | null => {
    try {
      const saved = localStorage.getItem(fullKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        delete parsed._lastSaved;
        const restored = { ...initialData, ...parsed };
        setDataState(restored);
        previousDataRef.current = JSON.stringify(restored);
        return restored;
      }
    } catch (e) {
      console.error('Failed to restore:', e);
    }
    return null;
  }, [fullKey, initialData]);

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  const formatLastSaved = (): string | null => {
    if (!lastSaved) return null;
    const seconds = Math.floor((Date.now() - lastSaved.getTime()) / 1000);
    if (seconds < 5) return 'just now';
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return lastSaved.toLocaleTimeString();
  };

  return {
    data,
    setData,
    updateField,
    clearSaved,
    restoreSaved,
    hasSavedData,
    lastSaved,
    isSaving,
    indicatorProps: {
      isSaving,
      lastSaved: formatLastSaved(),
      hasUnsavedChanges: hasSavedData,
      showNotification
    }
  };
}

export function RestoreBanner({
  storageKey,
  onRestore,
  onDismiss,
  className,
}: {
  storageKey: string;
  onRestore: () => void;
  onDismiss: () => void;
  className?: string;
}) {
  const fullKey = `autosave_${storageKey}`;
  const [show, setShow] = useState(false);
  const [savedDate, setSavedDate] = useState<string>("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(fullKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        const hasRealData = Object.keys(parsed).some(k => {
          if (k === '_lastSaved') return false;
          const v = parsed[k];
          if (v === null || v === undefined) return false;
          if (typeof v === 'string' && v.trim() === '') return false;
          if (Array.isArray(v) && v.length === 0) return false;
          return true;
        });
        if (hasRealData) {
          if (parsed._lastSaved) {
            setSavedDate(new Date(parsed._lastSaved).toLocaleString());
          }
          setShow(true);
        }
      }
    } catch (e) {}
  }, [fullKey]);

  if (!show) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={cn(
        "bg-primary/10 border border-primary/20 rounded-lg p-3 mb-4 flex items-center justify-between gap-4",
        className
      )}
      data-testid="restore-banner"
    >
      <div className="flex items-center gap-2">
        <RotateCcw className="h-4 w-4 text-primary" />
        <span className="text-sm">
          You have saved progress{savedDate ? ` from ${savedDate}` : ""}.
        </span>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => {
            setShow(false);
            onDismiss();
          }}
          className="text-xs text-muted-foreground hover:text-foreground px-2 py-1"
          data-testid="button-dismiss-restore"
        >
          Start Fresh
        </button>
        <button
          onClick={() => {
            setShow(false);
            onRestore();
          }}
          className="text-xs bg-primary text-primary-foreground px-3 py-1 rounded-md hover:bg-primary/90"
          data-testid="button-restore-progress"
        >
          Restore
        </button>
      </div>
    </motion.div>
  );
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
