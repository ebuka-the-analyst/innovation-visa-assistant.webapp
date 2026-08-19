import type { Express, Request, Response, NextFunction } from "express";
import { isAuthenticated } from "./auth";
import { storage } from "./storage";
import { generatePDFContent } from "./pdf";
import { registerExpertBookingRoutes } from "./expertBookingRoutes";
import { registerExpertBookingPaymentWebhook } from "./expertBookingPaymentWebhook";
import {
  RevisionServiceError,
  acceptRevisionForUser,
  cancelQueuedRevisionForUser,
  createRevisionForUser,
  getRevisionCandidateForUser,
  getRevisionContextForUser,
  getRevisionDetailForUser,
} from "./services/businessPlanRevisionService";

function currentUserId(req: Request): string | null {
  return String((req.user as any)?.id || "").trim() || null;
}

function mutationOriginGuard(req: Request, res: Response, next: NextFunction) {
  const origin = String(req.get("origin") || "").trim();
  if (!origin) return next();

  try {
    const originUrl = new URL(origin);
    const forwardedHost = String(req.get("x-forwarded-host") || req.get("host") || "").split(",")[0].trim();
    if (!forwardedHost || originUrl.host !== forwardedHost) {
      return res.status(403).json({ error: "Cross-origin revision mutation blocked." });
    }
  } catch {
    return res.status(403).json({ error: "Invalid request origin." });
  }
  return next();
}

function sendRevisionError(res: Response, error: unknown) {
  if (error instanceof RevisionServiceError) {
    return res.status(error.statusCode).json(error.payload);
  }
  console.error("[Revision API] Unexpected error", error);
  return res.status(500).json({ error: "Unable to process the revision request." });
}

export function registerBusinessPlanRevisionRoutes(app: Express): void {
  // This bootstrap is already invoked by server/index.ts after the core route set.
  // Register Expert Support here as small, isolated route modules rather than
  // expanding the legacy monolithic server/routes.ts further.
  registerExpertBookingPaymentWebhook(app);
  registerExpertBookingRoutes(app);

  app.get(
    "/api/business-plans/:planId/revisions",
    isAuthenticated,
    async (req: Request, res: Response) => {
      try {
        const userId = currentUserId(req);
        if (!userId) return res.status(401).json({ error: "Authentication required" });
        const result = await getRevisionContextForUser(req.params.planId, userId);
        return res.json(result);
      } catch (error) {
        return sendRevisionError(res, error);
      }
    },
  );

  app.post(
    "/api/business-plans/:planId/revisions",
    isAuthenticated,
    mutationOriginGuard,
    async (req: Request, res: Response) => {
      try {
        const userId = currentUserId(req);
        if (!userId) return res.status(401).json({ error: "Authentication required" });
        const idempotencyKey = String(
          req.get("x-idempotency-key") || req.body?.idempotencyKey || "",
        );
        const result = await createRevisionForUser(req.params.planId, userId, {
          requestType: req.body?.requestType,
          instructions: req.body?.instructions,
          sectionIndexes: req.body?.sectionIndexes,
          idempotencyKey,
        });
        return res.status(result.duplicate ? 200 : 201).json(result);
      } catch (error) {
        return sendRevisionError(res, error);
      }
    },
  );

  app.get(
    "/api/business-plans/:planId/revisions/:revisionId",
    isAuthenticated,
    async (req: Request, res: Response) => {
      try {
        const userId = currentUserId(req);
        if (!userId) return res.status(401).json({ error: "Authentication required" });
        const result = await getRevisionDetailForUser(
          req.params.planId,
          req.params.revisionId,
          userId,
        );
        return res.json(result);
      } catch (error) {
        return sendRevisionError(res, error);
      }
    },
  );

  app.get(
    "/api/business-plans/:planId/revisions/:revisionId/preview",
    isAuthenticated,
    async (req: Request, res: Response) => {
      try {
        const userId = currentUserId(req);
        if (!userId) return res.status(401).json({ error: "Authentication required" });
        const version = await getRevisionCandidateForUser(
          req.params.planId,
          req.params.revisionId,
          userId,
        );
        const plan = await storage.getBusinessPlan(req.params.planId);
        if (!plan || plan.userId !== userId) return res.status(404).send("Business plan not found");
        const html = generatePDFContent({
          ...plan,
          generatedContent: version.generated_content,
          chartData: version.chart_data,
        } as any);
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        res.setHeader("Cache-Control", "private, no-store, max-age=0");
        return res.send(html);
      } catch (error) {
        if (error instanceof RevisionServiceError) {
          return res.status(error.statusCode).send(String(error.payload.error || "Revision unavailable"));
        }
        console.error("[Revision API] Preview failed", error);
        return res.status(500).send("Unable to render revision preview");
      }
    },
  );

  app.post(
    "/api/business-plans/:planId/revisions/:revisionId/accept",
    isAuthenticated,
    mutationOriginGuard,
    async (req: Request, res: Response) => {
      try {
        const userId = currentUserId(req);
        if (!userId) return res.status(401).json({ error: "Authentication required" });
        const result = await acceptRevisionForUser(
          req.params.planId,
          req.params.revisionId,
          userId,
        );
        return res.json(result);
      } catch (error) {
        return sendRevisionError(res, error);
      }
    },
  );

  app.post(
    "/api/business-plans/:planId/revisions/:revisionId/cancel",
    isAuthenticated,
    mutationOriginGuard,
    async (req: Request, res: Response) => {
      try {
        const userId = currentUserId(req);
        if (!userId) return res.status(401).json({ error: "Authentication required" });
        const result = await cancelQueuedRevisionForUser(
          req.params.planId,
          req.params.revisionId,
          userId,
        );
        return res.json(result);
      } catch (error) {
        return sendRevisionError(res, error);
      }
    },
  );
}
