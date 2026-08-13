import type { Request, RequestHandler } from "express";
import { storage } from "../storage";
import {
  PLAN_IDS,
  getMinimumPlanForTool,
  hasToolAccess,
  type PlanId,
} from "@shared/commercialCatalog";
import { getCommercialCatalog } from "../services/commercialCatalogService";

type ToolIdResolver = (request: Request) => string | undefined | Promise<string | undefined>;

function isPlanId(value: unknown): value is PlanId {
  return typeof value === "string" && PLAN_IDS.includes(value as PlanId);
}

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

      const userPlanId: PlanId = isPlanId(user.subscriptionTier) ? user.subscriptionTier : "free";
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
