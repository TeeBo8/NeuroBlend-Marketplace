"use client";

import { useSyncExternalStore } from "react";
import Script from "next/script";
import { hasConsent } from "@/lib/cookie-consent";

/**
 * Conditionally loads analytics scripts based on user consent.
 *
 * Replace the GA_MEASUREMENT_ID with your actual Google Analytics ID
 * when you're ready to enable analytics. Until then, this component
 * is a no-op but the consent gating logic is fully functional.
 */

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

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

  // Don't load anything if no GA ID or no consent
  if (!GA_MEASUREMENT_ID || !analyticsAllowed) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}', {
            anonymize_ip: true,
            cookie_flags: 'SameSite=Lax;Secure'
          });
        `}
      </Script>
    </>
  );
}
