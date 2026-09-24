export type LoginRiskLevel = "normal" | "review" | "elevated";

export type LoginAuditSignals = {
  failedLogins24h: number;
  sessionCount24h: number;
  sessionCount7d: number;
  distinctCountries7d: number;
  distinctDevices7d: number;
  isEmailVerified: boolean;
  createdAt?: string | Date | null;
};

export type LoginRiskAssessment = {
  level: LoginRiskLevel;
  reasons: string[];
};

function asTime(value?: string | Date | null): number | null {
  if (!value) return null;
  const time = new Date(value).getTime();
  return Number.isFinite(time) ? time : null;
}

export function classifyLoginRisk(
  signals: LoginAuditSignals,
  now: Date = new Date(),
): LoginRiskAssessment {
  const reasons: string[] = [];
  let level: LoginRiskLevel = "normal";

  const elevate = (reason: string) => {
    level = "elevated";
    reasons.push(reason);
  };

  const review = (reason: string) => {
    if (level === "normal") level = "review";
    reasons.push(reason);
  };

  if (signals.failedLogins24h >= 5) {
    elevate("5 or more failed sign-in attempts in the last 24 hours");
  } else if (signals.failedLogins24h > 0) {
    review("Failed sign-in attempts recorded in the last 24 hours");
  }

  if (signals.distinctCountries7d >= 3) {
    elevate("Sessions were recorded from 3 or more countries in 7 days");
  } else if (signals.distinctCountries7d >= 2) {
    review("Sessions were recorded from multiple countries in 7 days");
  }

  if (signals.distinctDevices7d >= 4) {
    review("Several device and browser combinations were used in 7 days");
  }

  if (!signals.isEmailVerified && signals.sessionCount7d > 0) {
    elevate("An unverified account has recorded authenticated sessions");
  }

  const createdAt = asTime(signals.createdAt);
  if (
    createdAt !== null &&
    now.getTime() - createdAt <= 48 * 60 * 60 * 1000 &&
    signals.sessionCount24h >= 3
  ) {
    review("New account has several sessions within its first 48 hours");
  }

  return { level, reasons };
}

export function numberFromDb(value: unknown): number {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}
