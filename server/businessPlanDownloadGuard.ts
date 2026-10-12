import type { Request, RequestHandler, Response } from "express";

export interface PlanDownloadRecord {
  userId: string;
  status: string;
  generatedContent?: string | null;
  businessName?: string | null;
  [key: string]: any;
}
export interface DownloadRouteOptions<P extends PlanDownloadRecord> {
  lookup: (planId: string) => Promise<P | null | undefined>;
  render: (plan: P, req: Request, res: Response) => Promise<void>;
  allowAdmin?: boolean;
  includeStatusOnNotReady?: boolean;
  failureMessage: string;
  logLabel: string;
}

/**
 * Shared access gate used by the actual PDF download, PDF preview and Word
 * download routes. Authentication is still enforced by isAuthenticated before
 * this handler; this gate also fails closed if the request is missing a user.
 *
 * Return 404 for a plan belonging to another user. Do not reveal existence.
 */
export function guardedBusinessPlanDownload<P extends PlanDownloadRecord>(
  options: DownloadRouteOptions<P>,
): RequestHandler {
  return async (req, res) => {
    try {
      const user = req.user as { id?: string; isAdmin?: boolean } | undefined;
      if (!user?.id) {
        res.status(401).json({ error: "Authentication required" });
        return;
      }
      const businessPlan = await options.lookup(req.params.planId);
      if (!businessPlan || (
        businessPlan.userId !== user.id &&
        !(options.allowAdmin === true && user.isAdmin === true)
      )) {
        res.status(404).json({ error: "Business plan not found" });
        return;
      }
      if (businessPlan.status !== "completed") {
        res.status(400).json(options.includeStatusOnNotReady
          ? { error: "Business plan not ready yet", status: businessPlan.status }
          : { error: "Business plan not ready yet" });
        return;
      }
      if (!businessPlan.generatedContent) {
        res.status(500).json({ error: "Business plan content is missing" });
        return;
      }
      await options.render(businessPlan, req, res);
    } catch (error) {
      console.error(options.logLabel + " error:", error);
      if (!res.headersSent) {
        res.status(500).json({ error: options.failureMessage });
      } else {
        res.end();
      }
    }
  };
}
