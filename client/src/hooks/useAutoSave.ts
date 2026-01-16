import { useEffect, useRef, useCallback, useState } from 'react';

const AUTO_SAVE_PREFIX = 'autosave_';
const AUTO_SAVE_DEBOUNCE_MS = 500;

export interface AutoSaveState {
  [key: string]: any;
}

export function useAutoSave<T extends Record<string, any>>(
  pageKey: string,
  defaultValues: T
): {
  savedData: T;
  saveField: (fieldName: keyof T | string, value: any) => void;
  saveAllFields: (data: Partial<T>) => void;
  clearField: (fieldName: keyof T | string) => void;
  clearAllFields: () => void;
  hasUnsavedData: boolean;
  loadSavedData: () => T;
} {
  const storageKey = `${AUTO_SAVE_PREFIX}${pageKey}`;
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [hasUnsavedData, setHasUnsavedData] = useState(false);

  const loadSavedData = useCallback((): T => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...defaultValues, ...parsed };
      }
    } catch (error) {
      console.error('Error loading auto-saved data:', error);
    }
    return defaultValues;
  }, [storageKey, defaultValues]);

  const [savedData, setSavedData] = useState<T>(() => loadSavedData());

  useEffect(() => {
    const data = loadSavedData();
    setSavedData(data);
    const hasData = Object.keys(data).some(key => {
      const value = data[key];
      if (value === undefined || value === null) return false;
      if (typeof value === 'string' && value.trim() === '') return false;
      if (Array.isArray(value) && value.length === 0) return false;
      if (typeof value === 'object' && Object.keys(value).length === 0) return false;
      return defaultValues[key] !== value;
    });
    setHasUnsavedData(hasData);
  }, [pageKey]);

  const saveToStorage = useCallback((data: T) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(data));
      const hasData = Object.keys(data).some(key => {
        const value = data[key];
        if (value === undefined || value === null) return false;
        if (typeof value === 'string' && value.trim() === '') return false;
        if (Array.isArray(value) && value.length === 0) return false;
        if (typeof value === 'object' && Object.keys(value).length === 0) return false;
        return defaultValues[key] !== value;
      });
      setHasUnsavedData(hasData);
    } catch (error) {
      console.error('Error saving to auto-save:', error);
    }
  }, [storageKey, defaultValues]);

  const saveField = useCallback((fieldName: keyof T | string, value: any) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      setSavedData(prev => {
        const newData = { ...prev, [fieldName]: value };
        saveToStorage(newData);
        return newData;
      });
    }, AUTO_SAVE_DEBOUNCE_MS);
  }, [saveToStorage]);

  const saveAllFields = useCallback((data: Partial<T>) => {
    // Clear any pending debounced save
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    // Update savedData IMMEDIATELY (no debounce) for batch saves like Apply All
    // This prevents race conditions with useEffect syncing stale data back to form
    setSavedData(prev => {
      const newData = { ...prev, ...data };
      saveToStorage(newData);
      console.log('[Auto-save] Batch saved', Object.keys(data).length, 'fields immediately');
      return newData;
    });
  }, [saveToStorage]);

  const clearField = useCallback((fieldName: keyof T | string) => {
    setSavedData(prev => {
      const newData = { ...prev, [fieldName]: defaultValues[fieldName] };
      saveToStorage(newData);
      return newData;
    });
  }, [defaultValues, saveToStorage]);

  const clearAllFields = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
      setSavedData(defaultValues);
      setHasUnsavedData(false);
    } catch (error) {
      console.error('Error clearing auto-save:', error);
    }
  }, [storageKey, defaultValues]);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return {
    savedData,
    saveField,
    saveAllFields,
    clearField,
    clearAllFields,
    hasUnsavedData,
    loadSavedData,
  };
}

export function useFormAutoSave<T extends Record<string, any>>(
  formKey: string,
  form: { watch: () => T; reset: (values: T) => void; setValue: (name: any, value: any) => void },
  defaultValues: T
) {
  const {
    savedData,
    saveAllFields,
    clearAllFields,
    hasUnsavedData,
    loadSavedData,
  } = useAutoSave(formKey, defaultValues);

  const isInitializedRef = useRef(false);

  useEffect(() => {
    if (!isInitializedRef.current) {
      const saved = loadSavedData();
      if (saved && Object.keys(saved).length > 0) {
        const hasActualData = Object.keys(saved).some(key => {
          const value = saved[key];
          if (value === undefined || value === null) return false;
          if (typeof value === 'string' && value.trim() === '') return false;
          if (Array.isArray(value) && value.length === 0) return false;
          return true;
        });
        if (hasActualData) {
          form.reset(saved);
        }
      }
      isInitializedRef.current = true;
    }
  }, [formKey]);

  useEffect(() => {
    const subscription = (form as any)._subjects?.values?.subscribe?.((values: T) => {
      saveAllFields(values);
    });

    if (!subscription) {
      const interval = setInterval(() => {
        const currentValues = form.watch();
        saveAllFields(currentValues);
      }, 1000);
      return () => clearInterval(interval);
    }

    return () => subscription?.unsubscribe?.();
  }, [form, saveAllFields]);

  return {
    savedData,
    clearAllFields,
    hasUnsavedData,
  };
}

export function getAutoSaveKey(pageKey: string): string {
  return `${AUTO_SAVE_PREFIX}${pageKey}`;
}

export function getAllAutoSaveKeys(): string[] {
  const keys: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(AUTO_SAVE_PREFIX)) {
      keys.push(key);
    }
  }
  return keys;
}

export function clearAllAutoSave(): void {
  const keys = getAllAutoSaveKeys();
  keys.forEach(key => localStorage.removeItem(key));
}
