import { useCallback, useRef, useEffect, useState } from 'react';

const GLOBAL_AUTOSAVE_KEY = 'global_autosave_data';
const DEBOUNCE_MS = 300;

interface AutoSaveData {
  [pageKey: string]: {
    [fieldKey: string]: any;
    _lastUpdated: number;
  };
}

function getStoredData(): AutoSaveData {
  try {
    const stored = localStorage.getItem(GLOBAL_AUTOSAVE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function saveToStorage(data: AutoSaveData): void {
  try {
    localStorage.setItem(GLOBAL_AUTOSAVE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save auto-save data:', error);
  }
}

export function useGlobalAutoSave(pageKey: string) {
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const saveField = useCallback((fieldKey: string, value: any) => {
    setIsSaving(true);
    
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      const allData = getStoredData();
      
      if (!allData[pageKey]) {
        allData[pageKey] = { _lastUpdated: Date.now() };
      }
      
      allData[pageKey][fieldKey] = value;
      allData[pageKey]._lastUpdated = Date.now();
      
      saveToStorage(allData);
      setLastSaved(new Date());
      setIsSaving(false);
    }, DEBOUNCE_MS);
  }, [pageKey]);

  const getField = useCallback((fieldKey: string, defaultValue: any = ''): any => {
    const allData = getStoredData();
    return allData[pageKey]?.[fieldKey] ?? defaultValue;
  }, [pageKey]);

  const getAllFields = useCallback((): Record<string, any> => {
    const allData = getStoredData();
    const pageData = allData[pageKey] || {};
    const { _lastUpdated, ...fields } = pageData;
    return fields;
  }, [pageKey]);

  const clearPageData = useCallback(() => {
    const allData = getStoredData();
    delete allData[pageKey];
    saveToStorage(allData);
    setLastSaved(null);
  }, [pageKey]);

  const clearAllData = useCallback(() => {
    localStorage.removeItem(GLOBAL_AUTOSAVE_KEY);
    setLastSaved(null);
  }, []);

  const hasPageData = useCallback((): boolean => {
    const allData = getStoredData();
    const pageData = allData[pageKey];
    if (!pageData) return false;
    const { _lastUpdated, ...fields } = pageData;
    return Object.keys(fields).some(key => {
      const value = fields[key];
      return value !== null && value !== undefined && value !== '';
    });
  }, [pageKey]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return {
    saveField,
    getField,
    getAllFields,
    clearPageData,
    clearAllData,
    hasPageData,
    lastSaved,
    isSaving,
  };
}

export function useAutoSaveInput(
  pageKey: string,
  fieldKey: string,
  initialValue: string = ''
) {
  const { saveField, getField } = useGlobalAutoSave(pageKey);
  const [value, setValue] = useState(() => getField(fieldKey, initialValue));
  const [isSaved, setIsSaved] = useState(false);

  const handleChange = useCallback((newValue: string) => {
    setValue(newValue);
    setIsSaved(false);
    saveField(fieldKey, newValue);
    setTimeout(() => setIsSaved(true), 350);
  }, [fieldKey, saveField]);

  return {
    value,
    onChange: handleChange,
    isSaved,
  };
}

export function getAutoSaveStats(): { pageCount: number; totalFields: number; lastUpdate: Date | null } {
  const allData = getStoredData();
  const pages = Object.keys(allData);
  let totalFields = 0;
  let lastUpdate: number | null = null;

  for (const page of pages) {
    const pageData = allData[page];
    const { _lastUpdated, ...fields } = pageData;
    totalFields += Object.keys(fields).length;
    if (_lastUpdated && (!lastUpdate || _lastUpdated > lastUpdate)) {
      lastUpdate = _lastUpdated;
    }
  }

  return {
    pageCount: pages.length,
    totalFields,
    lastUpdate: lastUpdate ? new Date(lastUpdate) : null,
  };
}
