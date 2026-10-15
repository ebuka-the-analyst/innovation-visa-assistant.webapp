import type { Request, RequestHandler } from "express";
import { storage } from "../storage";
import {
  getMinimumPlanForTool,
  hasToolAccess,
  type PlanId,
} from "@shared/commercialCatalog";
import { getCommercialCatalog } from "../services/commercialCatalogService";
import { hasCurrentPaidEntitlement } from "../security/paidEntitlement";
import { effectiveMemberToolPlan } from "@shared/memberToolPlan";

type ToolIdResolver = (request: Request) => string | undefined | Promise<string | undefined>;

export function requireToolAccess(toolIdOrResolver: string | ToolIdResolver): RequestHandler {
  return async (req, res, next) => {
    try {
      const toolId = typeof toolIdOrResolver === "function"
        ? await toolIdOrResolver(req)
        : toolIdOrResolver;
      if (!toolId) {
        return res.status(400).json({ error: "A tool ID is required", code: "TOOL_ID_REQUIRED" });
      }

      const { catalog } = await getCommercialCatalog();
      const minimumPlanId = getMinimumPlanForTool(catalog, toolId);
      if (!minimumPlanId) {
        return res.status(404).json({ error: "Unknown or unavailable tool", code: "UNKNOWN_TOOL", toolId });
      }

      const sessionUser = req.user as { id?: string } | undefined;
      if (!sessionUser?.id) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const user = await storage.getUser(sessionUser.id);
      if (!user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      // Never grant premium tools from a stale tier label alone.
      // Legacy one-time purchases with no expiry retain access while active.
      // New membership SKUs inherit the validated legacy tool access ladder
      // until the catalogue migration in Phase 3. Expired plans map to Free.
      const userPlanId: PlanId = effectiveMemberToolPlan(
        user.subscriptionTier,hasCurrentPaidEntitlement(user),
      );
      if (!hasToolAccess(catalog, userPlanId, toolId)) {
        return res.status(403).json({
          error: "Your current plan does not include this tool",
          code: "TOOL_ACCESS_REQUIRED",
          toolId,
          minimumPlanId,
        });
      }

      next();
    } catch (error) {
      console.error("Tool entitlement check failed:", error);
      res.status(503).json({
        error: "Tool access could not be verified",
        code: "TOOL_ACCESS_UNAVAILABLE",
      });
    }
  };
}
