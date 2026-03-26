import type { Metadata } from "next";
import Image from "next/image";
import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getUpcomingEvents, getEventImageUrl } from "@/lib/supabase/events";
import type { Locale, EventType } from "@/lib/types/database";
import { generatePageMetadata, breadcrumbJsonLd } from "@/lib/seo/metadata";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return generatePageMetadata(locale, "events");
}

const EVENT_TYPE_LABELS: Record<EventType, Record<string, string>> = {
  karaoke: { fr: "Karaoké", en: "Karaoke", it: "Karaoke", es: "Karaoke", de: "Karaoke" },
  concert: { fr: "Concert", en: "Concert", it: "Concerto", es: "Concierto", de: "Konzert" },
  private: { fr: "Soirée privée", en: "Private event", it: "Evento privato", es: "Evento privado", de: "Private Veranstaltung" },
  holiday: { fr: "Jour férié", en: "Holiday", it: "Festività", es: "Festivo", de: "Feiertag" },
  animation: { fr: "Animation", en: "Entertainment", it: "Animazione", es: "Animación", de: "Unterhaltung" },
  custom: { fr: "Événement", en: "Event", it: "Evento", es: "Evento", de: "Event" },
};

export default async function EventsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("events");

  const supabase = await createClient();
  const events = await getUpcomingEvents(supabase);

  const loc = locale as Locale;

  const breadcrumb = breadcrumbJsonLd(locale, "evenements", t("title"));

  // Group events by month
  const grouped: Record<string, typeof events> = {};
  for (const event of events) {
    const d = new Date(event.event_date + "T00:00:00");
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(event);
  }

  const dateLocale = locale === "fr" ? "fr-FR" : locale === "en" ? "en-GB" : locale === "it" ? "it-IT" : locale === "es" ? "es-ES" : "de-DE";

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />

      {/* Page header */}
      <section className="bg-brand-dark pt-32 pb-16">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h1 className="text-4xl font-extralight tracking-[0.3em] text-brand-cream uppercase md:text-5xl">
            {t("title")}
          </h1>
          <div className="mx-auto mt-6 h-px w-16 bg-brand-gold" />
          <p className="mt-6 text-sm font-light tracking-[0.15em] uppercase text-brand-gold/80">
            {t("subtitle")}
          </p>
        </div>
      </section>

      {/* Events list */}
      <section className="bg-brand-cream py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-6">
          {events.length === 0 ? (
            <p className="py-20 text-center text-base font-light text-brand-dark/60">
              {t("empty")}
            </p>
          ) : (
            <div className="space-y-16">
              {Object.entries(grouped).map(([monthKey, monthEvents]) => {
                const [year, month] = monthKey.split("-");
                const monthDate = new Date(Number(year), Number(month) - 1, 1);
                const monthLabel = monthDate.toLocaleDateString(dateLocale, { month: "long", year: "numeric" });

                return (
                  <div key={monthKey}>
                    {/* Month header */}
                    <h2 className="mb-8 text-xs font-normal tracking-[0.25em] uppercase text-brand-bordeaux/60">
                      <span className="capitalize">{monthLabel}</span>
                    </h2>

                    <div className="space-y-8">
                      {monthEvents.map((event) => {
                        const title = event.title[loc] || event.title.fr;
                        const description = event.description[loc] || event.description.fr;
                        const typeLabel = EVENT_TYPE_LABELS[event.event_type]?.[locale] ?? EVENT_TYPE_LABELS[event.event_type]?.fr ?? "";
                        const imageUrl = event.image_path ? getEventImageUrl(supabase, event.image_path) : null;

                        const dateFormatted = new Date(event.event_date + "T00:00:00").toLocaleDateString(dateLocale, {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                        });

                        return (
                          <article
                            key={event.id}
                            className="group overflow-hidden rounded-sm border border-brand-dark/10 bg-white transition-shadow hover:shadow-lg"
                          >
                            <div className="flex flex-col md:flex-row">
                              {/* Image */}
                              {imageUrl && (
                                <div className="relative aspect-[16/9] w-full shrink-0 md:aspect-auto md:w-72">
                                  <Image
                                    src={imageUrl}
                                    alt={`${title} — événement au restaurant Le Divino Agde`}
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                                    sizes="(max-width: 768px) 100vw, 288px"
                                  />
                                </div>
                              )}

                              {/* Content */}
                              <div className="flex flex-1 flex-col justify-center p-6 md:p-8">
                                {/* Type + date */}
                                <div className="flex flex-wrap items-center gap-3">
                                  <span className="inline-block rounded-full bg-brand-bordeaux/10 px-3 py-1 text-[10px] font-medium tracking-[0.15em] uppercase text-brand-bordeaux">
                                    {typeLabel}
                                  </span>
                                  <span className="text-xs font-light capitalize text-brand-dark/50">
                                    {dateFormatted}
                                  </span>
                                </div>

                                {/* Title */}
                                <h3 className="mt-3 text-xl font-light tracking-[0.05em] text-brand-dark md:text-2xl">
                                  {title}
                                </h3>

                                {/* Time */}
                                {event.event_time && (
                                  <p className="mt-2 text-sm font-light text-brand-dark/60">
                                    {event.event_time}
                                    {event.end_time ? ` — ${event.end_time}` : ""}
                                    {event.location ? ` · ${event.location}` : ""}
                                  </p>
                                )}

                                {/* Description */}
                                {description && (
                                  <p className="mt-4 text-sm font-light leading-relaxed text-brand-dark/70">
                                    {description}
                                  </p>
                                )}
                              </div>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
