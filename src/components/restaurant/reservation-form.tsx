"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

export function ReservationForm() {
  const t = useTranslations("reservation");
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData);

    await fetch("/api/reservation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto mb-6 h-px w-16 bg-brand-gold" />
        <p className="text-base font-light text-brand-dark/90">{t("success")}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name */}
      <div>
        <label
          htmlFor="name"
          className="block text-[11px] font-normal tracking-[0.15em] uppercase text-brand-dark/80"
        >
          {t("form.name")}
        </label>
        <input
          id="name"
          name="name"
          required
          className="mt-2 w-full border-b border-brand-dark/30 bg-transparent px-0 py-3 text-sm font-light text-brand-dark placeholder:text-brand-dark/30 focus:border-brand-gold focus:outline-none transition-colors"
        />
      </div>

      {/* Email + Phone */}
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label
            htmlFor="email"
            className="block text-[11px] font-normal tracking-[0.15em] uppercase text-brand-dark/80"
          >
            {t("form.email")}
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="mt-2 w-full border-b border-brand-dark/30 bg-transparent px-0 py-3 text-sm font-light text-brand-dark placeholder:text-brand-dark/30 focus:border-brand-gold focus:outline-none transition-colors"
          />
        </div>
        <div>
          <label
            htmlFor="phone"
            className="block text-[11px] font-normal tracking-[0.15em] uppercase text-brand-dark/80"
          >
            {t("form.phone")}
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            required
            className="mt-2 w-full border-b border-brand-dark/30 bg-transparent px-0 py-3 text-sm font-light text-brand-dark placeholder:text-brand-dark/30 focus:border-brand-gold focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* Date + Time + Guests */}
      <div className="grid gap-6 sm:grid-cols-3">
        <div>
          <label
            htmlFor="date"
            className="block text-[11px] font-normal tracking-[0.15em] uppercase text-brand-dark/80"
          >
            {t("form.date")}
          </label>
          <input
            id="date"
            name="date"
            type="date"
            required
            className="mt-2 w-full border-b border-brand-dark/30 bg-transparent px-0 py-3 text-sm font-light text-brand-dark focus:border-brand-gold focus:outline-none transition-colors"
          />
        </div>
        <div>
          <label
            htmlFor="time"
            className="block text-[11px] font-normal tracking-[0.15em] uppercase text-brand-dark/80"
          >
            {t("form.time")}
          </label>
          <select
            id="time"
            name="time"
            required
            defaultValue=""
            className="mt-2 w-full border-b border-brand-dark/30 bg-transparent px-0 py-3 text-sm font-light text-brand-dark focus:border-brand-gold focus:outline-none transition-colors"
          >
            <option value="" disabled>{t("form.selectSlot")}</option>
            <optgroup label={t("form.lunch")}>
              <option value="12:00">12:00</option>
              <option value="12:30">12:30</option>
              <option value="13:00">13:00</option>
              <option value="13:30">13:30</option>
            </optgroup>
            <optgroup label={t("form.dinner")}>
              <option value="19:00">19:00</option>
              <option value="19:30">19:30</option>
              <option value="20:00">20:00</option>
              <option value="20:30">20:30</option>
              <option value="21:00">21:00</option>
              <option value="21:30">21:30</option>
            </optgroup>
          </select>
        </div>
        <div>
          <label
            htmlFor="guests"
            className="block text-[11px] font-normal tracking-[0.15em] uppercase text-brand-dark/80"
          >
            {t("form.guests")}
          </label>
          <input
            id="guests"
            name="guests"
            type="number"
            min={1}
            max={12}
            required
            className="mt-2 w-full border-b border-brand-dark/30 bg-transparent px-0 py-3 text-sm font-light text-brand-dark focus:border-brand-gold focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* Message */}
      <div>
        <label
          htmlFor="message"
          className="block text-[11px] font-normal tracking-[0.15em] uppercase text-brand-dark/80"
        >
          {t("form.message")}
        </label>
        <textarea
          id="message"
          name="message"
          rows={3}
          className="mt-2 w-full border-b border-brand-dark/30 bg-transparent px-0 py-3 text-sm font-light text-brand-dark placeholder:text-brand-dark/30 focus:border-brand-gold focus:outline-none transition-colors resize-none"
        />
      </div>

      {/* Submit */}
      <div className="pt-4 text-center">
        <button
          type="submit"
          className="border border-brand-bordeaux px-12 py-4 text-xs font-normal tracking-[0.2em] uppercase text-brand-bordeaux transition-all duration-300 hover:bg-brand-bordeaux hover:text-brand-cream"
        >
          {t("form.submit")}
        </button>
      </div>
      <p className="mt-4 text-[11px] font-light leading-relaxed text-brand-dark/50 text-center">
        Les données saisies sont utilisées pour gérer votre réservation,
        conformément à notre{" "}
        <Link
          href="/politique-confidentialite"
          className="underline hover:text-brand-dark/80 transition-colors"
        >
          Politique de confidentialité
        </Link>
        . Durée de conservation : 12 mois. Pour exercer vos droits :{" "}
        <a
          href="mailto:contact@ledivino-agde.fr"
          className="underline hover:text-brand-dark/80 transition-colors"
        >
          contact@ledivino-agde.fr
        </a>
      </p>
    </form>
  );
}
