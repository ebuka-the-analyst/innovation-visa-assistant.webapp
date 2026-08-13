import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, CheckCircle2, PoundSterling, RefreshCw, RotateCcw, Save, Search, ShieldCheck } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

type PlanId = "free" | "basic" | "premium" | "enterprise" | "ultimate";
type PublicationStatus = "draft" | "published" | "archived";

interface CommercialPlan {
  id: PlanId;
  displayName: string;
  pricePence: number;
  currency: "GBP";
  billingPeriod: "one_time";
  description: string;
  features: string[];
  ctaLabel: string;
  publicationStatus: PublicationStatus;
  displayOrder: number;
}

interface CommercialCatalog {
  revision: number;
  plans: CommercialPlan[];
  minimumPlanByTool: Record<string, PlanId>;
  updatedAt?: string | null;
  updatedBy?: string | null;
}

interface AdminToolRecord {
  id?: string;
  toolId?: string;
  name?: string;
  category?: string | null;
  stage?: string | null;
  listed?: boolean;
  available?: boolean;
  status?: string;
  minimumPlanId?: PlanId;
}

type CatalogWarnings =
  | Array<string | { message?: string; code?: string; toolIds?: string[] }>
  | {
      unlistedRunnableToolIds?: string[];
      unavailableListedToolIds?: string[];
    };

interface AdminCatalogResponse {
  catalog: CommercialCatalog;
  source: "database" | "fallback" | string;
  warnings?: CatalogWarnings;
  tools?: AdminToolRecord[] | Record<string, AdminToolRecord>;
  toolCounts?: Partial<Record<PlanId, number>>;
}

interface NormalizedTool {
  id: string;
  name: string;
  category: string;
  stage: string;
  listed: boolean;
  available: boolean;
}

interface ChangePreview {
  planChanges: string[];
  toolChanges: Array<{ id: string; name: string; from: PlanId; to: PlanId }>;
  accessReductions: number;
  priceChanges: number;
  publicationChanges: number;
}

const PLAN_IDS: PlanId[] = ["free", "basic", "premium", "enterprise", "ultimate"];
const PLAN_LABELS: Record<PlanId, string> = {
  free: "Free",
  basic: "Basic",
  premium: "Premium",
  enterprise: "Enterprise",
  ultimate: "Ultimate",
};
const PLAN_RANK = Object.fromEntries(PLAN_IDS.map((id, index) => [id, index])) as Record<PlanId, number>;
const UNSAFE_PLAIN_TEXT = /[<>]|[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/;
const UNSAFE_FEATURE_CLAIM = /\b\d+\s*(tools?|credits?|coins?|pages?)\b|\b\d+(?:\.\d+)?\s*%|£|\b(GBP|pounds?|pence|quid)\b|\/\s*(month|mo|year|yr|week|day|quarter)\b|\b(monthly|yearly|quarterly|weekly|daily|per\s+(month|year|plan|week|day|quarter)|one[- ]time|subscribe|subscription|recurring|renewals?|annually|annual|instalments?|installments?|billed|half[- ]price|discount(?:ed)?|percent(?:age)?|\d+(?:\.\d+)?\s*off|save\s+\d+|(all|every)\s+(tools?|features?)|(complete|full)\s+access\s+to\s+(all|every)\s+(tools?|features?)|unlimited\s+(tools?|features?|credits?|coins?|pages?))\b/i;
const FREE_MARKETING_CLAIM = /(^|\s)free(?=\s|$|[!.,:;])|\bcomplimentary\b|\b(?:no|without)\s+(?:a\s+)?(?:costs?|charges?|fees?|payments?|paying)\b|\bzero[- ](?:cost|charge|fee)\b/i;

function flattenServerDetails(details: unknown): string[] {
  if (!details || typeof details !== "object") return [];
  const result: string[] = [];
  const visit = (value: unknown) => {
    if (typeof value === "string") result.push(value);
    else if (Array.isArray(value)) value.forEach(visit);
    else if (value && typeof value === "object") Object.values(value).forEach(visit);
  };
  visit(details);
  return Array.from(new Set(result));
}

function cloneCatalog(catalog: CommercialCatalog): CommercialCatalog {
  return JSON.parse(JSON.stringify(catalog)) as CommercialCatalog;
}

function formatPrice(pricePence: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: pricePence % 100 === 0 ? 0 : 2,
  }).format(pricePence / 100);
}

function formatPriceInput(pricePence: number): string {
  return (pricePence / 100).toFixed(2).replace(/\.00$/, "");
}

function titleCase(value: string): string {
  return value
    .split(/[-_]/g)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function normalizeWarnings(warnings: AdminCatalogResponse["warnings"]): string[] {
  if (!warnings) return [];
  if (!Array.isArray(warnings)) {
    const messages: string[] = [];
    if (warnings.unlistedRunnableToolIds?.length) {
      messages.push(`${warnings.unlistedRunnableToolIds.length} runnable tools are not listed as public Tools Hub cards.`);
    }
    if (warnings.unavailableListedToolIds?.length) {
      messages.push(`${warnings.unavailableListedToolIds.length} listed catalogue tools have no runnable implementation: ${warnings.unavailableListedToolIds.join(", ")}.`);
    }
    return messages;
  }
  return warnings.map((warning) => {
    if (typeof warning === "string") return warning;
    const toolSuffix = warning.toolIds?.length ? ` (${warning.toolIds.join(", ")})` : "";
    return `${warning.message || warning.code || "Catalogue warning"}${toolSuffix}`;
  });
}

function normalizeTools(response: AdminCatalogResponse, catalog: CommercialCatalog): NormalizedTool[] {
  const rawEntries: Array<[string | undefined, AdminToolRecord]> = Array.isArray(response.tools)
    ? response.tools.map((tool): [string | undefined, AdminToolRecord] => [tool.id || tool.toolId, tool])
    : Object.entries(response.tools || {});
  const byId = new Map<string, AdminToolRecord>();

  for (const [key, tool] of rawEntries) {
    const id = tool.id || tool.toolId || key;
    if (id) byId.set(id, tool);
  }

  const ids = new Set([...Object.keys(catalog.minimumPlanByTool), ...Array.from(byId.keys())]);
  return Array.from(ids)
    .map((id) => {
      const tool = byId.get(id);
      const status = tool?.status?.toLowerCase();
      const hasAssignment = Object.prototype.hasOwnProperty.call(catalog.minimumPlanByTool, id);
      return {
        id,
        name: tool?.name || titleCase(id),
        category: tool?.category || "unlisted",
        stage: tool?.stage || "unspecified",
        listed: tool?.listed ?? status !== "unlisted",
        available: tool?.available ?? (status !== "unavailable" && hasAssignment),
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

function normalizeForSave(catalog: CommercialCatalog): CommercialCatalog {
  return {
    ...catalog,
    plans: catalog.plans.map((plan) => ({
      ...plan,
      displayName: plan.displayName.trim(),
      description: plan.description.trim(),
      ctaLabel: plan.ctaLabel.trim(),
      features: plan.features.map((feature) => feature.trim()).filter(Boolean),
    })),
  };
}

function validateCatalog(catalog: CommercialCatalog, tools: NormalizedTool[]): string[] {
  const errors: string[] = [];
  const planIds = catalog.plans.map((plan) => plan.id);

  if (catalog.plans.length !== PLAN_IDS.length || PLAN_IDS.some((id) => !planIds.includes(id))) {
    errors.push("All five fixed plans must be present exactly once.");
  }

  const displayOrders = new Set<number>();
  const displayNames = new Set<string>();
  for (const plan of catalog.plans) {
    const prefix = PLAN_LABELS[plan.id] || plan.id;
    const name = plan.displayName.trim();
    const description = plan.description.trim();
    const ctaLabel = plan.ctaLabel.trim();
    const features = plan.features.map((feature) => feature.trim()).filter(Boolean);

    if (!name || name.length > 60) errors.push(`${prefix}: display name must be 1–60 characters.`);
    const normalizedName = name.toLocaleLowerCase("en-GB");
    if (displayNames.has(normalizedName)) errors.push("Plan display names must be unique.");
    displayNames.add(normalizedName);
    if (!description || description.length > 240) errors.push(`${prefix}: description must be 1–240 characters.`);
    if (!ctaLabel || ctaLabel.length > 40) errors.push(`${prefix}: button label must be 1–40 characters.`);
    if (UNSAFE_PLAIN_TEXT.test(name) || UNSAFE_PLAIN_TEXT.test(description) || UNSAFE_PLAIN_TEXT.test(ctaLabel)) {
      errors.push(`${prefix}: plan text must be plain text without HTML or control characters.`);
    }
    if (UNSAFE_FEATURE_CLAIM.test(name) || UNSAFE_FEATURE_CLAIM.test(description) || UNSAFE_FEATURE_CLAIM.test(ctaLabel)) {
      errors.push(`${prefix}: plan text cannot contain price, billing, tool-count, credit, coin or page-count claims.`);
    }
    if (plan.id !== "free" && FREE_MARKETING_CLAIM.test(`${name} ${description} ${ctaLabel} ${features.join(" ")}`)) {
      errors.push(`${prefix}: paid-plan copy cannot describe the plan as free or without charge.`);
    }
    if (plan.currency !== "GBP") errors.push(`${prefix}: currency must remain GBP.`);
    if (plan.billingPeriod !== "one_time") errors.push(`${prefix}: billing period must remain one-time.`);
    if (!Number.isInteger(plan.pricePence)) errors.push(`${prefix}: price must resolve to whole pence.`);
    if (plan.id === "free" && plan.pricePence !== 0) errors.push("Free: price must remain £0.");
    if (plan.id !== "free" && (plan.pricePence < 100 || plan.pricePence > 1_000_000)) {
      errors.push(`${prefix}: paid price must be between £1 and £10,000.`);
    }
    if (features.length < 1 || features.length > 12) errors.push(`${prefix}: enter 1–12 feature bullets.`);
    if (features.some((feature) => feature.length > 120)) errors.push(`${prefix}: feature bullets cannot exceed 120 characters.`);
    if (features.some((feature) => UNSAFE_PLAIN_TEXT.test(feature))) {
      errors.push(`${prefix}: feature bullets must be plain text without HTML or control characters.`);
    }
    if (features.some((feature) => UNSAFE_FEATURE_CLAIM.test(feature))) {
      errors.push(`${prefix}: feature bullets cannot contain price, billing, tool-count, credit, coin or page-count claims.`);
    }
    if (new Set(features.map((feature) => feature.toLowerCase())).size !== features.length) {
      errors.push(`${prefix}: feature bullets must be unique.`);
    }
    if (!Number.isInteger(plan.displayOrder) || plan.displayOrder < 0 || plan.displayOrder > 4) {
      errors.push(`${prefix}: display order must be an integer from 0 to 4.`);
    }
    if (displayOrders.has(plan.displayOrder)) errors.push("Plan display order values must be unique.");
    displayOrders.add(plan.displayOrder);
  }

  if (catalog.plans.find((plan) => plan.id === "free")?.publicationStatus !== "published") {
    errors.push("The Free plan must remain published.");
  }
  if (!catalog.plans.some((plan) => plan.id !== "free" && plan.publicationStatus === "published")) {
    errors.push("At least one paid plan must remain published.");
  }

  const runnableTools = tools.filter((tool) => tool.available);
  const managedToolIds = new Set(runnableTools.map((tool) => tool.id));
  const assignmentIds = Object.keys(catalog.minimumPlanByTool);
  if (assignmentIds.length !== managedToolIds.size || assignmentIds.some((id) => !managedToolIds.has(id))) {
    errors.push("Tool assignments must contain every runnable tool exactly once and no unknown tool IDs.");
  }
  const publishedRanks = catalog.plans
    .filter((plan) => plan.publicationStatus === "published")
    .map((plan) => PLAN_RANK[plan.id]);
  for (const tool of runnableTools) {
    const minimumPlan = catalog.minimumPlanByTool[tool.id];
    if (!PLAN_IDS.includes(minimumPlan)) {
      errors.push(`${tool.name}: select a valid minimum plan.`);
    } else if (!publishedRanks.some((rank) => rank >= PLAN_RANK[minimumPlan])) {
      errors.push(`${tool.name}: no published plan can provide its configured access level.`);
    }
  }

  return Array.from(new Set(errors));
}

export function PricingAccessManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [baseline, setBaseline] = useState<CommercialCatalog | null>(null);
  const [draft, setDraft] = useState<CommercialCatalog | null>(null);
  const [reason, setReason] = useState("");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stageFilter, setStageFilter] = useState("all");
  const [planFilter, setPlanFilter] = useState("all");
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [priceInputs, setPriceInputs] = useState<Record<PlanId, string>>(
    () => Object.fromEntries(PLAN_IDS.map((planId) => [planId, "0"])) as Record<PlanId, string>,
  );

  const catalogQuery = useQuery<AdminCatalogResponse>({
    queryKey: ["/api/admin/commercial-catalog"],
  });

  useEffect(() => {
    if (!catalogQuery.data?.catalog) return;
    const incoming = catalogQuery.data.catalog;
    if (!baseline || incoming.revision !== baseline.revision) {
      setBaseline(cloneCatalog(incoming));
      setDraft(cloneCatalog(incoming));
      setPriceInputs(Object.fromEntries(
        incoming.plans.map((plan) => [plan.id, formatPriceInput(plan.pricePence)]),
      ) as Record<PlanId, string>);
      setValidationErrors([]);
    }
  }, [catalogQuery.data]);

  const tools = useMemo(
    () => (catalogQuery.data && draft ? normalizeTools(catalogQuery.data, draft) : []),
    [catalogQuery.data, draft],
  );

  const dirty = useMemo(
    () => Boolean(baseline && draft && (
      JSON.stringify(baseline) !== JSON.stringify(normalizeForSave(draft)) ||
      baseline.plans.some((plan) => {
        const input = priceInputs[plan.id];
        return !/^\d+(?:\.\d{0,2})?$/.test(input) || Math.round(Number(input) * 100) !== plan.pricePence;
      })
    )),
    [baseline, draft, priceInputs],
  );

  const derivedCounts = useMemo(() => {
    const counts = Object.fromEntries(PLAN_IDS.map((id) => [id, 0])) as Record<PlanId, number>;
    if (!draft) return counts;
    for (const tool of tools) {
      if (!tool.available) continue;
      const minimumPlan = draft.minimumPlanByTool[tool.id];
      if (!minimumPlan) continue;
      for (const planId of PLAN_IDS) {
        if (PLAN_RANK[planId] >= PLAN_RANK[minimumPlan]) counts[planId] += 1;
      }
    }
    return counts;
  }, [draft, tools]);

  const categories = useMemo(
    () => Array.from(new Set(tools.map((tool) => tool.category))).sort(),
    [tools],
  );
  const stages = useMemo(
    () => Array.from(new Set(tools.map((tool) => tool.stage))).sort(),
    [tools],
  );
  const filteredTools = useMemo(() => {
    if (!draft) return [];
    const needle = search.trim().toLowerCase();
    return tools.filter((tool) => {
      const minimumPlan = draft.minimumPlanByTool[tool.id];
      return (
        (!needle || tool.name.toLowerCase().includes(needle) || tool.id.toLowerCase().includes(needle)) &&
        (categoryFilter === "all" || tool.category === categoryFilter) &&
        (stageFilter === "all" || tool.stage === stageFilter) &&
        (planFilter === "all" || minimumPlan === planFilter)
      );
    });
  }, [categoryFilter, draft, planFilter, search, stageFilter, tools]);

  const changePreview = useMemo<ChangePreview>(() => {
    const preview: ChangePreview = {
      planChanges: [],
      toolChanges: [],
      accessReductions: 0,
      priceChanges: 0,
      publicationChanges: 0,
    };
    if (!baseline || !draft) return preview;

    for (const next of draft.plans) {
      const previous = baseline.plans.find((plan) => plan.id === next.id);
      if (!previous) continue;
      if (previous.pricePence !== next.pricePence) {
        preview.priceChanges += 1;
        preview.planChanges.push(`${next.displayName}: ${formatPrice(previous.pricePence)} → ${formatPrice(next.pricePence)}`);
      }
      if (previous.publicationStatus !== next.publicationStatus) {
        preview.publicationChanges += 1;
        preview.planChanges.push(`${next.displayName}: ${previous.publicationStatus} → ${next.publicationStatus}`);
      }
      if (previous.displayName !== next.displayName) preview.planChanges.push(`${PLAN_LABELS[next.id]} plan renamed to ${next.displayName}`);
      if (previous.displayOrder !== next.displayOrder) preview.planChanges.push(`${next.displayName}: display order ${previous.displayOrder} → ${next.displayOrder}`);
      if (
        previous.description !== next.description ||
        previous.ctaLabel !== next.ctaLabel ||
        JSON.stringify(previous.features) !== JSON.stringify(next.features)
      ) {
        preview.planChanges.push(`${next.displayName}: public copy updated`);
      }
    }

    for (const tool of tools.filter((item) => item.available)) {
      const from = baseline.minimumPlanByTool[tool.id];
      const to = draft.minimumPlanByTool[tool.id];
      if (from && to && from !== to) {
        preview.toolChanges.push({ id: tool.id, name: tool.name, from, to });
        if (PLAN_RANK[to] > PLAN_RANK[from]) preview.accessReductions += 1;
      }
    }
    return preview;
  }, [baseline, draft, tools]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!baseline || !draft) throw new Error("The catalogue is not ready.");
      const response = await fetch("/api/admin/commercial-catalog", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          expectedRevision: baseline.revision,
          reason: reason.trim(),
          confirmation: true,
          catalog: normalizeForSave(draft),
        }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({})) as { error?: string; details?: unknown };
        const detailMessages = flattenServerDetails(body.details);
        const error = new Error([body.error || `Request failed with status ${response.status}`, ...detailMessages].join(": ")) as Error & { status?: number };
        error.status = response.status;
        throw error;
      }
      return response.json() as Promise<AdminCatalogResponse>;
    },
    onSuccess: (saved) => {
      if (saved?.catalog) {
        setBaseline(cloneCatalog(saved.catalog));
        setDraft(cloneCatalog(saved.catalog));
        setPriceInputs(Object.fromEntries(
          saved.catalog.plans.map((plan) => [plan.id, formatPriceInput(plan.pricePence)]),
        ) as Record<PlanId, string>);
      }
      setReason("");
      setValidationErrors([]);
      setConfirmationOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/commercial-catalog"] });
      queryClient.invalidateQueries({ queryKey: ["/api/pricing"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tools/access"] });
      toast({ title: "Commercial catalogue saved", description: `Revision ${saved.catalog?.revision ?? (baseline?.revision ?? 0) + 1} is now active.` });
    },
    onError: (error: Error & { status?: number }) => {
      setConfirmationOpen(false);
      if (error.status === 409) {
        setValidationErrors(["Another administrator published a newer revision. Reset this draft, refresh the catalogue, then reapply and review your changes."]);
      }
      toast({
        title: error.status === 409 ? "Catalogue changed elsewhere" : "Catalogue was not saved",
        description: error.message || "Refresh the catalogue and try again.",
        variant: "destructive",
      });
    },
  });

  const updatePlan = (planId: PlanId, updates: Partial<CommercialPlan>) => {
    setDraft((current) => current ? {
      ...current,
      plans: current.plans.map((plan) => plan.id === planId ? { ...plan, ...updates } : plan),
    } : current);
    setValidationErrors([]);
  };

  const updateToolPlan = (toolId: string, planId: PlanId) => {
    setDraft((current) => current ? {
      ...current,
      minimumPlanByTool: { ...current.minimumPlanByTool, [toolId]: planId },
    } : current);
    setValidationErrors([]);
  };

  const resetDraft = () => {
    if (!baseline) return;
    setDraft(cloneCatalog(baseline));
    setPriceInputs(Object.fromEntries(
      baseline.plans.map((plan) => [plan.id, formatPriceInput(plan.pricePence)]),
    ) as Record<PlanId, string>);
    setReason("");
    setValidationErrors([]);
  };

  const reviewChanges = () => {
    if (!draft || !dirty) return;
    const errors = validateCatalog(normalizeForSave(draft), tools);
    for (const plan of draft.plans) {
      const input = priceInputs[plan.id];
      if (!/^\d+(?:\.\d{0,2})?$/.test(input)) {
        errors.push(`${PLAN_LABELS[plan.id]}: price must use no more than two decimal places.`);
      }
    }
    if (reason.trim().length < 10 || reason.trim().length > 500) {
      errors.push("Change reason must be between 10 and 500 characters.");
    }
    if (UNSAFE_PLAIN_TEXT.test(reason)) {
      errors.push("Change reason must be plain text without HTML or control characters.");
    }
    setValidationErrors(errors);
    if (errors.length === 0) {
      setConfirmationOpen(true);
    } else {
      toast({
        title: "Review the highlighted validation errors",
        description: errors[0],
        variant: "destructive",
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  if (catalogQuery.isError) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Pricing catalogue could not be loaded</AlertTitle>
        <AlertDescription className="flex items-center justify-between gap-3">
          <span>{catalogQuery.error instanceof Error ? catalogQuery.error.message : "Please try again."}</span>
          <Button size="sm" variant="outline" onClick={() => catalogQuery.refetch()}>
            <RefreshCw className="mr-1 h-3.5 w-3.5" /> Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (catalogQuery.isLoading || !draft || !baseline) {
    return (
      <div className="space-y-3" data-testid="pricing-access-loading">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-72 w-full" />
      </div>
    );
  }

  const warnings = normalizeWarnings(catalogQuery.data?.warnings);
  const unlistedCount = tools.filter((tool) => tool.available && !tool.listed).length;
  const structuredWarnings = catalogQuery.data?.warnings;
  const hasStructuredUnlistedWarning = Boolean(
    structuredWarnings &&
    !Array.isArray(structuredWarnings) &&
    structuredWarnings.unlistedRunnableToolIds?.length,
  );

  return (
    <div className="space-y-3" data-testid="pricing-access-management">
      <Card>
        <CardHeader className="p-3 pb-2">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <CardTitle className="flex items-center gap-2 text-sm">
                <PoundSterling className="h-4 w-4 text-primary" />
                Pricing &amp; Plan Access
              </CardTitle>
              <CardDescription className="mt-1 text-xs">
                One catalogue controls public prices, checkout amounts, upgrade copy and minimum tool access.
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <Badge variant={catalogQuery.data?.source === "database" ? "default" : "secondary"}>
                {catalogQuery.data?.source === "database" ? "Database" : "Safe fallback"}
              </Badge>
              <Badge variant="outline">Revision {draft.revision}</Badge>
              {dirty && <Badge className="bg-amber-500 text-white">Unsaved changes</Badge>}
              <Button size="sm" variant="outline" onClick={() => catalogQuery.refetch()} disabled={catalogQuery.isFetching || dirty}>
                <RefreshCw className={`mr-1 h-3.5 w-3.5 ${catalogQuery.isFetching ? "animate-spin" : ""}`} /> Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {(warnings.length > 0 || unlistedCount > 0) && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Catalogue coverage warnings</AlertTitle>
          <AlertDescription>
            <ul className="mt-1 list-disc space-y-1 pl-4 text-xs">
              {unlistedCount > 0 && !hasStructuredUnlistedWarning && <li>{unlistedCount} runnable tools are not currently listed as public Tools Hub cards.</li>}
              {warnings.map((warning, index) => <li key={`${warning}-${index}`}>{warning}</li>)}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {validationErrors.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Resolve these issues before saving</AlertTitle>
          <AlertDescription>
            <ul className="mt-1 list-disc space-y-1 pl-4 text-xs">
              {validationErrors.map((error) => <li key={error}>{error}</li>)}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="plans" className="space-y-3">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="plans">Plans &amp; Pricing</TabsTrigger>
          <TabsTrigger value="tools">Tool Access</TabsTrigger>
        </TabsList>

        <TabsContent value="plans" className="mt-0 space-y-3">
          <div className="grid gap-3 xl:grid-cols-2">
            {PLAN_IDS.map((planId) => {
              const plan = draft.plans.find((item) => item.id === planId);
              if (!plan) return null;
              return (
                <Card key={plan.id} data-testid={`commercial-plan-${plan.id}`}>
                  <CardHeader className="p-3 pb-2">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <CardTitle className="text-sm">{PLAN_LABELS[plan.id]}</CardTitle>
                        <CardDescription className="font-mono text-[10px]">{plan.id}</CardDescription>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">{formatPrice(plan.pricePence)}</p>
                        <p className="text-[10px] text-muted-foreground">{derivedCounts[plan.id]} runnable tools</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="grid gap-3 p-3 pt-1 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor={`plan-name-${plan.id}`}>Display name</Label>
                      <Input
                        id={`plan-name-${plan.id}`}
                        value={plan.displayName}
                        maxLength={60}
                        onChange={(event) => updatePlan(plan.id, { displayName: event.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor={`plan-price-${plan.id}`}>Price displayed and charged (GBP)</Label>
                      <Input
                        id={`plan-price-${plan.id}`}
                        type="number"
                        min={plan.id === "free" ? 0 : 1}
                        max={plan.id === "free" ? 0 : 10000}
                        step="0.01"
                        disabled={plan.id === "free"}
                        value={priceInputs[plan.id]}
                        onChange={(event) => {
                          const value = event.target.value;
                          setPriceInputs((current) => ({ ...current, [plan.id]: value }));
                          if (/^\d+(?:\.\d{0,2})?$/.test(value)) {
                            updatePlan(plan.id, { pricePence: Math.round(Number(value) * 100) });
                          } else {
                            setValidationErrors([]);
                          }
                        }}
                        data-testid={`input-plan-price-${plan.id}`}
                      />
                      <p className="text-[10px] text-muted-foreground">GBP · one-time payment · stored as whole pence</p>
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label htmlFor={`plan-description-${plan.id}`}>Description</Label>
                      <Textarea
                        id={`plan-description-${plan.id}`}
                        value={plan.description}
                        maxLength={240}
                        rows={2}
                        onChange={(event) => updatePlan(plan.id, { description: event.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label htmlFor={`plan-features-${plan.id}`}>Feature bullets</Label>
                      <Textarea
                        id={`plan-features-${plan.id}`}
                        value={plan.features.join("\n")}
                        rows={5}
                        onChange={(event) => updatePlan(plan.id, { features: event.target.value.split("\n") })}
                      />
                      <p className="text-[10px] text-muted-foreground">One qualitative feature per line. Tool counts are calculated automatically.</p>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor={`plan-cta-${plan.id}`}>Button label</Label>
                      <Input
                        id={`plan-cta-${plan.id}`}
                        value={plan.ctaLabel}
                        maxLength={40}
                        onChange={(event) => updatePlan(plan.id, { ctaLabel: event.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Publication status</Label>
                      <Select
                        value={plan.publicationStatus}
                        onValueChange={(value) => updatePlan(plan.id, { publicationStatus: value as PublicationStatus })}
                        disabled={plan.id === "free"}
                      >
                        <SelectTrigger data-testid={`select-plan-status-${plan.id}`}><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="published">Published</SelectItem>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="archived">Archived</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor={`plan-order-${plan.id}`}>Display order</Label>
                      <Input
                        id={`plan-order-${plan.id}`}
                        type="number"
                        min={0}
                        max={4}
                        step={1}
                        value={plan.displayOrder}
                        onChange={(event) => updatePlan(plan.id, { displayOrder: Number(event.target.value) })}
                      />
                    </div>
                    <div className="rounded-md border bg-muted/30 p-2 text-xs">
                      <p className="font-medium">Fixed checkout behaviour</p>
                      <p className="mt-1 text-muted-foreground">Currency: GBP · Billing: one-time · Destination: code controlled</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="tools" className="mt-0 space-y-3">
          <div className="grid grid-cols-2 gap-2 lg:grid-cols-5">
            {PLAN_IDS.map((planId) => (
              <Card key={planId} className="bg-muted/20">
                <CardContent className="p-3 text-center">
                  <p className="text-xl font-bold">{derivedCounts[planId]}</p>
                  <p className="text-xs text-muted-foreground">{PLAN_LABELS[planId]} tools</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader className="p-3 pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <ShieldCheck className="h-4 w-4 text-primary" /> Minimum plan by runnable tool
              </CardTitle>
              <CardDescription className="text-xs">Higher plans automatically inherit access. Tool names, categories, stages and public-card order remain code controlled.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 p-3 pt-1">
              <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="pl-8"
                    placeholder="Search tools…"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    data-testid="input-tool-access-search"
                  />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger><SelectValue placeholder="All categories" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All categories</SelectItem>
                    {categories.map((category) => <SelectItem key={category} value={category}>{titleCase(category)}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={stageFilter} onValueChange={setStageFilter}>
                  <SelectTrigger><SelectValue placeholder="All stages" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All stages</SelectItem>
                    {stages.map((stage) => <SelectItem key={stage} value={stage}>{titleCase(stage)}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={planFilter} onValueChange={setPlanFilter}>
                  <SelectTrigger><SelectValue placeholder="All minimum plans" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All minimum plans</SelectItem>
                    {PLAN_IDS.map((planId) => <SelectItem key={planId} value={planId}>{PLAN_LABELS[planId]}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-md border">
                <ScrollArea className="h-[520px]">
                  <Table>
                    <TableHeader className="sticky top-0 z-10 bg-background">
                      <TableRow>
                        <TableHead>Tool</TableHead>
                        <TableHead>Category / stage</TableHead>
                        <TableHead>Catalogue status</TableHead>
                        <TableHead className="w-[210px]">Minimum plan</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTools.map((tool) => {
                        const minimumPlan = draft.minimumPlanByTool[tool.id];
                        return (
                          <TableRow key={tool.id} data-testid={`tool-access-row-${tool.id}`}>
                            <TableCell>
                              <p className="font-medium">{tool.name}</p>
                              <p className="font-mono text-[10px] text-muted-foreground">{tool.id}</p>
                            </TableCell>
                            <TableCell className="text-xs">
                              <span>{titleCase(tool.category)}</span>
                              <span className="text-muted-foreground"> · {titleCase(tool.stage)}</span>
                            </TableCell>
                            <TableCell>
                              {!tool.available ? (
                                <Badge variant="secondary">Unavailable</Badge>
                              ) : !tool.listed ? (
                                <Badge variant="outline">Runnable, unlisted</Badge>
                              ) : (
                                <Badge variant="outline" className="text-emerald-600">Listed &amp; runnable</Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              {tool.available && minimumPlan ? (
                                <Select value={minimumPlan} onValueChange={(value) => updateToolPlan(tool.id, value as PlanId)}>
                                  <SelectTrigger data-testid={`select-tool-plan-${tool.id}`}><SelectValue /></SelectTrigger>
                                  <SelectContent>
                                    {PLAN_IDS.map((planId) => <SelectItem key={planId} value={planId}>{PLAN_LABELS[planId]}</SelectItem>)}
                                  </SelectContent>
                                </Select>
                              ) : (
                                <span className="text-xs text-muted-foreground">Not assignable</span>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                      {filteredTools.length === 0 && (
                        <TableRow><TableCell colSpan={4} className="py-8 text-center text-muted-foreground">No tools match these filters.</TableCell></TableRow>
                      )}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </div>
              <p className="text-xs text-muted-foreground">Showing {filteredTools.length} of {tools.length} registered tool records.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardContent className="space-y-3 p-3">
          <div className="space-y-1.5">
            <Label htmlFor="catalog-change-reason">Reason for change</Label>
            <Textarea
              id="catalog-change-reason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              maxLength={500}
              rows={3}
              placeholder="Explain why these pricing, publication or tool-access changes are required (10–500 characters)."
              data-testid="input-catalog-change-reason"
            />
            <p className="text-[10px] text-muted-foreground">{reason.trim().length}/500 characters · recorded in the administrator audit log</p>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-muted-foreground">
              {dirty
                ? `${changePreview.planChanges.length} plan changes and ${changePreview.toolChanges.length} tool assignments are awaiting review.`
                : "No unsaved catalogue changes."}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={resetDraft} disabled={!dirty || saveMutation.isPending}>
                <RotateCcw className="mr-1 h-3.5 w-3.5" /> Reset
              </Button>
              <Button onClick={reviewChanges} disabled={!dirty || saveMutation.isPending} data-testid="button-review-catalog-changes">
                <Save className="mr-1 h-3.5 w-3.5" /> Review &amp; save
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={confirmationOpen} onOpenChange={setConfirmationOpen}>
        <AlertDialogContent className="max-w-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm commercial catalogue changes</AlertDialogTitle>
            <AlertDialogDescription>
              Saving creates revision {baseline.revision + 1}. New checkout sessions and refreshed tool access will use it immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="max-h-[420px] space-y-3 overflow-y-auto text-sm">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <div className="rounded-md border p-2 text-center"><p className="font-bold">{changePreview.priceChanges}</p><p className="text-[10px] text-muted-foreground">Price changes</p></div>
              <div className="rounded-md border p-2 text-center"><p className="font-bold">{changePreview.publicationChanges}</p><p className="text-[10px] text-muted-foreground">Status changes</p></div>
              <div className="rounded-md border p-2 text-center"><p className="font-bold">{changePreview.toolChanges.length}</p><p className="text-[10px] text-muted-foreground">Tool moves</p></div>
              <div className="rounded-md border border-amber-500/40 p-2 text-center"><p className="font-bold text-amber-600">{changePreview.accessReductions}</p><p className="text-[10px] text-muted-foreground">Access reductions</p></div>
            </div>
            {changePreview.planChanges.length > 0 && (
              <div>
                <p className="mb-1 font-medium">Plan changes</p>
                <ul className="list-disc space-y-1 pl-5 text-xs text-muted-foreground">
                  {changePreview.planChanges.map((change, index) => <li key={`${change}-${index}`}>{change}</li>)}
                </ul>
              </div>
            )}
            {changePreview.toolChanges.length > 0 && (
              <div>
                <p className="mb-1 font-medium">Tool-access changes</p>
                <ul className="list-disc space-y-1 pl-5 text-xs text-muted-foreground">
                  {changePreview.toolChanges.slice(0, 20).map((change) => (
                    <li key={change.id}>{change.name}: {PLAN_LABELS[change.from]} → {PLAN_LABELS[change.to]}</li>
                  ))}
                  {changePreview.toolChanges.length > 20 && <li>…and {changePreview.toolChanges.length - 20} more tool assignments</li>}
                </ul>
              </div>
            )}
            <div className="rounded-md border bg-muted/30 p-2">
              <p className="font-medium">Audit reason</p>
              <p className="mt-1 whitespace-pre-wrap text-xs text-muted-foreground">{reason.trim()}</p>
            </div>
            {(changePreview.priceChanges > 0 || changePreview.publicationChanges > 0 || changePreview.accessReductions > 0) && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Customer-visible change</AlertTitle>
                <AlertDescription className="text-xs">Prices, publication state or existing tool availability will change immediately for newly refreshed requests.</AlertDescription>
              </Alert>
            )}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={saveMutation.isPending}>Go back</AlertDialogCancel>
            <AlertDialogAction onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} data-testid="button-confirm-catalog-save">
              {saveMutation.isPending ? "Saving…" : (
                <><CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Confirm &amp; publish</>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
