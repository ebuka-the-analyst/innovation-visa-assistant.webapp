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
    console.log('[VoicePermission] Checking microphone permission...');
    
    // First try the Permissions API
    try {
      if (navigator.permissions && navigator.permissions.query) {
        const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        console.log('[VoicePermission] Permissions API returned:', result.state);
        
        // If Permissions API says granted, verify by actually getting the stream
        if (result.state === 'granted') {
          try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            stream.getTracks().forEach(track => track.stop());
            console.log('[VoicePermission] Verified: microphone access works');
            setPermission('granted');
          } catch (err) {
            console.log('[VoicePermission] Permissions API said granted but getUserMedia failed:', err);
            setPermission('denied');
          }
        } else {
          setPermission(result.state as VoicePermissionState);
        }
        
        // Listen for changes
        result.addEventListener('change', () => {
          console.log('[VoicePermission] Permission changed to:', result.state);
          setPermission(result.state as VoicePermissionState);
        });
      } else {
        console.log('[VoicePermission] Permissions API not available');
        setPermission('prompt');
      }
    } catch (err) {
      console.log('[VoicePermission] Permissions query failed, trying direct getUserMedia:', err);
      // Fallback: try to get the stream directly
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
        console.log('[VoicePermission] Direct test succeeded');
        setPermission('granted');
      } catch {
        console.log('[VoicePermission] Direct test failed, setting to prompt');
        setPermission('prompt');
      }
    }
  }, []);

  useEffect(() => {
    checkPermission();
  }, [checkPermission]);

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
