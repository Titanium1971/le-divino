"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";

const DAY_NAMES_SHORT: Record<string, string[]> = {
  fr: ["dim", "lun", "mar", "mer", "jeu", "ven", "sam"],
  en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  it: ["dom", "lun", "mar", "mer", "gio", "ven", "sab"],
  es: ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"],
  de: ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"],
};

const LUNCH_SLOTS = ["12:00", "12:30", "13:00", "13:30"];
const DINNER_SLOTS = ["19:00", "19:30", "20:00", "20:30", "21:00", "21:30"];

// JS getDay(): 0=Sunday, 1=Monday, ...
// Sunday closes at 15:30 → no dinner slots
const SUNDAY_JS_DAY = 0;

function getNext7Days() {
  const days: Date[] = [];
  const now = new Date();
  for (let i = 0; i < 10 && days.length < 7; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    // All days are open now (no closed day)
    days.push(d);
  }
  return days;
}

function formatDateParam(d: Date) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function ReservationWidget({ locale }: { locale: string }) {
  const t = useTranslations("widget");
  const router = useRouter();
  const [open, setOpen] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const [days, setDays] = useState<Date[]>([]);
  useEffect(() => {
    setDays(getNext7Days());
  }, []);
  const dayNames = DAY_NAMES_SHORT[locale] ?? DAY_NAMES_SHORT.fr;

  // Sunday: no dinner slots (closes at 15:30)
  const isSunday = selectedDate?.getDay() === SUNDAY_JS_DAY;

  function handleBook() {
    if (!selectedDate || !selectedTime) return;
    const dateStr = formatDateParam(selectedDate);
    router.push(`/reservation?date=${dateStr}&time=${selectedTime}`);
  }

  // Collapsed state — just a small button
  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="reservation-widget-btn fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full md:h-12 md:w-12"
        aria-label={t("title")}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          className="h-6 w-6 text-brand-cream"
        >
          <path d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z" />
        </svg>
      </button>
    );
  }

  return (
    <div className="reservation-widget fixed bottom-6 right-6 z-40 w-[340px] max-md:inset-x-0 max-md:bottom-0 max-md:right-0 max-md:w-full">
      <div className="reservation-widget-card relative overflow-hidden rounded-2xl max-md:rounded-none max-md:rounded-t-2xl p-6">
        {/* Shimmer overlay */}
        <div className="reservation-widget-shimmer pointer-events-none absolute inset-0" />

        {/* Close button */}
        <button
          onClick={() => setOpen(false)}
          className="absolute top-4 right-4 flex h-7 w-7 items-center justify-center rounded-full text-brand-cream/60 transition-colors hover:text-brand-cream"
          aria-label="Fermer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-4 w-4">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        {/* Title */}
        <h3 className="text-sm font-medium tracking-[0.15em] uppercase text-brand-cream">
          {t("title")}
        </h3>

        {/* Date selector */}
        <div className="mt-4">
          <p className="text-[10px] font-normal tracking-[0.1em] uppercase text-brand-gold">
            {t("date")}
          </p>
          <div className="mt-2 flex gap-1.5 overflow-x-auto">
            {days.map((d) => {
              const isSelected = selectedDate?.toDateString() === d.toDateString();
              return (
                <button
                  key={d.toISOString()}
                  onClick={() => {
                    setSelectedDate(d);
                    setSelectedTime(null);
                  }}
                  className={`flex shrink-0 flex-col items-center rounded-lg px-2.5 py-2 transition-all duration-200 ${
                    isSelected
                      ? "bg-brand-gold/20 text-brand-gold"
                      : "text-brand-cream/70 hover:bg-brand-cream/5"
                  }`}
                >
                  <span className="text-[10px] font-light uppercase">
                    {dayNames[d.getDay()]}
                  </span>
                  <span className="mt-0.5 text-sm font-normal">{d.getDate()}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Time slots */}
        {selectedDate && (
          <div className="mt-4 animate-widget-fade-in">
            {/* Lunch */}
            <p className="text-[10px] font-normal tracking-[0.1em] uppercase text-brand-gold">
              {t("lunch")}
            </p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {LUNCH_SLOTS.map((slot) => (
                <button
                  key={slot}
                  onClick={() => setSelectedTime(slot)}
                  className={`rounded-md px-3 py-1.5 text-xs font-light transition-all duration-200 ${
                    selectedTime === slot
                      ? "bg-brand-gold/20 text-brand-gold"
                      : "text-brand-cream/70 hover:bg-brand-cream/5"
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>

            {/* Dinner — hidden on Sunday (closes at 15:30) */}
            {!isSunday && (
              <>
                <p className="mt-3 text-[10px] font-normal tracking-[0.1em] uppercase text-brand-gold">
                  {t("dinner")}
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {DINNER_SLOTS.map((slot) => (
                    <button
                      key={slot}
                      onClick={() => setSelectedTime(slot)}
                      className={`rounded-md px-3 py-1.5 text-xs font-light transition-all duration-200 ${
                        selectedTime === slot
                          ? "bg-brand-gold/20 text-brand-gold"
                          : "text-brand-cream/70 hover:bg-brand-cream/5"
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </>
            )}

            {isSunday && (
              <p className="mt-3 text-[10px] font-light text-brand-cream/50">
                Dimanche : fermeture à 15h30, pas de service le soir.
              </p>
            )}
          </div>
        )}

        {/* CTA */}
        <button
          onClick={handleBook}
          disabled={!selectedDate || !selectedTime}
          className="mt-5 w-full rounded-lg bg-brand-bordeaux py-3 text-xs font-medium tracking-[0.15em] uppercase text-brand-cream transition-all duration-300 hover:bg-brand-bordeaux/90 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {t("cta")}
        </button>
      </div>
    </div>
  );
}
