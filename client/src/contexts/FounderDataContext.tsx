import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { FOUNDER_DATA, type FounderProfile, getFormattedFounderBio, getExecutiveSummary, getFinancialProjectionsSummary, getRequiredFounderInputs } from "@shared/founderData";

interface FounderDataContextType {
  founderData: FounderProfile;
  updateFounderData: (path: string, value: any) => void;
  getFormattedBio: () => string;
  getExecutiveSummary: () => string;
  getFinancialSummary: () => string;
  getMissingFields: () => string[];
  completionPercentage: number;
  isPrefillEnabled: boolean;
  setIsPrefillEnabled: (enabled: boolean) => void;
}

const FounderDataContext = createContext<FounderDataContextType | null>(null);

export function useFounderData() {
  const context = useContext(FounderDataContext);
  if (!context) {
    throw new Error("useFounderData must be used within a FounderDataProvider");
  }
  return context;
}

function setNestedValue(obj: any, path: string, value: any): any {
  const keys = path.split(".");
  const result = JSON.parse(JSON.stringify(obj));
  let current = result;
  
  for (let i = 0; i < keys.length - 1; i++) {
    if (!current[keys[i]]) {
      current[keys[i]] = {};
    }
    current = current[keys[i]];
  }
  
  current[keys[keys.length - 1]] = value;
  return result;
}

function calculateCompletionPercentage(data: FounderProfile): number {
  let filledFields = 0;
  let totalFields = 0;

  const checkObject = (obj: any) => {
    for (const key in obj) {
      const value = obj[key];
      if (typeof value === "object" && value !== null) {
        if (Array.isArray(value)) {
          totalFields++;
          if (value.length > 0 && (typeof value[0] !== "object" || Object.values(value[0]).some(v => v))) {
            filledFields++;
          }
        } else {
          checkObject(value);
        }
      } else {
        totalFields++;
        if (value !== "" && value !== null && value !== undefined && value !== 0) {
          filledFields++;
        }
      }
    }
  };

  checkObject(data);
  return Math.round((filledFields / totalFields) * 100);
}

export function FounderDataProvider({ children }: { children: ReactNode }) {
  const [founderData, setFounderData] = useState<FounderProfile>(() => {
    const saved = localStorage.getItem("founderProfileData");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { ...FOUNDER_DATA, ...parsed };
      } catch {
        return FOUNDER_DATA;
      }
    }
    return FOUNDER_DATA;
  });

  const [isPrefillEnabled, setIsPrefillEnabled] = useState(() => {
    return localStorage.getItem("prefillEnabled") !== "false";
  });

  const [completionPercentage, setCompletionPercentage] = useState(0);

  useEffect(() => {
    localStorage.setItem("founderProfileData", JSON.stringify(founderData));
    setCompletionPercentage(calculateCompletionPercentage(founderData));
  }, [founderData]);

  useEffect(() => {
    localStorage.setItem("prefillEnabled", String(isPrefillEnabled));
  }, [isPrefillEnabled]);

  const updateFounderData = (path: string, value: any) => {
    setFounderData((prev) => setNestedValue(prev, path, value));
  };

  const getFormattedBio = () => getFormattedFounderBio();
  const getExecutiveSummaryText = () => getExecutiveSummary();
  const getFinancialSummary = () => getFinancialProjectionsSummary();
  const getMissingFields = () => getRequiredFounderInputs();

  return (
    <FounderDataContext.Provider
      value={{
        founderData,
        updateFounderData,
        getFormattedBio,
        getExecutiveSummary: getExecutiveSummaryText,
        getFinancialSummary,
        getMissingFields,
        completionPercentage,
        isPrefillEnabled,
        setIsPrefillEnabled,
      }}
    >
      {children}
    </FounderDataContext.Provider>
  );
}
