import { useQuery } from "@tanstack/react-query";
import {
  FALLBACK_COMMERCIAL_CATALOG,
  PLAN_IDS,
  formatPrice,
  getToolCounts,
  type PlanId,
  type PublicCommercialCatalog,
} from "@shared/commercialCatalog";

export type PublicPlan = PublicCommercialCatalog["plans"][number];

const FALLBACK_PUBLIC_CATALOG: PublicCommercialCatalog = {
  revision: FALLBACK_COMMERCIAL_CATALOG.revision,
  source: "fallback",
  plans: FALLBACK_COMMERCIAL_CATALOG.plans
    .filter((plan) => plan.publicationStatus === "published")
    .sort((a, b) => a.displayOrder - b.displayOrder),
  toolCounts: getToolCounts(FALLBACK_COMMERCIAL_CATALOG),
};

function isPublicCatalog(value: unknown): value is PublicCommercialCatalog {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<PublicCommercialCatalog>;
  const toolCounts = candidate.toolCounts as Partial<Record<PlanId, number>> | undefined;
  return Number.isInteger(candidate.revision)
    && Array.isArray(candidate.plans)
    && candidate.plans.length > 0
    && candidate.plans.some((plan) => typeof plan?.pricePence === "number" && plan.pricePence > 0)
    && !!toolCounts
    && PLAN_IDS.every((planId) => Number.isInteger(toolCounts[planId]));
}

function normalizePublicCatalog(value: unknown): PublicCommercialCatalog {
  const candidate = value && typeof value === "object" && "catalog" in value
    ? (value as { catalog?: unknown }).catalog
    : value;
  return isPublicCatalog(candidate) ? candidate : FALLBACK_PUBLIC_CATALOG;
}

export function getPublishedPlanById(
  catalog: Pick<PublicCommercialCatalog, "plans">,
  planId: PlanId | string,
): PublicPlan | undefined {
  return catalog.plans.find((plan) => plan.id === planId);
}

export function getPublishedUpgradePlan(
  catalog: Pick<PublicCommercialCatalog, "plans">,
  minimumPlanId: PlanId,
): PublicPlan | undefined {
  const minimumIndex = PLAN_IDS.indexOf(minimumPlanId);
  return PLAN_IDS.slice(minimumIndex)
    .map((planId) => getPublishedPlanById(catalog, planId))
    .find((plan): plan is PublicPlan => !!plan);
}

export function useCommercialCatalog() {
  const query = useQuery<PublicCommercialCatalog>({
    queryKey: ["/api/pricing"],
    queryFn: async () => {
      const response = await fetch("/api/pricing", {
        credentials: "include",
        cache: "no-store",
      });
      if (!response.ok) {
        throw new Error(`Unable to load pricing (${response.status})`);
      }
      return normalizePublicCatalog(await response.json());
    },
    retry: false,
    staleTime: 60_000,
  });

  const catalog = query.data ?? FALLBACK_PUBLIC_CATALOG;

  return {
    ...query,
    catalog,
    revision: catalog.revision,
    source: catalog.source,
    plans: catalog.plans,
    toolCounts: catalog.toolCounts,
    getPlanById: (planId: PlanId | string) => getPublishedPlanById(catalog, planId),
    getUpgradePlan: (minimumPlanId: PlanId) => getPublishedUpgradePlan(catalog, minimumPlanId),
    formatPrice,
  };
}

export interface ToolAccessEntry {
  allowed: boolean;
  minimumPlanId: PlanId;
  listed?: boolean;
  available?: boolean;
}

export interface ToolAccessResponse {
  revision: number;
  userPlanId?: PlanId;
  accessByTool: Record<string, ToolAccessEntry>;
}

function normalizeToolAccess(value: unknown): ToolAccessResponse | undefined {
  if (!value || typeof value !== "object") return undefined;
  const candidate = value as {
    revision?: unknown;
    userPlanId?: PlanId;
    userPlan?: PlanId;
    accessByTool?: Record<string, ToolAccessEntry>;
    tools?: Record<string, ToolAccessEntry>;
  };
  const accessByTool = candidate.accessByTool ?? candidate.tools;
  if (!Number.isInteger(candidate.revision) || !accessByTool) return undefined;
  return {
    revision: candidate.revision as number,
    userPlanId: candidate.userPlanId ?? candidate.userPlan,
    accessByTool,
  };
}

export function useToolAccess(enabled = true) {
  const query = useQuery<ToolAccessResponse>({
    queryKey: ["/api/tools/access"],
    queryFn: async () => {
      const response = await fetch("/api/tools/access", {
        credentials: "include",
        cache: "no-store",
      });
      if (!response.ok) {
        throw new Error(`Unable to load tool access (${response.status})`);
      }
      const normalized = normalizeToolAccess(await response.json());
      if (!normalized) throw new Error("Invalid tool-access response");
      return normalized;
    },
    enabled,
    retry: false,
    staleTime: 30_000,
  });

  const accessByTool = query.data?.accessByTool ?? {};
  const getToolAccess = (toolId: string) =>
    Object.prototype.hasOwnProperty.call(accessByTool, toolId)
      ? accessByTool[toolId]
      : undefined;
  return {
    ...query,
    accessByTool,
    getToolAccess,
    getMinimumPlanId: (toolId: string) => getToolAccess(toolId)?.minimumPlanId,
  };
}

export { formatPrice, type PlanId };
