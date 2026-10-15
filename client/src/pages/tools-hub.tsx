import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ALL_TOOLS, type Tool } from "@shared/tools-data";
import { UNAVAILABLE_LISTED_TOOL_IDS } from "@shared/commercialCatalog";
import {
  PUBLIC_MEMBER_FILTERS, membershipIncludesMinimumPlan, toolMembershipAvailability,
  type PublicMemberFilter,
} from "@shared/memberToolVisibility";
import { Search, Filter, Lock, CheckCircle, Loader2, Clock, Heart } from "lucide-react";
import * as Icons from "lucide-react";
import Footer from "@/components/Footer";
import { useTierAccess, type ToolTier } from "@/hooks/useTierAccess";
import { useToolAccess } from "@/hooks/useCommercialCatalog";
import { SEOHead } from "@/components/SEOHead";
import { organizationSchema, createBreadcrumbSchema } from "@/lib/seo-schemas";
import { SoftUpgradeOverlay } from "@/components/SoftUpgradeOverlay";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

const FAVORITES_KEY = "tools-favorites";
const RECENT_KEY = "tools-recently-used";
const unavailableToolIds = new Set<string>(UNAVAILABLE_LISTED_TOOL_IDS);
const OPEN_ACCESS_TOOLS: Tool[] = [
  { id: "expert-booking", name: "Expert Booking", description: "Browse verified professionals, choose a live time and book a paid consultation.", category: "documentation", stage: "before", tier: "free", icon: "CalendarCheck2" },
  { id: "blog", name: "Blog", description: "Read practical Innovator Founder guides, updates and founder resources.", category: "documentation", stage: "before", tier: "free", icon: "Newspaper" },
];
const OPEN_ACCESS_ROUTES: Record<string, string> = { "expert-booking": "/expert-booking", blog: "/blog" };
const OPEN_ACCESS_TOOL_IDS = new Set(OPEN_ACCESS_TOOLS.map((tool) => tool.id));
const PUBLIC_TOOLS: Tool[] = [
  ...OPEN_ACCESS_TOOLS,
  ...ALL_TOOLS.filter((tool) => !unavailableToolIds.has(tool.id) && !OPEN_ACCESS_TOOL_IDS.has(tool.id)),
];

type IconName = keyof typeof Icons;

interface LockedToolInfo {
  id: string;
  name: string;
  description: string;
  tier: ToolTier;
}

function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(FAVORITES_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setFavorites(parsed.filter((id): id is string => typeof id === "string" && !unavailableToolIds.has(id)));
        }
      }
    } catch {
      // Ignore invalid legacy browser state.
    }
  }, []);

  const toggleFavorite = (toolId: string) => {
    setFavorites((current) => {
      const next = current.includes(toolId)
        ? current.filter((id) => id !== toolId)
        : [...current, toolId];
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
      return next;
    });
  };

  return {
    favorites,
    toggleFavorite,
    isFavorite: (toolId: string) => favorites.includes(toolId),
  };
}

function useRecentlyUsed() {
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(RECENT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setRecent(parsed.filter((id): id is string => typeof id === "string" && !unavailableToolIds.has(id)));
        }
      }
    } catch {
      // Ignore invalid legacy browser state.
    }
  }, []);

  const addRecent = (toolId: string) => {
    setRecent((current) => {
      const next = [toolId, ...current.filter((id) => id !== toolId)].slice(0, 6);
      localStorage.setItem(RECENT_KEY, JSON.stringify(next));
      return next;
    });
  };

  return { recent, addRecent };
}

export default function ToolsHub() {
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [stageFilter, setStageFilter] = useState("");
  const [membershipFilter, setMembershipFilter] = useState<PublicMemberFilter | "">("");
  const [lockedToolInfo, setLockedToolInfo] = useState<LockedToolInfo | null>(null);
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);
  const { toast } = useToast();
  const { userTier } = useTierAccess();
  const auth = useAuth();
  const {
    getToolAccess,
    isLoading: isToolAccessLoading,
    isError: isToolAccessError,
  } = useToolAccess(auth.isAuthenticated);
  const { favorites, toggleFavorite, isFavorite } = useFavorites();
  const { recent, addRecent } = useRecentlyUsed();

  const getEffectiveTier = (tool: Tool): ToolTier | undefined =>
    OPEN_ACCESS_TOOL_IDS.has(tool.id) ? "free" : getToolAccess(tool.id)?.minimumPlanId;
  const canAccessManagedTool = (tool: Tool) =>
    OPEN_ACCESS_TOOL_IDS.has(tool.id) || getToolAccess(tool.id)?.allowed === true;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");
    const planId = params.get("plan_id");
    const upgraded = params.get("upgraded");
    const tier = params.get("tier");

    if (!sessionId || upgraded !== "true") return;

    setIsVerifyingPayment(true);
    const isDirectSubscription = !planId && Boolean(tier);
    const endpoint = isDirectSubscription ? "/api/payment/verify-subscription" : "/api/payment/verify";
    const payload = isDirectSubscription ? { sessionId } : { sessionId, planId };

    apiRequest("POST", endpoint, payload)
      .then(async (response) => {
        const data = await response.json();
        await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
        await queryClient.invalidateQueries({ queryKey: ["/api/onboarding/status"] });
        await queryClient.invalidateQueries({ queryKey: ["/api/tools/access"] });
        toast({
          title: "Payment Successful!",
          description: `Welcome! Your ${data.tier || "upgraded"} plan access is now active.`,
        });
        window.history.replaceState({}, "", "/tools-hub");
        localStorage.setItem("trigger-onboarding-tour", "true");
      })
      .catch((error) => {
        console.error("Payment verification failed:", error);
        toast({
          title: "Payment Verification",
          description: "Your payment was received. If tools are still locked, please refresh the page or contact support.",
          variant: "destructive",
        });
      })
      .finally(() => setIsVerifyingPayment(false));
  }, [toast]);

  const handleToolClick = (tool: Tool) => {
    const openRoute = OPEN_ACCESS_ROUTES[tool.id];
    if (openRoute) {
      addRecent(tool.id);
      setLocation(openRoute);
      return;
    }
    if (!auth.isLoading && !auth.isAuthenticated) {
      setLocation(`/login?redirect=${encodeURIComponent(`/tools/${tool.id}`)}`);
      return;
    }
    const entitlement = getToolAccess(tool.id);
    if (isToolAccessLoading || isToolAccessError || !entitlement) {
      toast({
        title: "Access unavailable",
        description: "Your current plan access could not be verified. Please try again.",
        variant: "destructive",
      });
      return;
    }
    if (entitlement.allowed) {
      addRecent(tool.id);
      setLocation(`/tools/${tool.id}`);
      return;
    }
    setLockedToolInfo({
      id: tool.id,
      name: tool.name,
      description: tool.description,
      tier: entitlement.minimumPlanId,
    });
  };

  const handleFavoriteClick = (event: React.MouseEvent, toolId: string) => {
    event.stopPropagation();
    const wasFavorite = isFavorite(toolId);
    toggleFavorite(toolId);
    toast({
      title: wasFavorite ? "Removed from favorites" : "Added to favorites",
      description: wasFavorite ? "Tool removed from your favorites" : "Tool added to your favorites",
    });
  };

  const favoriteTools = PUBLIC_TOOLS.filter((tool) => favorites.includes(tool.id));
  const recentTools = recent
    .map((id) => PUBLIC_TOOLS.find((tool) => tool.id === id))
    .filter((tool): tool is Tool => Boolean(tool));

  const filteredTools = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return PUBLIC_TOOLS.filter((tool) => {
      const matchesSearch = !normalizedSearch
        || tool.name.toLowerCase().includes(normalizedSearch)
        || tool.description.toLowerCase().includes(normalizedSearch);
      const matchesCategory = !categoryFilter || tool.category === categoryFilter;
      const matchesStage = !stageFilter || tool.stage === stageFilter;
      const entitlement = getToolAccess(tool.id);
      const matchesMembership = !membershipFilter || OPEN_ACCESS_TOOL_IDS.has(tool.id) || (
        !!entitlement && entitlement.available !== false && entitlement.listed !== false &&
        membershipIncludesMinimumPlan(entitlement.minimumPlanId,membershipFilter)
      );
      return matchesSearch && matchesCategory && matchesStage && matchesMembership;
    });
  }, [search, categoryFilter, stageFilter, membershipFilter, getToolAccess]);

  const categories = Array.from(new Set(PUBLIC_TOOLS.map((tool) => tool.category)));
  const stages = Array.from(new Set(PUBLIC_TOOLS.map((tool) => tool.stage)));
  const stageLabels = {
    before: "Before Applying",
    during: "During Application",
    after: "After Approval",
  } as const;
  const tierColors: Record<ToolTier, string> = {
    free: "bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700",
    basic: "bg-blue-50 dark:bg-slate-800 border-blue-200 dark:border-slate-700",
    premium: "bg-purple-50 dark:bg-slate-800 border-purple-200 dark:border-slate-700",
    enterprise: "bg-orange-50 dark:bg-slate-800 border-orange-200 dark:border-slate-700",
    ultimate: "bg-amber-50 dark:bg-slate-800 border-amber-300 dark:border-slate-700",
  };

  const GetIconComponent = ({ name }: { name: string }) => {
    const Icon = Icons[name as IconName] as React.ComponentType<{ className?: string }> | undefined;
    return Icon ? <Icon className="w-5 h-5" /> : <Icons.Zap className="w-5 h-5" />;
  };

  const combinedSchema = {
    "@context": "https://schema.org",
    "@graph": [
      organizationSchema,
      createBreadcrumbSchema([
        { name: "Home", url: "https://innovatorfoundervisaassistant.co.uk/" },
        { name: "Tools Hub", url: "https://innovatorfoundervisaassistant.co.uk/tools-hub" },
      ]),
    ],
  };

  return (
    <>
      <SEOHead
        title="UK Innovator Founder Visa Tools | Expert Application Assistant"
        description="Explore UK Innovator Founder Visa tools for compliance, business planning, financial modelling, evidence preparation and pitch coaching."
        canonical="https://innovatorfoundervisaassistant.co.uk/tools-hub"
        keywords="UK Innovator Founder Visa tools, business plan generator, compliance checker, financial projections, market analysis, visa application tools"
        schema={combinedSchema}
      />

      {isVerifyingPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-lg shadow-xl text-center">
            <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
            <h3 className="text-lg font-semibold mb-2">Verifying Payment...</h3>
            <p className="text-muted-foreground">Please wait while we activate your plan access.</p>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 py-8">
        <div className="w-full px-4 md:px-8 lg:px-12">
          <div className="mb-6">
            <h1 className="text-xl font-bold mb-2" data-testid="heading-tools-hub">
              UK Innovator Founder Visa Tools
            </h1>
            <p className="text-sm text-muted-foreground">
              Explore IFVA tools by membership. Choose a package to see which tools it includes; locks show what your account can actually use.
            </p>
          </div>

          {favoriteTools.length > 0 && (
            <section className="mb-8" aria-labelledby="favorite-tools-heading">
              <div className="flex items-center gap-2 mb-4">
                <Heart className="h-5 w-5 text-red-500 fill-red-500" />
                <h2 id="favorite-tools-heading" className="text-xl font-semibold">Your Favorites</h2>
                <Badge variant="secondary">{favoriteTools.length}</Badge>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {favoriteTools.slice(0, 6).map((tool) => (
                  <Card
                    key={tool.id}
                    onClick={() => handleToolClick(tool)}
                    className="p-4 hover-elevate cursor-pointer relative group"
                    data-testid={`favorite-${tool.id}`}
                  >
                    <button
                      type="button"
                      onClick={(event) => handleFavoriteClick(event, tool.id)}
                      className="absolute top-2 right-2 inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background/95 text-muted-foreground opacity-100 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      aria-label={`Remove ${tool.name} from favorites`}
                    >
                      <Heart className="h-4 w-4 text-red-500 fill-red-500" />
                    </button>
                    <div className="flex flex-col items-center text-center gap-2">
                      <div className={`p-2 rounded-lg ${canAccessManagedTool(tool) ? "bg-primary/10" : "bg-muted"}`}>
                        <GetIconComponent name={tool.icon} />
                      </div>
                      <span className="text-sm font-medium line-clamp-2">{tool.name}</span>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {recentTools.length > 0 && (
            <section className="mb-8" aria-labelledby="recent-tools-heading">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="h-5 w-5 text-blue-500" />
                <h2 id="recent-tools-heading" className="text-xl font-semibold">Recently Used</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {recentTools.map((tool) => (
                  <Card
                    key={tool.id}
                    onClick={() => handleToolClick(tool)}
                    className="p-4 hover-elevate cursor-pointer relative group"
                    data-testid={`recent-${tool.id}`}
                  >
                    <button
                      type="button"
                      onClick={(event) => handleFavoriteClick(event, tool.id)}
                      className="absolute top-2 right-2 inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background/95 text-muted-foreground opacity-100 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      aria-label={`${isFavorite(tool.id) ? "Remove" : "Add"} ${tool.name} ${isFavorite(tool.id) ? "from" : "to"} favorites`}
                    >
                      <Heart className={`h-4 w-4 ${isFavorite(tool.id) ? "text-red-500 fill-red-500" : "text-muted-foreground"}`} />
                    </button>
                    <div className="flex flex-col items-center text-center gap-2">
                      <div className={`p-2 rounded-lg ${canAccessManagedTool(tool) ? "bg-primary/10" : "bg-muted"}`}>
                        <GetIconComponent name={tool.icon} />
                      </div>
                      <span className="text-sm font-medium line-clamp-2">{tool.name}</span>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          )}

          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm p-6 mb-8 border dark:border-slate-700">
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search tools..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="pl-10"
                  data-testid="input-search-tools"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Category</label>
                  <Select value={categoryFilter || "all"} onValueChange={(value) => setCategoryFilter(value === "all" ? "" : value)}>
                    <SelectTrigger data-testid="select-category"><SelectValue placeholder="All Categories" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>{category.charAt(0).toUpperCase() + category.slice(1)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Stage</label>
                  <Select value={stageFilter || "all"} onValueChange={(value) => setStageFilter(value === "all" ? "" : value)}>
                    <SelectTrigger data-testid="select-stage"><SelectValue placeholder="All Stages" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Stages</SelectItem>
                      {stages.map((stage) => (
                        <SelectItem key={stage} value={stage}>{stageLabels[stage]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Membership</label>
                  <Select value={membershipFilter || "all"} onValueChange={(value) => setMembershipFilter(value === "all" ? "" : value as PublicMemberFilter)}>
                    <SelectTrigger data-testid="select-membership"><SelectValue placeholder="All Memberships" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Memberships</SelectItem>
                      {PUBLIC_MEMBER_FILTERS.map(({id,label}) => (
                        <SelectItem key={id} value={id}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setSearch("");
                      setCategoryFilter("");
                      setStageFilter("");
                      setMembershipFilter("");
                    }}
                    data-testid="button-reset-filters"
                  >
                    Reset Filters
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">{filteredTools.length} {filteredTools.length === 1 ? "Tool" : "Tools"}</h2>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Filter className="w-4 h-4" />
                Showing {filteredTools.length} of {PUBLIC_TOOLS.length}
              </div>
            </div>

            {filteredTools.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground text-lg">No tools found matching your filters. Try adjusting your search.</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
                {filteredTools.map((tool) => {
                  const entitlement = getToolAccess(tool.id);
                  const effectiveTier = entitlement?.minimumPlanId;
                  const hasAccess = canAccessManagedTool(tool);
                  const membershipLabel = OPEN_ACCESS_TOOL_IDS.has(tool.id)
                    ? "Free · Founder · Founder Pro · 90-Day Pass"
                    : entitlement && entitlement.available !== false && entitlement.listed !== false
                      ? toolMembershipAvailability(effectiveTier) : "Sign in to check access";
                  return (
                    <Card
                      key={tool.id}
                      onClick={() => handleToolClick(tool)}
                      className={`flex h-full min-w-0 flex-col p-6 hover-elevate cursor-pointer transition-all border-2 relative group ${
                        effectiveTier ? tierColors[effectiveTier] : "bg-muted/30 border-border"
                      } ${!hasAccess ? "opacity-80" : ""}`}
                      data-testid={`card-tool-${tool.id}`}
                    >
                      <div className="mb-4 flex w-full min-w-0 items-center justify-between gap-3" data-testid={`tool-icon-row-${tool.id}`}>
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary" data-testid={`tool-icon-${tool.id}`}>
                          <GetIconComponent name={tool.icon} />
                        </div>
                        <div className="flex shrink-0 items-center gap-2" data-testid={`tool-actions-${tool.id}`}>
                          <button
                            type="button"
                            onClick={(event) => handleFavoriteClick(event, tool.id)}
                            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-background text-muted-foreground opacity-100 transition-colors hover:bg-muted hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                            aria-label={`${isFavorite(tool.id) ? "Remove" : "Add"} ${tool.name} ${isFavorite(tool.id) ? "from" : "to"} favorites`}
                            aria-pressed={isFavorite(tool.id)}
                            data-testid={`favorite-button-${tool.id}`}
                          >
                            <Heart className={`h-4 w-4 ${isFavorite(tool.id) ? "fill-red-600 text-red-600" : "text-current"}`} />
                          </button>
                          {!hasAccess ? (
                            <div className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-600 text-white" aria-label="Locked tool" data-testid={`lock-${tool.id}`}>
                              <Lock className="h-4 w-4" aria-hidden="true" />
                            </div>
                          ) : (
                            <div className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-600 text-white" aria-label="Accessible tool" data-testid={`unlocked-${tool.id}`}>
                              <CheckCircle className="h-4 w-4" aria-hidden="true" />
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
                        <div className="flex min-w-0 flex-1 flex-col pb-5">
                          <h3 className="font-semibold text-lg mb-1" data-testid={`title-${tool.id}`}>{tool.name}</h3>
                          <p className="text-sm text-muted-foreground">{tool.description}</p>
                        </div>
                        <div className="mt-auto flex min-w-0 flex-nowrap items-center gap-2 border-t pt-3" data-testid={`tool-footer-${tool.id}`}>
                          <div className="inline-flex shrink-0 items-center whitespace-nowrap px-2 py-1 rounded-full bg-primary/10 text-xs font-medium text-primary">
                            {stageLabels[tool.stage]}
                          </div>
                          <div
                            className="min-w-0 flex-1 overflow-x-auto whitespace-nowrap rounded-lg bg-muted px-2 py-1 text-xs font-medium leading-5"
                            title={membershipLabel}
                            aria-label={membershipLabel}
                            data-testid={`badge-tier-${tool.id}`}
                          >
                            {membershipLabel}
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <Card className="p-4 text-center">
              <div className="text-xl font-bold text-primary">{PUBLIC_TOOLS.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Available Tools</p>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-xl font-bold text-gray-600">
                {auth.isAuthenticated && !isToolAccessLoading && !isToolAccessError
                  ? PUBLIC_TOOLS.filter((tool) => getEffectiveTier(tool) === "free").length
                  : "—"}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Free Tools</p>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-xl font-bold text-purple-600">{PUBLIC_TOOLS.filter((tool) => tool.stage === "before").length}</div>
              <p className="text-xs text-muted-foreground mt-1">Before Applying</p>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-xl font-bold text-orange-600">{PUBLIC_TOOLS.filter((tool) => tool.stage === "during").length}</div>
              <p className="text-xs text-muted-foreground mt-1">During Application</p>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-xl font-bold text-green-600">{PUBLIC_TOOLS.filter((tool) => tool.stage === "after").length}</div>
              <p className="text-xs text-muted-foreground mt-1">After Approval</p>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
      <SoftUpgradeOverlay
        isOpen={Boolean(lockedToolInfo)}
        onClose={() => setLockedToolInfo(null)}
        requiredTier={lockedToolInfo?.tier || "free"}
        toolName={lockedToolInfo?.name || ""}
        toolDescription={lockedToolInfo?.description}
        userTier={userTier}
      />
    </>
  );
}
