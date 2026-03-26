"use client";

import { useEffect, useCallback } from "react";
import Script from "next/script";
import { useState } from "react";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
const STORAGE_KEY = "cookie_consent";

type CookieConsent = {
  essential: boolean;
  analytics: boolean;
  timestamp: string;
};

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

// Extend window for gtag dataLayer
declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Google Analytics 4 component — CNIL compliant.
 *
 * Only loads the gtag.js script AFTER the user has explicitly granted
 * analytics consent via the cookie banner. The consent status is read
 * from localStorage under the key "cookie_consent".
 *
 * This component also listens for localStorage changes (storage event)
 * so that if the user updates their consent preferences in another tab
 * or the cookie banner updates consent in the same page, GA4 reacts.
 *
 * Required env variable: NEXT_PUBLIC_GA_ID (e.g. "G-XXXXXXXXXX")
 */
export function GoogleAnalytics() {
  const [consentGranted, setConsentGranted] = useState(false);

  const checkConsent = useCallback(() => {
    const consent = getStoredConsent();
    return consent?.analytics === true;
  }, []);

  useEffect(() => {
    // Check initial consent state
    setConsentGranted(checkConsent());

    // Listen for storage changes from the cookie banner (same tab)
    // The cookie banner writes to localStorage, so we use a custom event
    // as well as the native storage event (cross-tab).
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        setConsentGranted(checkConsent());
      }
    };

    // Listen for custom event dispatched by the cookie banner (same tab)
    const handleConsentUpdate = () => {
      setConsentGranted(checkConsent());
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("cookie_consent_update", handleConsentUpdate);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("cookie_consent_update", handleConsentUpdate);
    };
  }, [checkConsent]);

  // Nothing to render if no GA ID or no consent
  if (!GA_ID || !consentGranted) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script
        id="ga4-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}', { anonymize_ip: true });
          `,
        }}
      />
    </>
  );
}
