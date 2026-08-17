import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export type ToolLifecycleStatus = "started" | "completed" | "failed" | "cancelled";
export type ToolValidationState = "unverified" | "validated" | "rejected";
export type ToolReleaseStatus = "production" | "beta" | "disabled" | "internal";

export interface ToolCaseContext {
  revision: number;
  contextData: Record<string, unknown>;
  evidenceRefs: string[];
  createdAt: string | null;
  updatedAt: string | null;
}

export interface ApplicationBusinessPlan {
  id: string;
  status: string;
  createdAt: string | null;
  completedPlanCount: number;
  businessName: string;
  industry: string;
  problem: string;
  uniqueness: string;
  technology: string;
  experience: string;
  funding: number;
  revenue: string;
  jobCreation: number;
  expansion: string;
  vision: string;
  innovationStage: string;
  productStatus: string;
  existingCustomers: string | null;
  betaTesters: string | null;
  tractionEvidence: string | null;
  techStack: string;
  dataArchitecture: string;
  aiMethodology: string;
  complianceDesign: string;
  patentStatus: string;
  founderEducation: string;
  founderWorkHistory: string;
  founderAchievements: string;
  relevantProjects: string;
  monthlyProjections: string;
  customerAcquisitionCost: number;
  lifetimeValue: number;
  paybackPeriod: number;
  fundingSources: string;
  detailedCosts: string;
  competitors: string;
  competitiveDifferentiation: string;
  customerInterviews: string;
  lettersOfIntent: string | null;
  willingnessToPay: string;
  marketSize: string;
  regulatoryRequirements: string;
  complianceTimeline: string;
  complianceBudget: number;
  hiringPlan: string;
  specificRegions: string;
  internationalPlan: string | null;
  targetEndorser: string;
  contactPointsStrategy: string;
  supportingEvidence: string | null;
}

export interface ApplicationFinancialModelPrefill {
  runId: string;
  toolId: string;
  businessName: string;
  completedAt: string | null;
  oneTimeSetupCostGbp: number | null;
  monthlyOperatingCostGbp: number | null;
  startingMonthlyRevenueGbp: number | null;
  assumptionsNarrative: string | null;
  source: "completed_financial_tool_run";
}

export interface ApplicationDocumentReference {
  id: string;
  name: string;
  category: string | null;
  status: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  reference: string;
}

export interface DocumentPrefillProvenance {
  extractionId: string;
  sourceField: string;
  planField: string;
  confidence: number;
  documentRefs: string[];
  extractedAt: string | null;
  reviewRequired: true;
  countedAsEvidence: false;
}

export interface ApplicationContextPrefill {
  generatedAt: string;
  toolId: string | null;
  businessPlan: ApplicationBusinessPlan | null;
  businessPlanSelection: {
    strategy: "previous_tool_business_match" | "latest_completed" | "questionnaire_draft" | "document_extraction" | "none";
    matchedPreviousToolRun: boolean;
    supplementedByQuestionnaireDraft: boolean;
    questionnaireDraftFieldCount: number;
    supplementedByDocumentExtraction: boolean;
    documentExtractedFieldCount: number;
  };
  relatedToolData: {
    financialModel: ApplicationFinancialModelPrefill | null;
  };
  documentPrefillProvenance: DocumentPrefillProvenance[];
  caseContext: ToolCaseContext;
  previousToolRun: {
    id: string;
    inputSnapshot: Record<string, unknown>;
    evidenceRefs: string[];
    completedAt: string | null;
    createdAt: string | null;
  } | null;
  documents: ApplicationDocumentReference[];
}

export interface ToolRegistrySnapshot {
  schemaVersion: number;
  registryVersion: string;
  defaultRunnableStatus: "production" | "beta";
  productionToolIds: string[];
  disabledListedToolIds: string[];
  policyBaseline: {
    jurisdiction: string;
    route: string;
    version: string;
    sourcePolicy: string;
  };
}

export interface ToolRunSummary {
  id: string;
  tool_id: string;
  status: ToolLifecycleStatus;
  execution_mode: "legacy_client" | "server_engine";
  registry_version: string;
  policy_version: string | null;
  case_context_revision: number | null;
  validation_state: ToolValidationState;
  confidence_score: number | null;
  error_code: string | null;
  started_at: string;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ToolRunDetail extends ToolRunSummary {
  input_snapshot: Record<string, unknown>;
  evidence_refs: string[];
  result_payload: Record<string, unknown> | null;
  result_sha256: string | null;
  validation_summary: Record<string, unknown> | null;
  error_message: string | null;
}

export interface ToolRunEvent {
  event_type: string;
  payload: Record<string, unknown>;
  created_at: string;
}

async function jsonRequest<T>(method: string, url: string, body?: unknown): Promise<T> {
  const response = await apiRequest(method, url, body);
  return response.json() as Promise<T>;
}

export function useToolPlatformRegistry(enabled = true) {
  return useQuery<ToolRegistrySnapshot>({
    queryKey: ["/api/tool-platform/registry"],
    queryFn: () => jsonRequest("GET", "/api/tool-platform/registry"),
    enabled,
    retry: false,
    staleTime: 60_000,
  });
}

export function useToolCaseContext(enabled = true) {
  return useQuery<ToolCaseContext>({
    queryKey: ["/api/tool-platform/context"],
    queryFn: () => jsonRequest("GET", "/api/tool-platform/context"),
    enabled,
    retry: false,
    staleTime: 15_000,
  });
}

export function useApplicationContextPrefill(toolId?: string, enabled = true) {
  const query = new URLSearchParams();
  if (toolId) query.set("toolId", toolId);
  const suffix = query.toString() ? `?${query.toString()}` : "";
  return useQuery<ApplicationContextPrefill>({
    queryKey: ["/api/tool-platform/application-context", toolId || "none"],
    queryFn: () => jsonRequest("GET", `/api/tool-platform/application-context${suffix}`),
    enabled,
    retry: false,
    staleTime: 15_000,
  });
}

export function useUpdateToolCaseContext() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      expectedRevision: number;
      contextData: Record<string, unknown>;
      evidenceRefs?: string[];
    }) => jsonRequest<ToolCaseContext & { success: true }>("PUT", "/api/tool-platform/context", input),
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/tool-platform/context"], data);
    },
  });
}

export function useToolRunHistory(toolId?: string, enabled = true) {
  const query = new URLSearchParams();
  if (toolId) query.set("toolId", toolId);
  const suffix = query.toString() ? `?${query.toString()}` : "";
  return useQuery<{ runs: ToolRunSummary[] }>({
    queryKey: ["/api/tool-platform/runs", toolId || "all"],
    queryFn: () => jsonRequest("GET", `/api/tool-platform/runs${suffix}`),
    enabled,
    retry: false,
    staleTime: 10_000,
  });
}

export function useStartToolRun() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      toolId: string;
      inputSnapshot: Record<string, unknown>;
      evidenceRefs?: string[];
      clientRunKey?: string;
      policyVersion?: string;
    }) => jsonRequest<{
      runId: string;
      status: ToolLifecycleStatus;
      idempotentReplay: boolean;
      toolStatus: ToolReleaseStatus;
      minimumPlanId: string;
      caseContextRevision: number;
      registryVersion?: string;
      policyVersion?: string | null;
    }>("POST", "/api/tool-platform/runs", input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/tool-platform/runs", variables.toolId] });
      queryClient.invalidateQueries({ queryKey: ["/api/tool-platform/runs", "all"] });
    },
  });
}

export function useCompleteToolRun() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      runId: string;
      resultPayload: Record<string, unknown>;
      evidenceRefs?: string[];
    }) => jsonRequest<{
      runId: string;
      status: "completed";
      validationState?: "unverified";
      resultSha256?: string;
      idempotentReplay: boolean;
    }>("POST", `/api/tool-platform/runs/${encodeURIComponent(input.runId)}/complete`, {
      resultPayload: input.resultPayload,
      evidenceRefs: input.evidenceRefs,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tool-platform/runs"] });
    },
  });
}

export function useFailToolRun() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { runId: string; errorCode?: string; errorMessage?: string }) =>
      jsonRequest<{ runId: string; status: "failed"; idempotentReplay: boolean }>(
        "POST",
        `/api/tool-platform/runs/${encodeURIComponent(input.runId)}/fail`,
        { errorCode: input.errorCode, errorMessage: input.errorMessage },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tool-platform/runs"] });
    },
  });
}

export function useToolRun(runId: string | undefined) {
  return useQuery<{ run: ToolRunDetail; events: ToolRunEvent[] }>({
    queryKey: ["/api/tool-platform/runs/detail", runId],
    queryFn: () => jsonRequest("GET", `/api/tool-platform/runs/${encodeURIComponent(runId || "")}`),
    enabled: Boolean(runId),
    retry: false,
    staleTime: 5_000,
  });
}