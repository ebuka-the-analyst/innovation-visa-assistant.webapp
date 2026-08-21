const fs = require("fs");
const path = require("path");

const root = process.cwd();

function update(relativePath, transform) {
  const target = path.join(root, relativePath);
  const before = fs.readFileSync(target, "utf8");
  const after = transform(before);
  if (after !== before) {
    fs.writeFileSync(target, after, "utf8");
    console.log(`[lawyer-team] prepared ${relativePath}`);
  }
}

update("client/src/pages/admin-dashboard.tsx", (source) => {
  let next = source;

  if (!next.includes('from "@/components/admin/LawyerTeamManagement"')) {
    const importAnchor = 'import { AdminRevisionQueue } from "@/components/admin/AdminRevisionQueue";';
    if (!next.includes(importAnchor)) throw new Error("Could not locate admin dashboard import anchor");
    next = next.replace(importAnchor, `${importAnchor}\nimport LawyerTeamManagement from "@/components/admin/LawyerTeamManagement";`);
  }

  if (!next.includes("data-testid=\"lawyer-team-management\"")) {
    const startAnchor = `                      {/* Advanced Lawyer Team Management */}\n                      {activeSection === 'lawyer-team' && (`;
    const endAnchor = `\n\n                      {/* Advanced Completed Reviews */}`;
    const start = next.indexOf(startAnchor);
    const end = start >= 0 ? next.indexOf(endAnchor, start) : -1;
    if (start < 0 || end < 0) throw new Error("Could not locate Lawyer Team section in admin dashboard");
    const replacement = `                      {/* Advanced Lawyer Team Management */}\n                      {activeSection === 'lawyer-team' && (\n                        <LawyerTeamManagement />\n                      )}`;
    next = next.slice(0, start) + replacement + next.slice(end);
  }

  return next;
});

update("server/storage.ts", (source) => {
  let next = source;

  const getAllOld = `  async getAllImmigrationLawyers(): Promise<ImmigrationLawyer[]> {\n    return db.select().from(immigrationLawyers).orderBy(desc(immigrationLawyers.createdAt));\n  }`;
  const getAllNew = `  async getAllImmigrationLawyers(): Promise<ImmigrationLawyer[]> {\n    return db.select().from(immigrationLawyers)\n      .where(sql\`\${immigrationLawyers.status} <> 'inactive'\`)\n      .orderBy(desc(immigrationLawyers.createdAt));\n  }`;
  if (next.includes(getAllOld)) next = next.replace(getAllOld, getAllNew);
  if (!next.includes(".where(sql`${immigrationLawyers.status} <> 'inactive'`)")) {
    throw new Error("Could not harden active Lawyer Team listing");
  }

  const deleteOld = `  async deleteImmigrationLawyer(id: string): Promise<void> {\n    await db.delete(immigrationLawyers).where(eq(immigrationLawyers.id, id));\n  }`;
  const deleteNew = `  async deleteImmigrationLawyer(id: string): Promise<void> {\n    // Preserve historical reviews/bookings and remove the professional from active use.\n    await db.update(immigrationLawyers)\n      .set({ status: 'inactive', isAvailable: false, updatedAt: new Date() })\n      .where(eq(immigrationLawyers.id, id));\n  }`;
  if (next.includes(deleteOld)) next = next.replace(deleteOld, deleteNew);
  if (!next.includes("Preserve historical reviews/bookings")) throw new Error("Could not harden lawyer removal");

  return next;
});

update("server/routes.ts", (source) => {
  let next = source;

  const getOld = `  // Get all immigration lawyers\n  app.get("/api/admin/lawyers", requireAdmin, async (req, res) => {\n    try {\n      const lawyers = await storage.getAllImmigrationLawyers();\n      res.json(lawyers);\n    } catch (error) {\n      console.error("Get lawyers error:", error);\n      res.status(500).json({ error: "Failed to fetch lawyers" });\n    }\n  });`;
  const getNew = `  // Get all active/suspended immigration lawyers with real review metrics.\n  app.get("/api/admin/lawyers", requireAdmin, async (_req, res) => {\n    try {\n      const lawyers = await storage.getAllImmigrationLawyers();\n      const enriched = await Promise.all(lawyers.map(async (lawyer) => {\n        const reviews = await storage.getLawyerDocumentReviewsByLawyer(lawyer.id);\n        const activeReviews = reviews.filter((review) => ["assigned", "in_review"].includes(review.status));\n        const completedReviews = reviews.filter((review) => review.status === "completed");\n        const approvedReviews = completedReviews.filter((review) => review.overallVerdict === "approved");\n        const ratings = completedReviews\n          .map((review) => review.userRating)\n          .filter((rating): rating is number => typeof rating === "number" && rating > 0);\n        const timed = completedReviews.filter((review) => review.completedAt && review.requestedAt);\n        const averageRating = ratings.length\n          ? Math.round((ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length) * 10) / 10\n          : null;\n        const averageTurnaroundHours = timed.length\n          ? Math.round(timed.reduce((sum, review) => sum + ((new Date(review.completedAt!).getTime() - new Date(review.requestedAt).getTime()) / 3600000), 0) / timed.length)\n          : null;\n        return {\n          ...lawyer,\n          currentReviewCount: activeReviews.length,\n          totalReviewsCompleted: completedReviews.length,\n          successRate: completedReviews.length ? Math.round((approvedReviews.length / completedReviews.length) * 100) : null,\n          averageRating,\n          averageTurnaroundHours,\n        };\n      }));\n      res.set("Cache-Control", "no-store");\n      res.json(enriched);\n    } catch (error) {\n      console.error("Get lawyers error:", error);\n      res.status(500).json({ error: "Failed to fetch lawyers" });\n    }\n  });`;
  if (next.includes(getOld)) next = next.replace(getOld, getNew);
  if (!next.includes("Get all active/suspended immigration lawyers with real review metrics")) {
    throw new Error("Could not harden lawyer list route");
  }

  const createOld = `  // Create a new immigration lawyer\n  app.post("/api/admin/lawyers", requireAdmin, async (req, res) => {\n    try {\n      const lawyer = await storage.createImmigrationLawyer(req.body);\n      res.json(lawyer);\n    } catch (error) {\n      console.error("Create lawyer error:", error);\n      res.status(500).json({ error: "Failed to create lawyer" });\n    }\n  });`;
  const createNew = `  const lawyerProfileInputSchema = z.object({\n    email: z.string().trim().email().max(255),\n    firstName: z.string().trim().min(1).max(100),\n    lastName: z.string().trim().min(1).max(100),\n    profileImageUrl: z.string().trim().url().max(2000).nullable().optional(),\n    oiscLevel: z.string().trim().max(10).nullable().optional(),\n    oiscRegistrationNumber: z.string().trim().max(50).nullable().optional(),\n    sraNumber: z.string().trim().max(50).nullable().optional(),\n    firmName: z.string().trim().max(255).nullable().optional(),\n    specializations: z.array(z.string().trim().min(1).max(100)).max(30).optional(),\n    yearsExperience: z.number().int().min(0).max(80).nullable().optional(),\n    isAvailable: z.boolean().optional(),\n    maxConcurrentReviews: z.number().int().min(1).max(50).optional(),\n    status: z.enum(["active", "suspended"]).optional(),\n    bio: z.string().trim().max(10000).nullable().optional(),\n    notes: z.string().trim().max(10000).nullable().optional(),\n  }).strict();\n\n  // Create or restore an immigration lawyer. Inactive historical records are restored instead of duplicated.\n  app.post("/api/admin/lawyers", requireAdmin, async (req, res) => {\n    try {\n      const parsed = lawyerProfileInputSchema.safeParse(req.body);\n      if (!parsed.success) return res.status(400).json({ error: "Invalid lawyer details", details: parsed.error.issues.map((issue) => issue.message).join("; ") });\n      const values = { ...parsed.data, email: parsed.data.email.toLowerCase(), status: parsed.data.status || "active" };\n      const existing = await storage.getImmigrationLawyerByEmail(values.email);\n      if (existing && existing.status !== "inactive") {\n        return res.status(409).json({ error: "A lawyer with this email already exists." });\n      }\n      const lawyer = existing\n        ? await storage.updateImmigrationLawyer(existing.id, { ...values, status: "active" })\n        : await storage.createImmigrationLawyer(values);\n      res.status(existing ? 200 : 201).json(lawyer);\n    } catch (error) {\n      console.error("Create lawyer error:", error);\n      res.status(500).json({ error: "Failed to create lawyer" });\n    }\n  });`;
  if (next.includes(createOld)) next = next.replace(createOld, createNew);
  if (!next.includes("lawyerProfileInputSchema")) throw new Error("Could not harden lawyer create route");

  const updateOld = `  // Update an immigration lawyer\n  app.patch("/api/admin/lawyers/:id", requireAdmin, async (req, res) => {\n    try {\n      const { id } = req.params;\n      const lawyer = await storage.updateImmigrationLawyer(id, req.body);\n      if (!lawyer) {\n        return res.status(404).json({ error: "Lawyer not found" });\n      }\n      res.json(lawyer);\n    } catch (error) {\n      console.error("Update lawyer error:", error);\n      res.status(500).json({ error: "Failed to update lawyer" });\n    }\n  });`;
  const updateNew = `  // Update an immigration lawyer with an allow-listed payload.\n  app.patch("/api/admin/lawyers/:id", requireAdmin, async (req, res) => {\n    try {\n      const { id } = req.params;\n      const parsed = lawyerProfileInputSchema.partial().safeParse(req.body);\n      if (!parsed.success || Object.keys(parsed.data || {}).length === 0) {\n        return res.status(400).json({ error: "No valid lawyer changes supplied.", details: parsed.success ? undefined : parsed.error.issues.map((issue) => issue.message).join("; ") });\n      }\n      const current = await storage.getImmigrationLawyer(id);\n      if (!current || current.status === "inactive") return res.status(404).json({ error: "Lawyer not found" });\n      const values = { ...parsed.data };\n      if (values.email) {\n        values.email = values.email.toLowerCase();\n        const duplicate = await storage.getImmigrationLawyerByEmail(values.email);\n        if (duplicate && duplicate.id !== id) return res.status(409).json({ error: "A lawyer with this email already exists." });\n      }\n      const lawyer = await storage.updateImmigrationLawyer(id, values);\n      res.json(lawyer);\n    } catch (error) {\n      console.error("Update lawyer error:", error);\n      res.status(500).json({ error: "Failed to update lawyer" });\n    }\n  });`;
  if (next.includes(updateOld)) next = next.replace(updateOld, updateNew);
  if (!next.includes("Update an immigration lawyer with an allow-listed payload")) throw new Error("Could not harden lawyer update route");

  const deleteOld = `  // Delete an immigration lawyer\n  app.delete("/api/admin/lawyers/:id", requireAdmin, async (req, res) => {\n    try {\n      const { id } = req.params;\n      await storage.deleteImmigrationLawyer(id);\n      res.json({ success: true });\n    } catch (error) {\n      console.error("Delete lawyer error:", error);\n      res.status(500).json({ error: "Failed to delete lawyer" });\n    }\n  });`;
  const deleteNew = `  // Remove a lawyer from active use without destroying historical review/booking relationships.\n  app.delete("/api/admin/lawyers/:id", requireAdmin, async (req, res) => {\n    try {\n      const { id } = req.params;\n      const lawyer = await storage.getImmigrationLawyer(id);\n      if (!lawyer || lawyer.status === "inactive") return res.status(404).json({ error: "Lawyer not found" });\n      await storage.deleteImmigrationLawyer(id);\n      res.json({ success: true, removedId: id, removalMode: "inactive" });\n    } catch (error) {\n      console.error("Delete lawyer error:", error);\n      res.status(500).json({ error: "Failed to remove lawyer" });\n    }\n  });`;
  if (next.includes(deleteOld)) next = next.replace(deleteOld, deleteNew);
  if (!next.includes("Remove a lawyer from active use without destroying historical review/booking relationships")) {
    throw new Error("Could not harden lawyer delete route");
  }

  const performanceOld = `  // Get lawyer performance\n  app.get(\n    "/api/admin/lawyers/:id/performance",\n    requireAdmin,\n    async (req, res) => {\n      try {\n        const { id } = req.params;\n        const performance = await storage.getLawyerPerformance(id);\n        res.json(performance);\n      } catch (error) {\n        console.error("Get lawyer performance error:", error);\n        res.status(500).json({ error: "Failed to fetch performance" });\n      }\n    },\n  );`;
  const performanceNew = `  // Get lawyer performance from review records (no fabricated approval values).\n  app.get(\n    "/api/admin/lawyers/:id/performance",\n    requireAdmin,\n    async (req, res) => {\n      try {\n        const { id } = req.params;\n        const lawyer = await storage.getImmigrationLawyer(id);\n        if (!lawyer || lawyer.status === "inactive") return res.status(404).json({ error: "Lawyer not found" });\n        const reviews = await storage.getLawyerDocumentReviewsByLawyer(id);\n        const completedReviews = reviews.filter((review) => review.status === "completed");\n        const approvedReviews = completedReviews.filter((review) => review.overallVerdict === "approved");\n        const ratings = completedReviews.map((review) => review.userRating).filter((rating): rating is number => typeof rating === "number" && rating > 0);\n        const timed = completedReviews.filter((review) => review.completedAt && review.requestedAt);\n        const averageRating = ratings.length ? Math.round((ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length) * 10) / 10 : 0;\n        const averageTurnaroundHours = timed.length\n          ? Math.round(timed.reduce((sum, review) => sum + ((new Date(review.completedAt!).getTime() - new Date(review.requestedAt).getTime()) / 3600000), 0) / timed.length)\n          : 0;\n        res.set("Cache-Control", "no-store");\n        res.json({\n          totalReviews: reviews.length,\n          completedReviews: completedReviews.length,\n          approvedReviews: approvedReviews.length,\n          approvalRate: completedReviews.length ? Math.round((approvedReviews.length / completedReviews.length) * 100) : 0,\n          averageRating,\n          averageTurnaroundHours,\n        });\n      } catch (error) {\n        console.error("Get lawyer performance error:", error);\n        res.status(500).json({ error: "Failed to fetch performance" });\n      }\n    },\n  );`;
  if (next.includes(performanceOld)) next = next.replace(performanceOld, performanceNew);
  if (!next.includes("Get lawyer performance from review records (no fabricated approval values)")) {
    throw new Error("Could not harden lawyer performance route");
  }

  return next;
});

console.log("[lawyer-team] functional management actions, real metrics and safe removal prepared");
