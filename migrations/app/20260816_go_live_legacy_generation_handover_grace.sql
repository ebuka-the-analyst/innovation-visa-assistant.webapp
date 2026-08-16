-- Give legacy in-process generators a short rolling-deployment handover window.
-- The immediately preceding go-live migration is the only code that can create
-- durable generation jobs before the new application version is released, so
-- every queued job visible here represents a pre-existing legacy generation.
--
-- If an old worker completes during this window, the durable worker will later
-- observe the completed business plan and mark the queue job complete without
-- regenerating it. If the old worker was already orphaned, recovery begins after
-- this two-minute grace period. New jobs created by the durable application are
-- not affected and remain immediately available.
UPDATE business_plan_generation_jobs AS job
SET available_at = GREATEST(job.available_at, NOW() + INTERVAL '2 minutes'),
    updated_at = NOW()
WHERE job.status = 'queued'
  AND job.generator_version = 'business-plan-v1-2026-08-16'
  AND EXISTS (
    SELECT 1
    FROM business_plans AS bp
    WHERE bp.id = job.plan_id
      AND bp.status = 'generating'
      AND bp.generated_content IS NULL
  );
