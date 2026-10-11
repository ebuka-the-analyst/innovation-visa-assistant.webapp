export const PLATFORM_LATEST_OPENAI_MODEL = "gpt-5.6";

// All OpenAI-backed application features default to the platform-approved latest
// model. Runtime provider/model overrides are controlled centrally from Admin.
// Flagship business plans and revisions must use the highest-quality approved
// API model. Keep unrelated free/SEO/translation workloads on their own policy.
export const BUSINESS_PLAN_MODEL = "gpt-6-astra";
