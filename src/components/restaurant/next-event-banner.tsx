"use client";

import { useState } from "react";
import Image from "next/image";
import type { Event, Locale } from "@/lib/types/database";
import { Link } from "@/i18n/navigation";

type Props = {
  event: Event;
  imageUrl: string | null;
  locale: string;
};

const EVENT_TYPE_LABELS: Record<string, Record<string, string>> = {
  karaoke: { fr: "Karaoké", en: "Karaoke", it: "Karaoke", es: "Karaoke", de: "Karaoke" },
  concert: { fr: "Concert", en: "Concert", it: "Concerto", es: "Concierto", de: "Konzert" },
  private: { fr: "Soirée privée", en: "Private event", it: "Evento privato", es: "Evento privado", de: "Private Veranstaltung" },
  holiday: { fr: "Jour férié", en: "Holiday", it: "Festività", es: "Festivo", de: "Feiertag" },
  animation: { fr: "Animation", en: "Entertainment", it: "Animazione", es: "Animación", de: "Unterhaltung" },
  custom: { fr: "Événement", en: "Event", it: "Evento", es: "Evento", de: "Event" },
};

export function NextEventBanner({ event, imageUrl, locale }: Props) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const loc = locale as Locale;

  const title = event.title[loc] || event.title.fr;
  const description = event.description[loc] || event.description.fr;
  const typeLabel = EVENT_TYPE_LABELS[event.event_type]?.[locale] ?? EVENT_TYPE_LABELS[event.event_type]?.fr ?? "";

  const dateFormatted = new Date(event.event_date + "T00:00:00").toLocaleDateString(
    locale === "fr" ? "fr-FR" : locale === "en" ? "en-GB" : locale === "it" ? "it-IT" : locale === "es" ? "es-ES" : "de-DE",
    { weekday: "long", day: "numeric", month: "long" },
  );

  const ctaLabel: Record<string, string> = {
    fr: "Voir tous les événements",
    en: "See all events",
    it: "Vedi tutti gli eventi",
    es: "Ver todos los eventos",
    de: "Alle Events ansehen",
  };

  return (
    <>
      <section className="relative overflow-hidden bg-brand-dark">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-8 px-6 py-16 md:flex-row md:gap-12 md:py-20">
          {/* Image */}
          {imageUrl && (
            <button
              type="button"
              onClick={() => setLightboxOpen(true)}
              className="group relative aspect-[4/3] w-full max-w-sm shrink-0 cursor-zoom-in md:w-80"
              aria-label="Agrandir l'image"
            >
              {/* Gold glow behind */}
              <div className="absolute -inset-3 rounded-lg bg-brand-gold/15 blur-2xl transition-all duration-500 group-hover:bg-brand-gold/25" />
              {/* Main image container */}
              <div className="relative overflow-hidden rounded-lg shadow-[0_10px_40px_rgba(0,0,0,0.6),0_4px_12px_rgba(0,0,0,0.4)] transition-transform duration-500 group-hover:scale-[1.02]">
                <div className="relative aspect-[4/3]">
                  <Image
                    src={imageUrl}
                    alt={title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 320px"
                  />
                </div>
                {/* Glossy shine — diagonal highlight */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/20 via-white/5 to-transparent" />
                {/* Bottom vignette */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-brand-dark/30 via-transparent to-transparent" />
                {/* Inner border glow */}
                <div className="pointer-events-none absolute inset-0 rounded-lg ring-1 ring-inset ring-white/15" />
                {/* Gold accent border bottom */}
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-brand-gold/50 to-transparent" />
              </div>
            </button>
          )}

          {/* Content */}
          <div className={`flex-1 text-center ${imageUrl ? "md:text-left" : ""}`}>
            {/* Type badge */}
            <span className="inline-block text-[11px] font-normal tracking-[0.25em] uppercase text-brand-gold">
              {typeLabel}
            </span>

            <h2 className="mt-3 text-2xl font-extralight tracking-[0.1em] text-brand-cream md:text-3xl">
              {title}
            </h2>

            {/* Date & time */}
            <p className="mt-3 text-sm font-light tracking-[0.05em] text-brand-cream/70">
              <span className="capitalize">{dateFormatted}</span>
              {event.event_time && (
                <span> — {event.event_time}{event.end_time ? ` / ${event.end_time}` : ""}</span>
              )}
            </p>

            {/* Description */}
            {description && (
              <p className="mx-auto mt-5 max-w-xl text-sm font-light leading-relaxed text-brand-cream/80 md:mx-0">
                {description}
              </p>
            )}

            {/* CTA */}
            <div className="mt-8">
              <Link
                href="/evenements"
                className="inline-block border border-brand-gold/60 px-8 py-3 text-xs font-normal tracking-[0.2em] uppercase text-brand-gold transition-all duration-300 hover:border-brand-gold hover:bg-brand-gold/10"
              >
                {ctaLabel[locale] || ctaLabel.fr}
              </Link>
            </div>
          </div>
        </div>

        {/* Top & bottom subtle separator */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-gold/30 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-brand-gold/30 to-transparent" />
      </section>

      {/* Lightbox */}
      {lightboxOpen && imageUrl && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={() => setLightboxOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label={title}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            className="absolute right-6 top-6 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
            aria-label="Fermer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Image */}
          <div
            className="relative max-h-[85vh] max-w-[90vw] overflow-hidden rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={imageUrl}
              alt={title}
              width={1200}
              height={900}
              className="h-auto max-h-[85vh] w-auto object-contain"
            />
            {/* Glossy overlay on lightbox too */}
            <div className="pointer-events-none absolute inset-0 rounded-lg ring-1 ring-inset ring-white/10" />
          </div>

          {/* Title below image */}
          <div className="absolute bottom-8 left-0 right-0 text-center">
            <p className="text-sm font-light tracking-[0.15em] uppercase text-white/70">
              {typeLabel} — <span className="capitalize">{dateFormatted}</span>
            </p>
            <p className="mt-1 text-lg font-extralight tracking-[0.1em] text-white">
              {title}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
