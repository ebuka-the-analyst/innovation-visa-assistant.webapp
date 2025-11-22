import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ALL_TOOLS, Tool } from "@shared/tools-data";
import { Search, Filter } from "lucide-react";
import * as Icons from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { AuthHeader } from "@/components/AuthHeader";
import { ToolNavigation } from "@/components/ToolNavigation";
import Footer from "@/components/Footer";

type IconName = keyof typeof Icons;

export default function ToolsHub() {
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [stageFilter, setStageFilter] = useState<string>("");
  const [tierFilter, setTierFilter] = useState<string>("");

  const { data: user } = useQuery<{ id: string; email: string; displayName?: string }>({
    queryKey: ["/api/auth/me"],
    retry: false,
  });

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

  return (
    <>
      {user && <AuthHeader />}
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 py-8">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <ToolNavigation />
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-3" data-testid="heading-tools-hub">
            UK Innovation Visa Tools
          </h1>
          <p className="text-lg text-muted-foreground">
            88 powerful tools to help you from application to approval and beyond
          </p>
        </div>

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

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTools.map((tool) => (
                <Card
                  key={tool.id}
                  onClick={() => setLocation(`/tools/${tool.id}`)}
                  className={`p-6 hover-elevate cursor-pointer transition-all border-2 ${
                    tierColors[tool.tier as keyof typeof tierColors]
                  }`}
                  data-testid={`card-tool-${tool.id}`}
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1" data-testid={`title-${tool.id}`}>
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
                            ? "bg-gray-100 text-gray-700"
                            : tool.tier === "basic"
                              ? "bg-blue-100 text-blue-700"
                              : tool.tier === "premium"
                                ? "bg-purple-100 text-purple-700"
                                : tool.tier === "enterprise"
                                  ? "bg-orange-100 text-orange-700"
                                  : "bg-amber-100 text-amber-700"
                        }`}
                        data-testid={`badge-tier-${tool.id}`}
                      >
                        {tierLabels[tool.tier as keyof typeof tierLabels]}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Summary Stats */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
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
    </>
  );
}
