// User-owned founder profile shape.
//
// Important: this module must never contain a real applicant's personal, immigration,
// financial, business or evidence data. The dashboard starts empty and persists the
// authenticated user's own entries separately.

export type FounderProfile = Record<string, any>;

export const FOUNDER_DATA: FounderProfile = {
  personal: {},
  education: {},
  experience: {},
  business: {},
  financial: {},
  market: {},
  innovation: {},
  scalability: {},
  ukCommitment: {},
  visa: {},
  evidence: {},
};

function readStoredProfile(): FounderProfile {
  if (typeof window === "undefined") return FOUNDER_DATA;
  try {
    const raw = window.localStorage.getItem("founderProfileData");
    if (!raw) return FOUNDER_DATA;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? { ...FOUNDER_DATA, ...parsed } : FOUNDER_DATA;
  } catch {
    return FOUNDER_DATA;
  }
}

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export function getFormattedFounderBio(profile: FounderProfile = readStoredProfile()): string {
  const personal = profile.personal || {};
  const education = profile.education || {};
  const experience = profile.experience || {};
  const lines = [
    text(personal.fullName) && `Founder: ${text(personal.fullName)}`,
    text(experience.summary) && `Professional experience: ${text(experience.summary)}`,
    text(education.summary) && `Education: ${text(education.summary)}`,
  ].filter(Boolean);
  return lines.length ? lines.join("\n\n") : "No founder biography has been entered yet.";
}

export function getExecutiveSummary(profile: FounderProfile = readStoredProfile()): string {
  const business = profile.business || {};
  const innovation = profile.innovation || {};
  const market = profile.market || {};
  const lines = [
    text(business.name) && `Business: ${text(business.name)}`,
    text(business.description) && text(business.description),
    text(innovation.summary) && `Innovation: ${text(innovation.summary)}`,
    text(market.summary) && `Market: ${text(market.summary)}`,
  ].filter(Boolean);
  return lines.length ? lines.join("\n\n") : "No executive summary data has been entered yet.";
}

export function getFinancialProjectionsSummary(profile: FounderProfile = readStoredProfile()): string {
  const financial = profile.financial || {};
  const entries = Object.entries(financial)
    .filter(([, value]) => value !== "" && value !== null && value !== undefined)
    .map(([key, value]) => `${key.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase())}: ${String(value)}`);
  return entries.length ? entries.join("\n") : "No financial projection data has been entered yet.";
}

export function getRequiredFounderInputs(profile: FounderProfile = readStoredProfile()): string[] {
  const required = [
    ["personal.fullName", profile.personal?.fullName],
    ["personal.email", profile.personal?.email],
    ["business.name", profile.business?.name],
  ] as const;
  return required.filter(([, value]) => !text(value)).map(([key]) => key);
}
