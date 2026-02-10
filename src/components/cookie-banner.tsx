"use client";

import { useState, useCallback, useSyncExternalStore } from "react";
import Link from "next/link";
import { Cookie, Settings, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  type CookieConsent,
  getConsent,
  acceptAll,
  rejectAll,
  saveConsent,
} from "@/lib/cookie-consent";

function subscribe(callback: () => void) {
  window.addEventListener("cookie-consent-update", callback);
  return () => window.removeEventListener("cookie-consent-update", callback);
}

function getConsentSnapshot() {
  return getConsent() !== null;
}

function getServerConsentSnapshot() {
  return true; // Assume consent exists on server — don't flash the banner during SSR
}

export function CookieBanner() {
  const hasExistingConsent = useSyncExternalStore(
    subscribe,
    getConsentSnapshot,
    getServerConsentSnapshot,
  );

  const [showDetails, setShowDetails] = useState(false);
  const [functional, setFunctional] = useState(false);
  const [analytics, setAnalytics] = useState(false);

  const dispatchConsentUpdate = useCallback(() => {
    window.dispatchEvent(new Event("cookie-consent-update"));
  }, []);

  const handleAcceptAll = useCallback(() => {
    acceptAll();
    dispatchConsentUpdate();
  }, [dispatchConsentUpdate]);

  const handleRejectAll = useCallback(() => {
    rejectAll();
    dispatchConsentUpdate();
  }, [dispatchConsentUpdate]);

  const handleSaveCustom = useCallback(() => {
    const consent: CookieConsent = {
      essential: true,
      functional,
      analytics,
      timestamp: Date.now(),
    };
    saveConsent(consent);
    dispatchConsentUpdate();
  }, [functional, analytics, dispatchConsentUpdate]);

  // Banner hidden if consent already exists
  if (hasExistingConsent) return null;

  return (
    <div
      role="dialog"
      aria-label="Gestion des cookies"
      aria-modal="false"
      className="fixed bottom-0 left-0 right-0 z-[9999] p-4 md:p-6"
    >
      <div className="mx-auto max-w-2xl rounded-xl border border-border bg-card shadow-xl">
        <div className="p-5 md:p-6">
          {/* Header */}
          <div className="mb-4 flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Cookie className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">
                Nous respectons votre vie privée
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Nous utilisons des cookies pour améliorer votre expérience.
                Vous pouvez accepter, refuser ou personnaliser vos préférences.{" "}
                <Link
                  href="/cookies"
                  className="text-primary underline underline-offset-2 hover:text-primary/80"
                >
                  En savoir plus
                </Link>
              </p>
            </div>
          </div>

          {/* Detail panel */}
          {showDetails && (
            <div className="mb-4 space-y-3 rounded-lg border border-border bg-muted/50 p-4">
              {/* Essential — always on */}
              <label className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  <div>
                    <span className="text-sm font-medium text-foreground">
                      Essentiels
                    </span>
                    <p className="text-xs text-muted-foreground">
                      Navigation, authentification, panier
                    </p>
                  </div>
                </div>
                <div className="relative">
                  <input
                    type="checkbox"
                    checked
                    disabled
                    className="peer sr-only"
                  />
                  <div className="h-5 w-9 rounded-full bg-primary" />
                  <div className="absolute left-[18px] top-0.5 h-4 w-4 rounded-full bg-white transition-all" />
                </div>
              </label>

              {/* Functional */}
              <label className="flex cursor-pointer items-center justify-between">
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <span className="text-sm font-medium text-foreground">
                      Fonctionnels
                    </span>
                    <p className="text-xs text-muted-foreground">
                      Préférences, historique, personnalisation
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={functional}
                  onClick={() => setFunctional(!functional)}
                  className={`relative h-5 w-9 rounded-full transition-colors ${
                    functional ? "bg-primary" : "bg-border"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${
                      functional ? "left-[18px]" : "left-0.5"
                    }`}
                  />
                </button>
              </label>

              {/* Analytics */}
              <label className="flex cursor-pointer items-center justify-between">
                <div className="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4 text-muted-foreground"
                  >
                    <path d="M3 3v18h18" />
                    <path d="m19 9-5 5-4-4-3 3" />
                  </svg>
                  <div>
                    <span className="text-sm font-medium text-foreground">
                      Analytiques
                    </span>
                    <p className="text-xs text-muted-foreground">
                      Statistiques anonymisées d&apos;utilisation
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={analytics}
                  onClick={() => setAnalytics(!analytics)}
                  className={`relative h-5 w-9 rounded-full transition-colors ${
                    analytics ? "bg-primary" : "bg-border"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${
                      analytics ? "left-[18px]" : "left-0.5"
                    }`}
                  />
                </button>
              </label>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
              className="text-muted-foreground hover:text-foreground"
            >
              {showDetails ? "Masquer les détails" : "Personnaliser"}
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRejectAll}
              >
                Tout refuser
              </Button>
              {showDetails ? (
                <Button size="sm" onClick={handleSaveCustom}>
                  Enregistrer mes choix
                </Button>
              ) : (
                <Button size="sm" onClick={handleAcceptAll}>
                  Tout accepter
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
