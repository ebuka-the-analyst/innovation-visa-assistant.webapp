const fs = require('fs');

function replaceOnce(source, before, after, label) {
  if (source.includes(after)) return source;
  if (!source.includes(before)) throw new Error(`Patch anchor not found: ${label}`);
  return source.replace(before, after);
}

// Replace the legacy email-only Request Revision action with the in-platform Revision Centre.
{
  const file = 'client/src/components/GenerationProgress.tsx';
  let source = fs.readFileSync(file, 'utf8');
  source = replaceOnce(
    source,
    'import { useCommercialCatalog, type PlanId } from "@/hooks/useCommercialCatalog";',
    'import { useCommercialCatalog, type PlanId } from "@/hooks/useCommercialCatalog";\nimport BusinessPlanRevisionDialog from "@/components/BusinessPlanRevisionDialog";',
    'GenerationProgress revision import',
  );

  const legacyBlock = `                {tier !== 'free' && (\n                  <Button\n                    variant="outline"\n                    onClick={() => {\n                      toast({\n                        title: "Request Revision",\n                        description: "Our team will review your request within 24 hours.",\n                      });\n                      window.location.href = \`mailto:support@innovatorfoundervisaassistant.co.uk?subject=Revision Request - Plan \${planId}\`;\n                    }}\n                    data-testid="button-request-revision"\n                  >\n                    <RefreshCw className="w-4 h-4 mr-2" />\n                    Request Revision\n                  </Button>\n                )}`;
  const revisionCentreBlock = `                {tier !== 'free' && planId && (\n                  <BusinessPlanRevisionDialog planId={planId} />\n                )}`;
  source = replaceOnce(
    source,
    legacyBlock,
    revisionCentreBlock,
    'GenerationProgress legacy revision button',
  );
  fs.writeFileSync(file, source);
}

// A ready-for-review candidate must be discardable without touching the accepted plan.
{
  const file = 'server/services/businessPlanRevisionService.ts';
  let source = fs.readFileSync(file, 'utf8');
  const oldBlock = `    if (revision.status === "cancelled") return { success: true, status: "cancelled", duplicate: true };\n    if (revision.status !== "submitted") {\n      throw new RevisionServiceError(409, { error: "Only a queued revision can be cancelled." });\n    }\n    const job = firstRow<any>(await tx.execute(sql\`\n      SELECT status FROM business_plan_revision_jobs WHERE revision_id = \${revisionId} FOR UPDATE\n    \`));\n    if (job && job.status !== "queued") {\n      throw new RevisionServiceError(409, { error: "Revision processing has already started." });\n    }\n    await tx.execute(sql\`\n      UPDATE business_plan_revisions\n      SET status = 'cancelled', cancelled_at = NOW(), updated_at = NOW()\n      WHERE id = \${revisionId}\n    \`);\n    await tx.execute(sql\`\n      UPDATE business_plan_revision_jobs\n      SET status = 'cancelled', updated_at = NOW()\n      WHERE revision_id = \${revisionId} AND status = 'queued'\n    \`);\n    await addEvent(tx, revisionId, planId, "customer", "revision_cancelled", userId, null);\n    return { success: true, status: "cancelled", duplicate: false };`;

  const newBlock = `    if (revision.status === "cancelled") return { success: true, status: "cancelled", duplicate: true };\n\n    if (revision.status === "submitted") {\n      const job = firstRow<any>(await tx.execute(sql\`\n        SELECT status FROM business_plan_revision_jobs WHERE revision_id = \${revisionId} FOR UPDATE\n      \`));\n      if (job && job.status !== "queued") {\n        throw new RevisionServiceError(409, { error: "Revision processing has already started." });\n      }\n      await tx.execute(sql\`\n        UPDATE business_plan_revisions\n        SET status = 'cancelled', cancelled_at = NOW(), updated_at = NOW()\n        WHERE id = \${revisionId}\n      \`);\n      await tx.execute(sql\`\n        UPDATE business_plan_revision_jobs\n        SET status = 'cancelled', updated_at = NOW()\n        WHERE revision_id = \${revisionId} AND status = 'queued'\n      \`);\n      await addEvent(tx, revisionId, planId, "customer", "revision_cancelled", userId, null);\n      return { success: true, status: "cancelled", duplicate: false };\n    }\n\n    if (revision.status === "ready_for_review") {\n      if (!revision.target_version_id) {\n        throw new RevisionServiceError(409, { error: "Revision candidate is unavailable." });\n      }\n      const target = firstRow<any>(await tx.execute(sql\`\n        SELECT id, status\n        FROM business_plan_versions\n        WHERE id = \${revision.target_version_id} AND plan_id = \${planId}\n        FOR UPDATE\n      \`));\n      if (!target || target.status !== 'candidate') {\n        throw new RevisionServiceError(409, { error: "Revision candidate is no longer discardable." });\n      }\n      await tx.execute(sql\`\n        UPDATE business_plan_versions\n        SET status = 'superseded'\n        WHERE id = \${revision.target_version_id} AND status = 'candidate'\n      \`);\n      await tx.execute(sql\`\n        UPDATE business_plan_revisions\n        SET status = 'cancelled', cancelled_at = NOW(), updated_at = NOW()\n        WHERE id = \${revisionId}\n      \`);\n      await addEvent(tx, revisionId, planId, "customer", "revision_candidate_discarded", userId, {\n        targetVersionId: revision.target_version_id,\n      });\n      return { success: true, status: "cancelled", duplicate: false };\n    }\n\n    throw new RevisionServiceError(409, {\n      error: "Only a queued or ready-for-review revision can be discarded.",\n    });`;

  source = replaceOnce(source, oldBlock, newBlock, 'ready candidate discard support');
  fs.writeFileSync(file, source);
}

console.log('Revision Centre wiring patch applied');
