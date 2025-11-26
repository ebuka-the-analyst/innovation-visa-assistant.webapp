import { useState, useMemo, useEffect } from "react";
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
import { ALL_TOOLS, Tool } from "@shared/tools-data";
import { Search, Filter, Lock, CheckCircle, Loader2, Star, Clock, Heart, ArrowRight } from "lucide-react";
import * as Icons from "lucide-react";
import Footer from "@/components/Footer";
import { useTierAccess, type ToolTier } from "@/hooks/useTierAccess";
import { SEOHead } from "@/components/SEOHead";
import { organizationSchema, createBreadcrumbSchema } from "@/lib/seo-schemas";
import { SoftUpgradeOverlay } from "@/components/SoftUpgradeOverlay";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const FAVORITES_KEY = 'tools-favorites';
const RECENT_KEY = 'tools-recently-used';

function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]');
    } catch { return []; }
  });

  const toggleFavorite = (toolId: string) => {
    const newFavorites = favorites.includes(toolId)
      ? favorites.filter(id => id !== toolId)
      : [...favorites, toolId];
    setFavorites(newFavorites);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
  };

  const isFavorite = (toolId: string) => favorites.includes(toolId);

  return { favorites, toggleFavorite, isFavorite };
}

function useRecentlyUsed() {
  const [recent, setRecent] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
    } catch { return []; }
  });

  const addRecent = (toolId: string) => {
    const filtered = recent.filter(id => id !== toolId);
    const newRecent = [toolId, ...filtered].slice(0, 6);
    setRecent(newRecent);
    localStorage.setItem(RECENT_KEY, JSON.stringify(newRecent));
  };

  return { recent, addRecent };
}

type IconName = keyof typeof Icons;

interface LockedToolInfo {
  id: string;
  name: string;
  description: string;
  tier: ToolTier;
}

export default function ToolsHub() {
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [stageFilter, setStageFilter] = useState<string>("");
  const [tierFilter, setTierFilter] = useState<string>("");
  const [lockedToolInfo, setLockedToolInfo] = useState<LockedToolInfo | null>(null);
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);
  const { toast } = useToast();

  const { canAccessTool, userTier } = useTierAccess();
  const { favorites, toggleFavorite, isFavorite } = useFavorites();
  const { recent, addRecent } = useRecentlyUsed();

  // Verify payment when returning from Stripe checkout
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session_id');
    const planId = params.get('plan_id');
    const upgraded = params.get('upgraded');

    if (sessionId && planId && upgraded === 'true') {
      setIsVerifyingPayment(true);
      
      apiRequest('POST', '/api/payment/verify', { sessionId, planId })
        .then(async (response) => {
          const data = await response.json();
          
          // Invalidate user query to refresh tier access
          await queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
          
          toast({
            title: "Payment Successful!",
            description: `Your subscription has been activated. You now have ${data.tier || 'upgraded'} tier access to all tools.`,
          });
          
          // Clean up URL parameters
          window.history.replaceState({}, '', '/tools-hub');
        })
        .catch((error) => {
          console.error('Payment verification failed:', error);
          toast({
            title: "Payment Verification",
            description: "Your payment was received. If tools are still locked, please refresh the page or contact support.",
            variant: "destructive",
          });
        })
        .finally(() => {
          setIsVerifyingPayment(false);
        });
    }
  }, [toast]);

  const handleToolClick = (tool: Tool) => {
    const hasAccess = canAccessTool(tool.tier as ToolTier);
    if (hasAccess) {
      addRecent(tool.id);
      setLocation(`/tools/${tool.id}`);
    } else {
      setLockedToolInfo({
        id: tool.id,
        name: tool.name,
        description: tool.description,
        tier: tool.tier as ToolTier,
      });
    }
  };

  const handleFavoriteClick = (e: React.MouseEvent, toolId: string) => {
    e.stopPropagation();
    toggleFavorite(toolId);
    toast({
      title: isFavorite(toolId) ? "Removed from favorites" : "Added to favorites",
      description: isFavorite(toolId) ? "Tool removed from your favorites" : "Tool added to your favorites",
    });
  };

  const favoriteTools = ALL_TOOLS.filter(tool => favorites.includes(tool.id));
  const recentTools = recent.map(id => ALL_TOOLS.find(t => t.id === id)).filter(Boolean) as Tool[];

  const filteredTools = useMemo(() => {
    return ALL_TOOLS.filter((tool) => {
      const matchesSearch =
        tool.name.toLowerCase().includes(search.toLowerCase()) ||
        tool.description.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = !categoryFilter || tool.category === categoryFilter;
      const matchesStage = !stageFilter || tool.stage === stageFilter;
      const matchesTier = !tierFilter || tool.tier === tierFilter;

      return matchesSearch && matchesCategory && matchesStage && matchesTier;
    });
  }, [search, categoryFilter, stageFilter, tierFilter]);

  const categories = Array.from(new Set(ALL_TOOLS.map((t) => t.category)));
  const stages = Array.from(new Set(ALL_TOOLS.map((t) => t.stage)));
  const tiers = Array.from(new Set(ALL_TOOLS.map((t) => t.tier)));

  const stageLabels = {
    before: "Before Applying",
    during: "During Application",
    after: "After Approval",
  };

  const tierLabels = {
    free: "Free",
    basic: "Basic",
    premium: "Premium",
    enterprise: "Enterprise",
    ultimate: "Ultimate",
  };

  const tierColors = {
    free: "bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700",
    basic: "bg-blue-50 dark:bg-slate-800 border-blue-200 dark:border-slate-700",
    premium: "bg-purple-50 dark:bg-slate-800 border-purple-200 dark:border-slate-700",
    enterprise: "bg-orange-50 dark:bg-slate-800 border-orange-200 dark:border-slate-700",
    ultimate: "bg-gradient-to-br from-amber-50 to-orange-50 dark:from-slate-800 dark:to-slate-700 border-orange-300 dark:border-slate-700",
  };

  const GetIconComponent = ({ name }: { name: string }) => {
    const Icon = Icons[name as IconName] as any;
    return Icon ? <Icon className="w-5 h-5" /> : <Icons.Zap className="w-5 h-5" />;
  };

  const breadcrumbSchema = createBreadcrumbSchema([
    { name: "Home", url: "https://innovatorfoundervisaassistant.co.uk/" },
    { name: "Tools Hub", url: "https://innovatorfoundervisaassistant.co.uk/tools-hub" }
  ]);

  const combinedSchema = {
    "@context": "https://schema.org",
    "@graph": [
      organizationSchema,
      breadcrumbSchema
    ]
  };

  return (
    <>
      <SEOHead
        title="100+ UK Innovator Founder Visa Tools | Expert Application Assistant"
        description="Access 100+ professional tools for your UK Innovator Founder Visa application. From compliance checkers to business plan generators, financial modeling to pitch coaching. Free to £129 tiers available."
        canonical="https://innovatorfoundervisaassistant.co.uk/tools-hub"
        keywords="UK innovator visa tools, business plan generator, compliance checker, financial projections, market analysis, visa application tools"
        schema={combinedSchema}
      />
      
      {/* Payment verification loading overlay */}
      {isVerifyingPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-lg shadow-xl text-center">
            <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
            <h3 className="text-lg font-semibold mb-2">Verifying Payment...</h3>
            <p className="text-muted-foreground">Please wait while we activate your subscription.</p>
          </div>
        </div>
      )}
      
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 py-8">
        <div className="w-full px-4 md:px-8 lg:px-12">
          {/* Header */}
          <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-3" data-testid="heading-tools-hub">
            UK Innovator Founder Visa Tools
          </h1>
          <p className="text-lg text-muted-foreground">
            100+ powerful tools to help you from application to approval and beyond
          </p>
        </div>

        {/* Favorites Section */}
        {favoriteTools.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Heart className="h-5 w-5 text-red-500 fill-red-500" />
              <h2 className="text-xl font-semibold">Your Favorites</h2>
              <Badge variant="secondary">{favoriteTools.length}</Badge>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {favoriteTools.slice(0, 6).map((tool) => {
                const hasAccess = canAccessTool(tool.tier as ToolTier);
                return (
                  <Card
                    key={tool.id}
                    onClick={() => handleToolClick(tool)}
                    className="p-4 hover-elevate cursor-pointer relative group"
                    data-testid={`favorite-${tool.id}`}
                  >
                    <button
                      onClick={(e) => handleFavoriteClick(e, tool.id)}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      data-testid={`unfavorite-${tool.id}`}
                    >
                      <Heart className="h-4 w-4 text-red-500 fill-red-500" />
                    </button>
                    <div className="flex flex-col items-center text-center gap-2">
                      <div className={`p-2 rounded-lg ${hasAccess ? 'bg-primary/10' : 'bg-muted'}`}>
                        <GetIconComponent name={tool.icon} />
                      </div>
                      <span className="text-sm font-medium line-clamp-2">{tool.name}</span>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Recently Used Section */}
        {recentTools.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-5 w-5 text-blue-500" />
              <h2 className="text-xl font-semibold">Recently Used</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {recentTools.map((tool) => {
                const hasAccess = canAccessTool(tool.tier as ToolTier);
                return (
                  <Card
                    key={tool.id}
                    onClick={() => handleToolClick(tool)}
                    className="p-4 hover-elevate cursor-pointer relative group"
                    data-testid={`recent-${tool.id}`}
                  >
                    <button
                      onClick={(e) => handleFavoriteClick(e, tool.id)}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      data-testid={`add-favorite-${tool.id}`}
                    >
                      <Heart className={`h-4 w-4 ${isFavorite(tool.id) ? 'text-red-500 fill-red-500' : 'text-muted-foreground'}`} />
                    </button>
                    <div className="flex flex-col items-center text-center gap-2">
                      <div className={`p-2 rounded-lg ${hasAccess ? 'bg-primary/10' : 'bg-muted'}`}>
                        <GetIconComponent name={tool.icon} />
                      </div>
                      <span className="text-sm font-medium line-clamp-2">{tool.name}</span>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Search & Filters */}
        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm p-6 mb-8 border dark:border-slate-700">
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search tools..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
                data-testid="input-search-tools"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Category</label>
                <Select value={categoryFilter || "all"} onValueChange={(val) => setCategoryFilter(val === "all" ? "" : val)}>
                  <SelectTrigger data-testid="select-category">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Stage</label>
                <Select value={stageFilter || "all"} onValueChange={(val) => setStageFilter(val === "all" ? "" : val)}>
                  <SelectTrigger data-testid="select-stage">
                    <SelectValue placeholder="All Stages" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Stages</SelectItem>
                    {stages.map((stage) => (
                      <SelectItem key={stage} value={stage}>
                        {stageLabels[stage as keyof typeof stageLabels]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Tier</label>
                <Select value={tierFilter || "all"} onValueChange={(val) => setTierFilter(val === "all" ? "" : val)}>
                  <SelectTrigger data-testid="select-tier">
                    <SelectValue placeholder="All Tiers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tiers</SelectItem>
                    {tiers.map((tier) => (
                      <SelectItem key={tier} value={tier}>
                        {tierLabels[tier as keyof typeof tierLabels]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearch("");
                    setCategoryFilter("");
                    setStageFilter("");
                    setTierFilter("");
                  }}
                  className="w-full"
                  data-testid="button-reset-filters"
                >
                  Reset Filters
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Tools Grid */}
        <div>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold">
              {filteredTools.length} {filteredTools.length === 1 ? "Tool" : "Tools"}
            </h2>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Filter className="w-4 h-4" />
              Showing {filteredTools.length} of {ALL_TOOLS.length}
            </div>
          </div>

          {filteredTools.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground text-lg">
                No tools found matching your filters. Try adjusting your search.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {filteredTools.map((tool) => {
                const hasAccess = canAccessTool(tool.tier as ToolTier);
                return (
                  <Card
                    key={tool.id}
                    onClick={() => handleToolClick(tool)}
                    className={`p-6 hover-elevate cursor-pointer transition-all border-2 relative group ${
                      tierColors[tool.tier as keyof typeof tierColors]
                    } ${!hasAccess ? 'opacity-80' : ''}`}
                    data-testid={`card-tool-${tool.id}`}
                  >
                    <div className="absolute top-3 right-3 flex items-center gap-1">
                      <button
                        onClick={(e) => handleFavoriteClick(e, tool.id)}
                        className="p-1.5 rounded-full bg-white/80 dark:bg-slate-800/80 opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110"
                        data-testid={`favorite-btn-${tool.id}`}
                      >
                        <Heart className={`w-3 h-3 ${isFavorite(tool.id) ? 'text-red-500 fill-red-500' : 'text-muted-foreground'}`} />
                      </button>
                      {!hasAccess && (
                        <div className="bg-orange-500 text-white p-1.5 rounded-full" data-testid={`lock-${tool.id}`}>
                          <Lock className="w-3 h-3" />
                        </div>
                      )}
                      {hasAccess && (
                        <div className="bg-green-500 text-white p-1.5 rounded-full" data-testid={`unlocked-${tool.id}`}>
                          <CheckCircle className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-1 flex items-center gap-2" data-testid={`title-${tool.id}`}>
                            {tool.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">{tool.description}</p>
                        </div>
                        <div className="flex-shrink-0 text-primary">
                          <GetIconComponent name={tool.icon} />
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 pt-3 border-t">
                        <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-xs font-medium text-primary">
                          {stageLabels[tool.stage as keyof typeof stageLabels]}
                        </div>
                        <div
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                            tool.tier === "free"
                              ? "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                              : tool.tier === "basic"
                                ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                                : tool.tier === "premium"
                                  ? "bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300"
                                  : tool.tier === "enterprise"
                                    ? "bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300"
                                    : "bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300"
                          }`}
                          data-testid={`badge-tier-${tool.id}`}
                        >
                          {tierLabels[tool.tier as keyof typeof tierLabels]}
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Summary Stats */}
        <div className="mt-12 md:mt-16 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
          <Card className="p-6 text-center">
            <div className="text-3xl font-bold text-primary">{ALL_TOOLS.length}</div>
            <p className="text-sm text-muted-foreground mt-2">Total Tools</p>
          </Card>
          <Card className="p-6 text-center">
            <div className="text-3xl font-bold text-gray-600">
              {ALL_TOOLS.filter((t) => t.tier === "free").length}
            </div>
            <p className="text-sm text-muted-foreground mt-2">Free Tools</p>
          </Card>
          <Card className="p-6 text-center">
            <div className="text-3xl font-bold text-purple-600">
              {ALL_TOOLS.filter((t) => t.stage === "before").length}
            </div>
            <p className="text-sm text-muted-foreground mt-2">Before Applying</p>
          </Card>
          <Card className="p-6 text-center">
            <div className="text-3xl font-bold text-orange-600">
              {ALL_TOOLS.filter((t) => t.stage === "during").length}
            </div>
            <p className="text-sm text-muted-foreground mt-2">During Application</p>
          </Card>
          <Card className="p-6 text-center">
            <div className="text-3xl font-bold text-green-600">
              {ALL_TOOLS.filter((t) => t.stage === "after").length}
            </div>
            <p className="text-sm text-muted-foreground mt-2">After Approval</p>
          </Card>
        </div>
        </div>
      </div>
      <Footer />

      <SoftUpgradeOverlay
        isOpen={!!lockedToolInfo}
        onClose={() => setLockedToolInfo(null)}
        requiredTier={lockedToolInfo?.tier || "free"}
        toolName={lockedToolInfo?.name || ""}
        toolDescription={lockedToolInfo?.description}
        userTier={userTier}
      />
    </>
  );
}
