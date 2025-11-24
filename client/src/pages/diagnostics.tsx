import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Loader2, AlertCircle, CheckCircle, TrendingUp, Users, Target, Zap } from "lucide-react";
import { useLocation } from "wouter";
import { useEffect } from "react";

interface EndorserResult {
  endorserId: string;
  endorserName: string;
  totalScore: number;
  breakdown: {
    innovationScore: number;
    viabilityScore: number;
    scalabilityScore: number;
  };
  sectorFit: boolean;
  riskLevel: string;
  recommendation: string;
  feedback: string;
}

interface RouteAnalysis {
  viableRoutes: Array<{
    id: string;
    name: string;
    successProbability: number;
    timeline: string;
    requirements: string[];
  }>;
}

interface TeamPlan {
  recommendedTeamSize: number;
  keyRoles: string[];
  skillGaps: string[];
  hiringSuggestions: string[];
}

interface TractionForecast {
  month1: { mau: number; arr: number };
  month6: { mau: number; arr: number };
  month12: { mau: number; arr: number };
}

interface RuleStatus {
  lastChecked: string;
  rulesCount: number;
  applicableRules: Array<{
    id: string;
    title: string;
    status: string;
    impact: string;
  }>;
  criticalChanges: Array<{
    rule: string;
    description: string;
    deadline: string;
  }>;
  recommendation: string;
}

export default function DiagnosticsPage() {
  const [, setLocation] = useLocation();

  // Get planId from URL or localStorage
  const planId = new URLSearchParams(window.location.search).get("planId") || localStorage.getItem("lastPlanId");
  
  console.log("Diagnostics: planId =", planId);

  // Fetch all diagnostic data in parallel
  const { data: endorserData, isLoading: endorserLoading, error: endorserError } = useQuery<{ endorsers: EndorserResult[]; scores: any[] }>({
    queryKey: [`/api/endorser/simulate/${planId}`],
    enabled: !!planId,
  });

  const { data: routeData, isLoading: routeLoading, error: routeError } = useQuery<RouteAnalysis>({
    queryKey: [`/api/routes/analyze/${planId}`],
    enabled: !!planId,
  });

  const { data: teamData, isLoading: teamLoading, error: teamError } = useQuery<{ teamPlan: TeamPlan; skillAssessment: any }>({
    queryKey: [`/api/team/model/${planId}`],
    enabled: !!planId,
  });

  const { data: tractionData, isLoading: tractionLoading, error: tractionError } = useQuery<TractionForecast>({
    queryKey: [`/api/traction/forecast/${planId}`],
    enabled: !!planId,
  });

  const { data: ruleData, isLoading: ruleLoading, error: ruleError } = useQuery<RuleStatus>({
    queryKey: [`/api/rules/check/${planId}`],
    enabled: !!planId,
  });

  const errors = [endorserError, routeError, teamError, tractionError, ruleError].filter(Boolean);
  const isLoading = endorserLoading || routeLoading || teamLoading || tractionLoading || ruleLoading;

  console.log("Diagnostics: isLoading =", isLoading, "errors =", errors.length);
  console.log("Diagnostics: endorserData =", endorserData, "endorsers isArray?", endorserData ? Array.isArray(endorserData.endorsers) : "no endorserData");
  console.log("Diagnostics: ruleData =", ruleData, "applicableRules isArray?", ruleData ? Array.isArray(ruleData.applicableRules) : "no ruleData");
  console.log("Diagnostics: routeData =", routeData, "viableRoutes isArray?", routeData ? Array.isArray(routeData.viableRoutes) : "no routeData");
  console.log("Diagnostics: teamData =", teamData);
  console.log("Diagnostics: tractionData =", tractionData);

  useEffect(() => {
    if (!planId) {
      setLocation("/dashboard");
    }
  }, [planId, setLocation]);

  if (!planId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 flex items-center justify-center py-12 px-4">
        <Card className="p-8 max-w-md text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
          <h2 className="text-xl font-bold">No Business Plan Found</h2>
          <p className="text-muted-foreground">Please select a business plan from your dashboard to view diagnostics.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 py-12 px-4">
      <div className="container mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Business Plan Diagnostics</h1>
          <p className="text-lg text-muted-foreground">
            Comprehensive analysis of your visa prospects across all key metrics
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
              <p className="text-muted-foreground">Analyzing your business plan...</p>
              <p className="text-xs text-muted-foreground/60">This may take a moment...</p>
            </div>
          </div>
        ) : errors.length > 0 ? (
          <Card className="p-6 border-destructive/50 bg-destructive/5">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-destructive" />
              <div>
                <h3 className="font-semibold text-destructive">Failed to Load Analysis</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {errors[0] instanceof Error ? errors[0].message : "Please try again or contact support."}
                </p>
              </div>
            </div>
          </Card>
        ) : !ruleData && !endorserData && !routeData && !teamData && !tractionData ? (
          <Card className="p-8 text-center space-y-4">
            <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
            <h2 className="text-xl font-bold">No Diagnostic Data Available</h2>
            <p className="text-muted-foreground">This business plan may not have complete information yet. Please ensure your business plan is fully populated before running diagnostics.</p>
            <button onClick={() => setLocation("/dashboard")} className="mt-4 px-4 py-2 bg-primary text-white rounded">Back to Dashboard</button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Rule Engine Status */}
            {ruleData && Array.isArray(ruleData.applicableRules) && (
              <Card className="p-6 col-span-1 lg:col-span-2">
                <div className="flex items-center gap-3 mb-6">
                  <Zap className="w-6 h-6 text-primary" />
                  <h2 className="text-2xl font-bold">Compliance Status</h2>
                </div>

                <div className="space-y-4">
                  {ruleData.applicableRules.length > 0 ? (
                    ruleData.applicableRules.map((criterion: any, idx: number) => (
                      <div key={idx} className="flex items-start gap-4 p-4 rounded-lg bg-muted/50 border border-border">
                        {criterion.status === "pass" ? (
                          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start gap-2">
                            <h3 className="font-semibold">{criterion.name}</h3>
                            <span className="text-sm font-semibold text-primary">{criterion.score}/100</span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{criterion.feedback}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground">No compliance data available.</p>
                  )}
                </div>
              </Card>
            )}

            {/* Endorser Simulation */}
            {Array.isArray(endorserData?.endorsers) && endorserData.endorsers.length > 0 && (
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Target className="w-6 h-6 text-primary" />
                  <h2 className="text-2xl font-bold">Endorser Fit Analysis</h2>
                </div>

                <div className="space-y-3">
                  {endorserData.endorsers.slice(0, 3).map((result: EndorserResult, idx: number) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-lg border-2 ${
                        result.recommendation === "Strong fit"
                          ? "border-green-500/30 bg-green-500/5"
                          : result.recommendation === "Moderate fit"
                            ? "border-yellow-500/30 bg-yellow-500/5"
                            : "border-red-500/30 bg-red-500/5"
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="font-semibold text-sm">{result.endorserName}</h3>
                        <span className="font-bold text-lg text-primary">{result.totalScore}%</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
                        <div className="text-center">
                          <div className="text-muted-foreground">Innovation</div>
                          <div className="font-semibold">{result.breakdown?.innovationScore || 0}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-muted-foreground">Viability</div>
                          <div className="font-semibold">{result.breakdown?.viabilityScore || 0}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-muted-foreground">Scalability</div>
                          <div className="font-semibold">{result.breakdown?.scalabilityScore || 0}</div>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{result.feedback}</p>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Visa Routes */}
            {routeData && Array.isArray(routeData.viableRoutes) && routeData.viableRoutes.length > 0 && (
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <TrendingUp className="w-6 h-6 text-primary" />
                  <h2 className="text-2xl font-bold">Visa Routes</h2>
                </div>

                <div className="space-y-3">
                  {routeData.viableRoutes.slice(0, 3).map((route: any, idx: number) => (
                    <div key={idx} className="p-4 rounded-lg bg-muted/50 border border-border">
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="font-semibold text-sm">{route.name}</h3>
                        <span className="text-sm font-bold text-chart-3">
                          {Math.round((route.successProbability || 0) * 100)}% fit
                        </span>
                      </div>
                      <div className="flex gap-2 mt-2 flex-wrap">
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                          {route.timeline || "TBD"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Team Plan */}
            {teamData?.teamPlan && (
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Users className="w-6 h-6 text-primary" />
                  <h2 className="text-2xl font-bold">Team Model</h2>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-primary/10 rounded-lg">
                    <div className="text-sm text-muted-foreground">Recommended Team Size</div>
                    <div className="text-3xl font-bold text-primary">{teamData.teamPlan.recommendedTeamSize}</div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-sm mb-2">Key Roles</h3>
                    <div className="space-y-2">
                      {Array.isArray(teamData.teamPlan.keyRoles) && teamData.teamPlan.keyRoles.length > 0 ? (
                        teamData.teamPlan.keyRoles.slice(0, 3).map((role: string, idx: number) => (
                          <div key={idx} className="text-sm flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-primary" />
                            {role}
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-muted-foreground">No key roles defined.</p>
                      )}
                    </div>
                  </div>

                  {Array.isArray(teamData.teamPlan.skillGaps) && teamData.teamPlan.skillGaps.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-sm mb-2 text-yellow-600">Skill Gaps</h3>
                      <div className="space-y-2">
                        {teamData.teamPlan.skillGaps.slice(0, 2).map((gap: string, idx: number) => (
                          <div key={idx} className="text-sm text-muted-foreground flex items-center gap-2">
                            <AlertCircle className="w-3 h-3" />
                            {gap}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Traction Forecast */}
            {tractionData && tractionData.month1 && tractionData.month6 && tractionData.month12 && (
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <TrendingUp className="w-6 h-6 text-primary" />
                  <h2 className="text-2xl font-bold">12-Month Forecast</h2>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Month 1", data: tractionData.month1 },
                    { label: "Month 6", data: tractionData.month6 },
                    { label: "Month 12", data: tractionData.month12 },
                  ].map((period: any, idx: number) => (
                    <div key={idx} className="p-3 bg-muted/50 rounded-lg border border-border text-center">
                      <div className="text-xs text-muted-foreground mb-2">{period.label}</div>
                      <div className="space-y-1">
                        <div>
                          <div className="text-xs text-muted-foreground">MAU</div>
                          <div className="font-bold text-sm">{Math.round(period.data?.mau || 0).toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">ARR</div>
                          <div className="font-bold text-sm text-chart-3">
                            £{Math.round(period.data?.arr || 0).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
