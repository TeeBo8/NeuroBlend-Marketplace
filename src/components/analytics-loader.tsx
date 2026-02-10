"use client";

import { useEffect } from "react";
import { useSyncExternalStore } from "react";
import { hasConsent } from "@/lib/cookie-consent";
import { initAnalytics, shutdownAnalytics } from "@/lib/analytics";

/**
 * Initialises / tears down PostHog based on real-time cookie consent.
 * Renders nothing — this is a side-effect-only component.
 */

function subscribe(callback: () => void) {
  window.addEventListener("cookie-consent-update", callback);
  return () => window.removeEventListener("cookie-consent-update", callback);
}

function getSnapshot() {
  return hasConsent("analytics");
}

function getServerSnapshot() {
  return false;
}

export function AnalyticsLoader() {
  const analyticsAllowed = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  useEffect(() => {
    if (analyticsAllowed) {
      initAnalytics();
    } else {
      shutdownAnalytics();
    }
  }, [analyticsAllowed]);

  return null;
}
