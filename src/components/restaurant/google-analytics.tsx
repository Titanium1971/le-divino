"use client";

import { useEffect, useCallback, useRef } from "react";

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

function loadGA4() {
  if (!GA_ID || document.getElementById("ga4-script")) return;

  // Init dataLayer and gtag function
  const w = window as unknown as Record<string, unknown>;
  w.dataLayer = (w.dataLayer as unknown[]) || [];
  function gtag(...args: unknown[]) {
    (w.dataLayer as unknown[]).push(args);
  }
  gtag("js", new Date());
  gtag("config", GA_ID, { anonymize_ip: true });

  // Load gtag.js script
  const script = document.createElement("script");
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  script.async = true;
  document.head.appendChild(script);
}

/**
 * Google Analytics 4 — CNIL compliant.
 * Injects GA4 scripts only after explicit cookie consent.
 */
export function GoogleAnalytics() {
  const loaded = useRef(false);

  const maybeLoad = useCallback(() => {
    if (loaded.current) return;
    const consent = getStoredConsent();
    if (consent?.analytics) {
      loaded.current = true;
      loadGA4();
    }
  }, []);

  useEffect(() => {
    maybeLoad();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) maybeLoad();
    };
    const handleConsentUpdate = () => maybeLoad();

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("cookie_consent_update", handleConsentUpdate);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("cookie_consent_update", handleConsentUpdate);
    };
  }, [maybeLoad]);

  return null;
}
