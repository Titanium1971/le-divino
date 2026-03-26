"use client";

import { useState, useEffect, useCallback } from "react";
import { Link } from "@/i18n/navigation";

type CookieConsent = {
  essential: boolean;
  analytics: boolean;
  timestamp: string;
};

const STORAGE_KEY = "cookie_consent";

function getStoredConsent(): CookieConsent | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CookieConsent;
  } catch {
    return null;
  }
}

function saveConsent(consent: CookieConsent) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
  // Notify same-tab listeners (GoogleAnalytics component)
  window.dispatchEvent(new Event("cookie_consent_update"));
}

/** Remove GA4 cookies and prevent further tracking */
function removeGA4() {
  if (typeof window === "undefined") return;
  // Delete GA cookies
  const cookies = document.cookie.split(";");
  for (const cookie of cookies) {
    const name = cookie.split("=")[0].trim();
    if (name.startsWith("_ga")) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname}`;
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname}`;
    }
  }
}

export function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);

  useEffect(() => {
    const stored = getStoredConsent();
    if (stored) {
      setVisible(false);
    } else {
      // No consent yet — no script loaded at all
      setVisible(true);
    }
  }, []);

  const handleAcceptAll = useCallback(() => {
    const consent: CookieConsent = {
      essential: true,
      analytics: true,
      timestamp: new Date().toISOString(),
    };
    saveConsent(consent);
    setVisible(false);
  }, []);

  const handleRejectNonEssential = useCallback(() => {
    const consent: CookieConsent = {
      essential: true,
      analytics: false,
      timestamp: new Date().toISOString(),
    };
    saveConsent(consent);
    removeGA4();
    setVisible(false);
  }, []);

  const handleSaveCustom = useCallback(() => {
    const consent: CookieConsent = {
      essential: true,
      analytics: analyticsEnabled,
      timestamp: new Date().toISOString(),
    };
    saveConsent(consent);
    if (!analyticsEnabled) {
      removeGA4();
    }
    setVisible(false);
  }, [analyticsEnabled]);

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 p-4 md:p-6">
      <div className="mx-auto max-w-2xl rounded-xl border border-brand-cream/20 bg-[#09090B]/95 backdrop-blur-md p-6 shadow-2xl">
        {/* Main banner */}
        {!showDetails ? (
          <>
            <p className="text-sm font-light leading-relaxed text-brand-cream/80">
              Nous utilisons des cookies pour améliorer votre expérience et
              analyser le trafic du site.{" "}
              <Link
                href="/politique-cookies"
                className="text-brand-gold hover:underline"
              >
                En savoir plus
              </Link>
            </p>

            <div className="mt-4 flex flex-wrap gap-3">
              <button
                onClick={handleAcceptAll}
                className="rounded-lg bg-brand-gold px-5 py-2.5 text-sm font-medium text-brand-dark transition-colors hover:bg-brand-gold/90"
              >
                Accepter tout
              </button>
              <button
                onClick={handleRejectNonEssential}
                className="rounded-lg border border-brand-cream/30 px-5 py-2.5 text-sm font-medium text-brand-cream transition-colors hover:bg-brand-cream/10"
              >
                Refuser non-essentiels
              </button>
              <button
                onClick={() => setShowDetails(true)}
                className="rounded-lg px-5 py-2.5 text-sm font-medium text-brand-cream/60 transition-colors hover:text-brand-cream"
              >
                Personnaliser
              </button>
            </div>
          </>
        ) : (
          /* Detail / customization panel */
          <>
            <h3 className="text-sm font-normal tracking-[0.1em] text-brand-cream uppercase">
              Paramètres des cookies
            </h3>

            <div className="mt-4 space-y-4">
              {/* Essential — always on */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-normal text-brand-cream">
                    Cookies essentiels
                  </p>
                  <p className="text-xs text-brand-cream/50">
                    Nécessaires au fonctionnement du site. Toujours actifs.
                  </p>
                </div>
                <div className="h-6 w-11 rounded-full bg-brand-gold/50 relative cursor-not-allowed">
                  <div className="absolute right-0.5 top-0.5 h-5 w-5 rounded-full bg-brand-gold" />
                </div>
              </div>

              {/* Analytics — toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-normal text-brand-cream">
                    Cookies analytiques
                  </p>
                  <p className="text-xs text-brand-cream/50">
                    Google Analytics 4 — mesure d&apos;audience anonymisée.
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={analyticsEnabled}
                  onClick={() => setAnalyticsEnabled((v) => !v)}
                  className={`relative h-6 w-11 rounded-full transition-colors ${
                    analyticsEnabled
                      ? "bg-brand-gold/50"
                      : "bg-brand-cream/20"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-5 w-5 rounded-full transition-transform ${
                      analyticsEnabled
                        ? "right-0.5 bg-brand-gold"
                        : "left-0.5 bg-brand-cream/60"
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                onClick={handleSaveCustom}
                className="rounded-lg bg-brand-gold px-5 py-2.5 text-sm font-medium text-brand-dark transition-colors hover:bg-brand-gold/90"
              >
                Enregistrer mes choix
              </button>
              <button
                onClick={() => setShowDetails(false)}
                className="rounded-lg px-5 py-2.5 text-sm font-medium text-brand-cream/60 transition-colors hover:text-brand-cream"
              >
                Retour
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
