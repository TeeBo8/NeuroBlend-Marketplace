// Cookie consent management — RGPD/CNIL compliant
// Consent stored in cookie (SSR) + localStorage (client) for 13 months max (CNIL)

export type CookieCategory = "essential" | "functional" | "analytics";

export interface CookieConsent {
  essential: true; // Always true — required
  functional: boolean;
  analytics: boolean;
  timestamp: number; // When consent was given
}

const CONSENT_KEY = "neuroblend-cookie-consent";
const CONSENT_MAX_AGE_DAYS = 395; // ~13 months (CNIL recommendation)
const CONSENT_MAX_AGE_MS = CONSENT_MAX_AGE_DAYS * 24 * 60 * 60 * 1000;

/** Read consent from cookie (works in both SSR and client) */
function readConsentFromCookie(): CookieConsent | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${CONSENT_KEY}=`));
  if (!match) return null;
  try {
    const value = decodeURIComponent(match.split("=")[1]);
    return JSON.parse(value) as CookieConsent;
  } catch {
    return null;
  }
}

/** Read consent from localStorage (client only, faster) */
function readConsentFromStorage(): CookieConsent | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CookieConsent;
  } catch {
    return null;
  }
}

/** Get current consent, checking expiry */
export function getConsent(): CookieConsent | null {
  const consent = readConsentFromStorage() ?? readConsentFromCookie();
  if (!consent) return null;
  // Check if consent has expired (13 months)
  if (Date.now() - consent.timestamp > CONSENT_MAX_AGE_MS) {
    clearConsent();
    return null;
  }
  return consent;
}

/** Save consent to both cookie and localStorage */
export function saveConsent(consent: CookieConsent): void {
  const data = { ...consent, timestamp: Date.now() };
  const json = JSON.stringify(data);

  // Save to localStorage
  try {
    localStorage.setItem(CONSENT_KEY, json);
  } catch {
    // localStorage may be unavailable
  }

  // Save to cookie (accessible server-side)
  const maxAge = CONSENT_MAX_AGE_DAYS * 24 * 60 * 60;
  document.cookie = `${CONSENT_KEY}=${encodeURIComponent(json)}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

/** Clear all consent data */
function clearConsent(): void {
  try {
    localStorage.removeItem(CONSENT_KEY);
  } catch {
    // ignore
  }
  document.cookie = `${CONSENT_KEY}=; path=/; max-age=0`;
}

/** Check if a specific category is consented */
export function hasConsent(category: CookieCategory): boolean {
  if (category === "essential") return true;
  const consent = getConsent();
  if (!consent) return false;
  return consent[category];
}

/** Accept all cookies */
export function acceptAll(): CookieConsent {
  const consent: CookieConsent = {
    essential: true,
    functional: true,
    analytics: true,
    timestamp: Date.now(),
  };
  saveConsent(consent);
  return consent;
}

/** Reject all optional cookies */
export function rejectAll(): CookieConsent {
  const consent: CookieConsent = {
    essential: true,
    functional: false,
    analytics: false,
    timestamp: Date.now(),
  };
  saveConsent(consent);
  return consent;
}
