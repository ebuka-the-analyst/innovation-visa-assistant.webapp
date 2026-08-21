import crypto from "crypto";

function normaliseEmail(email: string): string {
  return String(email || "").trim().toLowerCase();
}

function signingSecret(): string {
  const secret = String(
    process.env.EXPERT_BOOKING_GUEST_SECRET || process.env.SESSION_SECRET || "",
  ).trim();

  if (secret) return secret;
  if (process.env.NODE_ENV === "production") {
    throw new Error("EXPERT_BOOKING_GUEST_SECRET or SESSION_SECRET is required for guest booking access.");
  }
  return "local-development-expert-booking-guest-secret";
}

export function createGuestBookingAccessToken(bookingId: string, email: string): string {
  return crypto
    .createHmac("sha256", signingSecret())
    .update(`${String(bookingId).trim()}:${normaliseEmail(email)}`)
    .digest("base64url");
}

export function verifyGuestBookingAccessToken(
  bookingId: string,
  email: string,
  suppliedToken: string,
): boolean {
  const expected = createGuestBookingAccessToken(bookingId, email);
  const supplied = String(suppliedToken || "").trim();
  if (!supplied) return false;

  const expectedBuffer = Buffer.from(expected);
  const suppliedBuffer = Buffer.from(supplied);
  return expectedBuffer.length === suppliedBuffer.length
    && crypto.timingSafeEqual(expectedBuffer, suppliedBuffer);
}

export function guestBookingManageUrl(
  baseUrl: string,
  bookingId: string,
  email: string,
): string {
  const root = String(baseUrl || "https://innovatorfoundervisaassistant.co.uk").replace(/\/$/, "");
  const token = createGuestBookingAccessToken(bookingId, email);
  const params = new URLSearchParams({ booking: bookingId, access: token, tab: "mine" });
  return `${root}/expert-booking?${params.toString()}`;
}
