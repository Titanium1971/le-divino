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
    <section className="relative overflow-hidden bg-brand-dark">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-8 px-6 py-16 md:flex-row md:gap-12 md:py-20">
        {/* Image */}
        {imageUrl && (
          <div className="relative aspect-[4/3] w-full max-w-sm shrink-0 md:w-80">
            {/* Shadow */}
            <div className="absolute -inset-1 rounded-md bg-brand-gold/10 blur-xl" />
            <div className="relative overflow-hidden rounded-md shadow-[0_8px_32px_rgba(0,0,0,0.5),0_2px_8px_rgba(0,0,0,0.3)]">
              <div className="relative aspect-[4/3]">
                <Image
                  src={imageUrl}
                  alt={title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 320px"
                  unoptimized
                />
              </div>
              {/* Glossy overlay */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/15 via-transparent to-brand-dark/20" />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent" />
              {/* Subtle border glow */}
              <div className="pointer-events-none absolute inset-0 rounded-md ring-1 ring-inset ring-white/10" />
            </div>
          </div>
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
  );
}
