import { useState } from "react";
import QRCode from "qrcode";
import { apiRequest } from "@/lib/queryClient";

export interface SessionHandoffData {
  token: string;
  handoffUrl: string;
  expiresAt: string;
  qrCodeDataUrl?: string;
}

export function useSessionHandoff(toolId: string) {
  const [handoffData, setHandoffData] = useState<SessionHandoffData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateQRCode = async (payload: any) => {
    setIsGenerating(true);
    setError(null);

    try {
      // Create session handoff on backend
      const response = await apiRequest("POST", "/api/session-handoff", { toolId, payload });
      const data = await response.json() as SessionHandoffData;

      // Generate QR code as data URL
      const qrCodeDataUrl = await QRCode.toDataURL(data.handoffUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#ffffff",
        },
      });

      const handoffWithQR = { ...data, qrCodeDataUrl };
      setHandoffData(handoffWithQR);
      return handoffWithQR;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to generate QR code";
      setError(errorMessage);
      throw err;
    } finally {
      setIsGenerating(false);
    }
  };

  const clearHandoff = () => {
    setHandoffData(null);
    setError(null);
  };

  return {
    handoffData,
    isGenerating,
    error,
    generateQRCode,
    clearHandoff,
  };
}
