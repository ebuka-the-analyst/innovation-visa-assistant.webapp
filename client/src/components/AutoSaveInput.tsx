import { useState, useCallback, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Check, Loader2, Cloud, CloudOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AutoSaveInputProps {
  pageKey: string;
  fieldKey: string;
  defaultValue?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  type?: string;
  showIndicator?: boolean;
  onChange?: (value: string) => void;
  onBlur?: () => void;
}

const DEBOUNCE_MS = 300;
const GLOBAL_AUTOSAVE_KEY = 'global_autosave_data';

function getStoredValue(pageKey: string, fieldKey: string, defaultValue: string = ''): string {
  try {
    const stored = localStorage.getItem(GLOBAL_AUTOSAVE_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      return data[pageKey]?.[fieldKey] ?? defaultValue;
    }
  } catch {}
  return defaultValue;
}

function saveStoredValue(pageKey: string, fieldKey: string, value: string): void {
  try {
    const stored = localStorage.getItem(GLOBAL_AUTOSAVE_KEY);
    const data = stored ? JSON.parse(stored) : {};
    
    if (!data[pageKey]) {
      data[pageKey] = { _lastUpdated: Date.now() };
    }
    
    data[pageKey][fieldKey] = value;
    data[pageKey]._lastUpdated = Date.now();
    
    localStorage.setItem(GLOBAL_AUTOSAVE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Auto-save failed:', error);
  }
}

export function AutoSaveInput({
  pageKey,
  fieldKey,
  defaultValue = '',
  placeholder,
  className,
  disabled,
  type = 'text',
  showIndicator = true,
  onChange,
  onBlur,
}: AutoSaveInputProps) {
  const [value, setValue] = useState(() => getStoredValue(pageKey, fieldKey, defaultValue));
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const storedValue = getStoredValue(pageKey, fieldKey, defaultValue);
    if (storedValue !== defaultValue) {
      setValue(storedValue);
    }
  }, [pageKey, fieldKey, defaultValue]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    setSaveState('saving');
    
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    debounceRef.current = setTimeout(() => {
      saveStoredValue(pageKey, fieldKey, newValue);
      setSaveState('saved');
      onChange?.(newValue);
      
      saveTimeoutRef.current = setTimeout(() => {
        setSaveState('idle');
      }, 2000);
    }, DEBOUNCE_MS);
  }, [pageKey, fieldKey, onChange]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, []);

  return (
    <div className="relative">
      <Input
        type={type}
        value={value}
        onChange={handleChange}
        onBlur={onBlur}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(showIndicator && 'pr-8', className)}
        data-testid={`input-${fieldKey}`}
      />
      {showIndicator && saveState !== 'idle' && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2">
          {saveState === 'saving' && (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          )}
          {saveState === 'saved' && (
            <Check className="h-4 w-4 text-green-500" />
          )}
        </div>
      )}
    </div>
  );
}

interface AutoSaveTextareaProps extends Omit<AutoSaveInputProps, 'type'> {
  rows?: number;
  minLength?: number;
}

export function AutoSaveTextarea({
  pageKey,
  fieldKey,
  defaultValue = '',
  placeholder,
  className,
  disabled,
  rows = 4,
  showIndicator = true,
  onChange,
  onBlur,
}: AutoSaveTextareaProps) {
  const [value, setValue] = useState(() => getStoredValue(pageKey, fieldKey, defaultValue));
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const storedValue = getStoredValue(pageKey, fieldKey, defaultValue);
    if (storedValue !== defaultValue) {
      setValue(storedValue);
    }
  }, [pageKey, fieldKey, defaultValue]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    setSaveState('saving');
    
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    debounceRef.current = setTimeout(() => {
      saveStoredValue(pageKey, fieldKey, newValue);
      setSaveState('saved');
      onChange?.(newValue);
      
      saveTimeoutRef.current = setTimeout(() => {
        setSaveState('idle');
      }, 2000);
    }, DEBOUNCE_MS);
  }, [pageKey, fieldKey, onChange]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, []);

  return (
    <div className="relative">
      <Textarea
        value={value}
        onChange={handleChange}
        onBlur={onBlur}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        className={className}
        data-testid={`textarea-${fieldKey}`}
      />
      {showIndicator && saveState !== 'idle' && (
        <div className="absolute right-2 top-2">
          {saveState === 'saving' && (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          )}
          {saveState === 'saved' && (
            <Check className="h-4 w-4 text-green-500" />
          )}
        </div>
      )}
    </div>
  );
}

export function GlobalAutoSaveIndicator() {
  const [stats, setStats] = useState({ pageCount: 0, totalFields: 0, lastUpdate: null as Date | null });
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const updateStats = () => {
      try {
        const stored = localStorage.getItem(GLOBAL_AUTOSAVE_KEY);
        if (stored) {
          const data = JSON.parse(stored);
          const pages = Object.keys(data);
          let totalFields = 0;
          let lastUpdate: number | null = null;

          for (const page of pages) {
            const pageData = data[page];
            const { _lastUpdated, ...fields } = pageData;
            totalFields += Object.keys(fields).filter(k => fields[k] !== '').length;
            if (_lastUpdated && (!lastUpdate || _lastUpdated > lastUpdate)) {
              lastUpdate = _lastUpdated;
            }
          }

          setStats({
            pageCount: pages.length,
            totalFields,
            lastUpdate: lastUpdate ? new Date(lastUpdate) : null,
          });
        }
      } catch {}
    };

    updateStats();
    const interval = setInterval(updateStats, 5000);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (stats.totalFields === 0) return null;

  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      {isOnline ? (
        <Cloud className="h-3 w-3 text-green-500" />
      ) : (
        <CloudOff className="h-3 w-3 text-amber-500" />
      )}
      <span>
        {stats.totalFields} field{stats.totalFields !== 1 ? 's' : ''} saved locally
        {stats.lastUpdate && (
          <span className="ml-1">
            ({stats.lastUpdate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
          </span>
        )}
      </span>
    </div>
  );
}
