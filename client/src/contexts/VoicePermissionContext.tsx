import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

export type VoicePermissionState = 'unknown' | 'prompt' | 'granted' | 'denied';

interface VoicePermissionContextType {
  permission: VoicePermissionState;
  isEnabled: boolean;
  requestPermission: () => Promise<boolean>;
  checkPermission: () => Promise<void>;
}

const VoicePermissionContext = createContext<VoicePermissionContextType | null>(null);

export function VoicePermissionProvider({ children }: { children: ReactNode }) {
  // Start with 'unknown' - don't check permission until user actually clicks the mic button
  const [permission, setPermission] = useState<VoicePermissionState>('unknown');

  const checkPermission = useCallback(async () => {
    console.log('[VoicePermission] Checking microphone permission via direct test...');
    
    // Only check when explicitly called (user clicked mic button)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      console.log('[VoicePermission] Direct microphone test SUCCEEDED');
      setPermission('granted');
    } catch (err: any) {
      console.log('[VoicePermission] Direct microphone test failed:', err?.name, err?.message);
      
      if (err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError') {
        setPermission('denied');
      } else if (err?.name === 'NotFoundError') {
        console.log('[VoicePermission] No microphone device found');
        setPermission('denied');
      } else {
        setPermission('prompt');
      }
    }
  }, []);

  // NO automatic permission check on mount - only when user clicks mic button

  const requestPermission = useCallback(async (): Promise<boolean> => {
    console.log('[VoicePermission] Requesting microphone access...');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      console.log('[VoicePermission] Request succeeded, permission granted');
      setPermission('granted');
      return true;
    } catch (error) {
      console.error('[VoicePermission] Request failed:', error);
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
