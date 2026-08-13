import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useLocation } from "wouter";
import { 
  FileText, Clock, Download, ExternalLink, Trash2, 
  FolderOpen, ChevronDown, ChevronUp, RefreshCw,
  CheckCircle2, AlertTriangle
} from "lucide-react";
import { ALL_TOOLS, type Tool } from "@shared/tools-data";
import { useToolAccess } from "@/hooks/useCommercialCatalog";

interface SavedWork {
  toolId: string;
  toolName: string;
  category: string;
  tier: string;
  savedDate: string;
  dataSize: number;
  hasData: boolean;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getToolStorageKey(toolId: string): string {
  return `${toolId}-state`;
}

function getSavedWorkFromLocalStorage(): SavedWork[] {
  const savedWork: SavedWork[] = [];
  
  ALL_TOOLS.forEach((tool: Tool) => {
    const stateKey = getToolStorageKey(tool.id);
    const savedState = localStorage.getItem(stateKey);
    
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        const dataSize = new Blob([savedState]).size;
        
        let savedDate = "";
        if (parsed.savedDate) {
          savedDate = parsed.savedDate;
        } else if (parsed.lastSaved) {
          savedDate = parsed.lastSaved;
        } else {
          savedDate = "Unknown";
        }
        
        savedWork.push({
          toolId: tool.id,
          toolName: tool.name,
          category: tool.category,
          tier: tool.tier,
          savedDate,
          dataSize,
          hasData: Object.keys(parsed).length > 1,
        });
      } catch {
      }
    }
  });
  
  return savedWork.sort((a, b) => {
    if (a.savedDate === "Unknown") return 1;
    if (b.savedDate === "Unknown") return -1;
    return b.savedDate.localeCompare(a.savedDate);
  });
}

function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    business: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    financial: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    innovation: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
    team: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
    growth: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400",
    compliance: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    defense: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
    documentation: "bg-slate-100 text-slate-800 dark:bg-slate-800/50 dark:text-slate-300",
  };
  return colors[category] || "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
}

function getTierBadge(tier: string) {
  const styles: Record<string, string> = {
    free: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
    basic: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    premium: "bg-gradient-to-r from-[#005EB8] to-[#41B6E6] text-white",
    enterprise: "bg-purple-600 text-white",
    ultimate: "bg-gradient-to-r from-amber-500 to-yellow-400 text-black",
  };
  return styles[tier] || styles.free;
}

export function MyWorkSection() {
  const [, setLocation] = useLocation();
  const {
    getToolAccess,
    isLoading: isToolAccessLoading,
    isError: isToolAccessError,
  } = useToolAccess();
  const [savedWork, setSavedWork] = useState<SavedWork[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  
  useEffect(() => {
    setSavedWork(getSavedWorkFromLocalStorage());
  }, [refreshKey]);
  
  const displayedWork = expanded ? savedWork : savedWork.slice(0, 6);
  
  const handleClearTool = (toolId: string) => {
    const stateKey = getToolStorageKey(toolId);
    const modeKey = `${toolId}-mode`;
    localStorage.removeItem(stateKey);
    localStorage.removeItem(modeKey);
    setRefreshKey(prev => prev + 1);
  };
  
  const handleClearAll = () => {
    savedWork.forEach(work => {
      const stateKey = getToolStorageKey(work.toolId);
      const modeKey = `${work.toolId}-mode`;
      localStorage.removeItem(stateKey);
      localStorage.removeItem(modeKey);
    });
    setRefreshKey(prev => prev + 1);
  };
  
  const totalSize = savedWork.reduce((sum, w) => sum + w.dataSize, 0);
  
  if (savedWork.length === 0) {
    return (
      <Card className="border-dashed" data-testid="card-no-saved-work">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FolderOpen className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium mb-2">No Saved Work Yet</h3>
          <p className="text-muted-foreground text-center max-w-md mb-4">
            Start using tools from the Tools Hub to build your visa application. 
            Your progress will be saved automatically.
          </p>
          <Button onClick={() => setLocation("/tools-hub")} data-testid="button-go-to-tools">
            <ExternalLink className="h-4 w-4 mr-2" />
            Go to Tools Hub
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-4" data-testid="section-my-work">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            My Saved Work
          </h2>
          <p className="text-sm text-muted-foreground">
            {savedWork.length} tool{savedWork.length !== 1 ? 's' : ''} with saved progress ({formatBytes(totalSize)} stored)
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setRefreshKey(prev => prev + 1)}
            data-testid="button-refresh-work"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
          {savedWork.length > 0 && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleClearAll}
              className="text-destructive hover:text-destructive"
              data-testid="button-clear-all-work"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Clear All
            </Button>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayedWork.map((work) => {
          const entitlement = getToolAccess(work.toolId);
          const effectiveTier = entitlement?.minimumPlanId ?? work.tier;
          const accessUnavailable = isToolAccessLoading || isToolAccessError || !entitlement;
          return (
          <Card 
            key={work.toolId} 
            className="hover-elevate cursor-pointer group"
            data-testid={`card-saved-work-${work.toolId}`}
          >
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-base truncate">{work.toolName}</CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className={getCategoryColor(work.category)}>
                      {work.category}
                    </Badge>
                    <Badge className={getTierBadge(effectiveTier)}>
                      {effectiveTier}
                    </Badge>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClearTool(work.toolId);
                  }}
                  data-testid={`button-clear-${work.toolId}`}
                >
                  <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{work.savedDate}</span>
                </div>
                <span>{formatBytes(work.dataSize)}</span>
              </div>
              <div className="mt-3 flex gap-2">
                <Button 
                  size="sm" 
                  className="flex-1"
                  onClick={() => setLocation(`/tools/${work.toolId}`)}
                  disabled={accessUnavailable}
                  data-testid={`button-continue-${work.toolId}`}
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  {isToolAccessLoading
                    ? "Checking access"
                    : accessUnavailable
                      ? "Access unavailable"
                      : entitlement.allowed
                        ? "Continue"
                        : "View access required"}
                </Button>
              </div>
            </CardContent>
          </Card>
          );
        })}
      </div>
      
      {savedWork.length > 6 && (
        <div className="flex justify-center">
          <Button
            variant="ghost"
            onClick={() => setExpanded(!expanded)}
            data-testid="button-expand-work"
          >
            {expanded ? (
              <>
                <ChevronUp className="h-4 w-4 mr-1" />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-1" />
                Show All ({savedWork.length - 6} more)
              </>
            )}
          </Button>
        </div>
      )}
      
      <Alert className="bg-primary/5 border-primary/20">
        <CheckCircle2 className="h-4 w-4 text-primary" />
        <AlertDescription className="text-sm">
          Your work is automatically saved locally. Export important documents before clearing browser data.
        </AlertDescription>
      </Alert>
    </div>
  );
}
