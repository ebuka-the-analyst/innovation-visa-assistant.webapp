import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

export type VoicePermissionState = 'checking' | 'prompt' | 'granted' | 'denied';

interface VoicePermissionContextType {
  permission: VoicePermissionState;
  isEnabled: boolean;
  requestPermission: () => Promise<boolean>;
  checkPermission: () => Promise<void>;
}

const VoicePermissionContext = createContext<VoicePermissionContextType | null>(null);

export function VoicePermissionProvider({ children }: { children: ReactNode }) {
  const [permission, setPermission] = useState<VoicePermissionState>('checking');

  const checkPermission = useCallback(async () => {
    try {
      if (navigator.permissions && navigator.permissions.query) {
        const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        setPermission(result.state as VoicePermissionState);
        
        result.addEventListener('change', () => {
          setPermission(result.state as VoicePermissionState);
        });
      } else {
        setPermission('prompt');
      }
    } catch {
      setPermission('prompt');
    }
  }, []);

  useEffect(() => {
    checkPermission();
  }, [checkPermission]);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      setPermission('granted');
      return true;
    } catch (error) {
      console.error('Microphone permission denied:', error);
      setPermission('denied');
      return false;
    }
  }, []);

  const isEnabled = permission === 'granted';

  return (
    <VoicePermissionContext.Provider value={{ 
      permission, 
      isEnabled, 
      requestPermission,
      checkPermission 
    }}>
      {children}
    </VoicePermissionContext.Provider>
  );
}

export function useVoicePermission() {
  const context = useContext(VoicePermissionContext);
  if (!context) {
    throw new Error('useVoicePermission must be used within VoicePermissionProvider');
  }
  return context;
}
