import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useEffect, useRef } from "react";

interface TrackToolAccessParams {
  toolId: string;
  action?: 'access' | 'save' | 'export' | 'share' | 'upload' | 'download';
}

export function useToolAnalytics(toolId: string) {
  const hasTracked = useRef(false);
  
  const trackMutation = useMutation({
    mutationFn: async ({ toolId, action = 'access' }: TrackToolAccessParams) => {
      return apiRequest('POST', '/api/analytics/tool-access', { toolId, action });
    },
  });

  useEffect(() => {
    if (toolId && !hasTracked.current) {
      hasTracked.current = true;
      trackMutation.mutate({ toolId, action: 'access' });
    }
  }, [toolId]);

  const trackAction = (action: 'save' | 'export' | 'share' | 'upload' | 'download') => {
    if (toolId) {
      trackMutation.mutate({ toolId, action });
    }
  };

  return { trackAction };
}
