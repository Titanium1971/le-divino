"use client";

import { useState } from "react";

type Props = {
  onSubmit: (email: string, name: string) => void;
  locale: string;
};

const TEXTS: Record<string, { title: string; desc: string; namePlaceholder: string; emailPlaceholder: string; submit: string; gdpr: string }> = {
  fr: {
    title: "Bienvenue au Divino",
    desc: "Pour personnaliser votre expérience, indiquez votre prénom et votre email.",
    namePlaceholder: "Votre prénom",
    emailPlaceholder: "votre@email.com",
    submit: "Continuer",
    gdpr: "Vos données sont utilisées uniquement pour personnaliser votre expérience. Vous pouvez demander leur suppression à tout moment.",
  },
  en: {
    title: "Welcome to Le Divino",
    desc: "To personalize your experience, enter your first name and email.",
    namePlaceholder: "Your first name",
    emailPlaceholder: "your@email.com",
    submit: "Continue",
    gdpr: "Your data is used only to personalize your experience. You can request deletion at any time.",
  },
  it: {
    title: "Benvenuti al Divino",
    desc: "Per personalizzare la tua esperienza, inserisci il tuo nome e la tua email.",
    namePlaceholder: "Il tuo nome",
    emailPlaceholder: "tua@email.com",
    submit: "Continua",
    gdpr: "I tuoi dati sono utilizzati solo per personalizzare la tua esperienza. Puoi richiederne la cancellazione in qualsiasi momento.",
  },
  es: {
    title: "Bienvenido al Divino",
    desc: "Para personalizar su experiencia, ingrese su nombre y email.",
    namePlaceholder: "Su nombre",
    emailPlaceholder: "su@email.com",
    submit: "Continuar",
    gdpr: "Sus datos se utilizan únicamente para personalizar su experiencia. Puede solicitar su eliminación en cualquier momento.",
  },
  de: {
    title: "Willkommen im Divino",
    desc: "Um Ihr Erlebnis zu personalisieren, geben Sie Ihren Vornamen und Ihre E-Mail ein.",
    namePlaceholder: "Ihr Vorname",
    emailPlaceholder: "ihre@email.com",
    submit: "Weiter",
    gdpr: "Ihre Daten werden ausschließlich zur Personalisierung Ihres Erlebnisses verwendet. Sie können jederzeit die Löschung beantragen.",
  },
};

export function EmailPrompt({ onSubmit, locale }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const t = TEXTS[locale] || TEXTS.fr;

  const isValid = name.trim().length >= 2 && email.includes("@");

  function handleSubmit() {
    if (isValid) onSubmit(email.trim(), name.trim());
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-8">
      <div className="text-center">
        <h3 className="text-lg font-medium text-brand-dark">{t.title}</h3>
        <p className="mt-2 text-sm text-brand-dark/60 leading-relaxed">{t.desc}</p>
      </div>

      <div className="mt-6 w-full max-w-xs space-y-3">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t.namePlaceholder}
          className="w-full rounded-lg border border-brand-gold/30 bg-white px-4 py-2.5 text-sm text-brand-dark placeholder:text-brand-dark/40 outline-none focus:border-brand-gold/60"
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder={t.emailPlaceholder}
          className="w-full rounded-lg border border-brand-gold/30 bg-white px-4 py-2.5 text-sm text-brand-dark placeholder:text-brand-dark/40 outline-none focus:border-brand-gold/60"
        />
        <button
          onClick={handleSubmit}
          disabled={!isValid}
          className="w-full rounded-lg bg-brand-bordeaux py-2.5 text-sm font-medium text-brand-cream transition-colors hover:bg-brand-bordeaux/90 disabled:opacity-30"
        >
          {t.submit}
        </button>
      </div>

      <p className="mt-6 max-w-xs text-center text-[10px] leading-relaxed text-brand-dark/40">
        {t.gdpr}
      </p>
    </div>
  );
}
