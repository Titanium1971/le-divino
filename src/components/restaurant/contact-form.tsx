"use client";

import { useTranslations } from "next-intl";

export function ContactForm() {
  const t = useTranslations("contact");

  return (
    <div>
      <h3 className="text-[11px] font-normal tracking-[0.2em] uppercase text-brand-gold">
        {t("form_title")}
      </h3>
      <form className="mt-6 space-y-5">
        <div>
          <label
            htmlFor="contact-name"
            className="block text-[11px] font-normal tracking-[0.15em] uppercase text-brand-dark/80"
          >
            {t("form_name")}
          </label>
          <input
            id="contact-name"
            name="name"
            required
            className="mt-2 w-full border-b border-brand-dark/30 bg-transparent px-0 py-3 text-sm font-light text-brand-dark focus:border-brand-gold focus:outline-none transition-colors"
          />
        </div>
        <div>
          <label
            htmlFor="contact-email"
            className="block text-[11px] font-normal tracking-[0.15em] uppercase text-brand-dark/80"
          >
            {t("form_email")}
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            required
            className="mt-2 w-full border-b border-brand-dark/30 bg-transparent px-0 py-3 text-sm font-light text-brand-dark focus:border-brand-gold focus:outline-none transition-colors"
          />
        </div>
        <div>
          <label
            htmlFor="contact-subject"
            className="block text-[11px] font-normal tracking-[0.15em] uppercase text-brand-dark/80"
          >
            {t("form_subject")}
          </label>
          <input
            id="contact-subject"
            name="subject"
            required
            className="mt-2 w-full border-b border-brand-dark/30 bg-transparent px-0 py-3 text-sm font-light text-brand-dark focus:border-brand-gold focus:outline-none transition-colors"
          />
        </div>
        <div>
          <label
            htmlFor="contact-message"
            className="block text-[11px] font-normal tracking-[0.15em] uppercase text-brand-dark/80"
          >
            {t("form_message")}
          </label>
          <textarea
            id="contact-message"
            name="message"
            rows={4}
            required
            className="mt-2 w-full border-b border-brand-dark/30 bg-transparent px-0 py-3 text-sm font-light text-brand-dark focus:border-brand-gold focus:outline-none transition-colors resize-none"
          />
        </div>
        <div className="pt-2">
          <button
            type="submit"
            className="border border-brand-bordeaux px-10 py-3.5 text-xs font-normal tracking-[0.2em] uppercase text-brand-bordeaux transition-all duration-300 hover:bg-brand-bordeaux hover:text-brand-cream"
          >
            {t("form_submit")}
          </button>
        </div>
      </form>
    </div>
  );
}
