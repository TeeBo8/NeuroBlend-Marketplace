import posthog from "posthog-js";
import { hasConsent } from "./cookie-consent";

// ─── Init ────────────────────────────────────────────────

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST =
  process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://eu.i.posthog.com";

let initialized = false;

/** Initialise PostHog (call once, client-side only). */
export function initAnalytics() {
  if (
    initialized ||
    typeof window === "undefined" ||
    !POSTHOG_KEY ||
    !hasConsent("analytics")
  )
    return;

  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    capture_pageview: true,
    capture_pageleave: true,
    autocapture: true,
    persistence: "localStorage+cookie",
    // RGPD: respect DNT and don't store personal data
    respect_dnt: true,
    // Mask all text and inputs by default in session recordings
    session_recording: {
      maskAllInputs: true,
      maskTextSelector: "*",
    },
  });

  initialized = true;
}

/** Shut down PostHog (when consent is revoked). */
export function shutdownAnalytics() {
  if (!initialized || typeof window === "undefined") return;
  posthog.opt_out_capturing();
  posthog.reset();
  initialized = false;
}

/** Returns true if PostHog is initialised and capturing. */
function isAnalyticsReady(): boolean {
  return initialized && typeof window !== "undefined";
}

// ─── Helpers ─────────────────────────────────────────────

function capture(event: string, properties?: Record<string, unknown>) {
  if (!isAnalyticsReady()) return;
  posthog.capture(event, properties);
}

// ─── Custom Events ───────────────────────────────────────

/** User successfully signed up. */
export function trackSignup() {
  capture("user_signed_up");
}

/** Product added to cart. */
export function trackAddToCart(product: {
  id: string;
  name: string;
  price: number;
  category?: string;
}) {
  capture("product_added_to_cart", {
    product_id: product.id,
    product_name: product.name,
    price: product.price,
    category: product.category,
  });
}

/** CTA button clicked (hero, subscription, etc.) */
export function trackCtaClick(cta: {
  label: string;
  location: string;
  href?: string;
}) {
  capture("cta_clicked", {
    cta_label: cta.label,
    cta_location: cta.location,
    cta_href: cta.href,
  });
}

/** Chatbot opened or closed. */
export function trackChatToggle(isOpen: boolean) {
  capture(isOpen ? "chat_opened" : "chat_closed");
}

/** Message sent in the chatbot. */
export function trackChatMessage() {
  capture("chat_message_sent");
}

/** Quiz started (first question displayed). */
export function trackQuizStart() {
  capture("quiz_started");
}

/** Quiz question answered. */
export function trackQuizAnswer(questionIndex: number, answerLabel: string) {
  capture("quiz_answer", {
    question_index: questionIndex + 1,
    answer_label: answerLabel,
  });
}

/** Quiz completed — profile determined. */
export function trackQuizComplete(profile: string) {
  capture("quiz_completed", { profile });
}

/** Quiz restarted. */
export function trackQuizRestart() {
  capture("quiz_restarted");
}
