"use client";

import { useState } from "react";

type Props = {
  onSubmit: (email: string, name: string) => void;
  locale: string;
};

const TEXTS: Record<string, { title: string; desc: string; firstNamePlaceholder: string; lastNamePlaceholder: string; emailPlaceholder: string; submit: string; gdpr: string }> = {
  fr: {
    title: "Bienvenue au Divino",
    desc: "Pour personnaliser votre expérience, merci de renseigner vos informations.",
    firstNamePlaceholder: "Prénom",
    lastNamePlaceholder: "Nom",
    emailPlaceholder: "votre@email.com",
    submit: "Continuer",
    gdpr: "Vos données sont utilisées uniquement pour personnaliser votre expérience. Vous pouvez demander leur suppression à tout moment.",
  },
  en: {
    title: "Welcome to Le Divino",
    desc: "To personalize your experience, please enter your details.",
    firstNamePlaceholder: "First name",
    lastNamePlaceholder: "Last name",
    emailPlaceholder: "your@email.com",
    submit: "Continue",
    gdpr: "Your data is used only to personalize your experience. You can request deletion at any time.",
  },
  it: {
    title: "Benvenuti al Divino",
    desc: "Per personalizzare la tua esperienza, inserisci le tue informazioni.",
    firstNamePlaceholder: "Nome",
    lastNamePlaceholder: "Cognome",
    emailPlaceholder: "tua@email.com",
    submit: "Continua",
    gdpr: "I tuoi dati sono utilizzati solo per personalizzare la tua esperienza. Puoi richiederne la cancellazione in qualsiasi momento.",
  },
  es: {
    title: "Bienvenido al Divino",
    desc: "Para personalizar su experiencia, ingrese sus datos.",
    firstNamePlaceholder: "Nombre",
    lastNamePlaceholder: "Apellido",
    emailPlaceholder: "su@email.com",
    submit: "Continuar",
    gdpr: "Sus datos se utilizan únicamente para personalizar su experiencia. Puede solicitar su eliminación en cualquier momento.",
  },
  de: {
    title: "Willkommen im Divino",
    desc: "Um Ihr Erlebnis zu personalisieren, geben Sie bitte Ihre Daten ein.",
    firstNamePlaceholder: "Vorname",
    lastNamePlaceholder: "Nachname",
    emailPlaceholder: "ihre@email.com",
    submit: "Weiter",
    gdpr: "Ihre Daten werden ausschließlich zur Personalisierung Ihres Erlebnisses verwendet. Sie können jederzeit die Löschung beantragen.",
  },
};

export function EmailPrompt({ onSubmit, locale }: Props) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const t = TEXTS[locale] || TEXTS.fr;

  const isValid = firstName.trim().length >= 2 && lastName.trim().length >= 2 && email.includes("@");
  const fullName = `${firstName.trim()} ${lastName.trim()}`;

  function handleSubmit() {
    if (isValid) onSubmit(email.trim(), fullName);
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-8">
      <div className="text-center">
        <h3 className="text-lg font-medium text-brand-dark">{t.title}</h3>
        <p className="mt-2 text-sm text-brand-dark/60 leading-relaxed">{t.desc}</p>
      </div>

      <div className="mt-6 w-full max-w-xs space-y-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder={t.firstNamePlaceholder}
            className="w-1/2 rounded-lg border border-brand-gold/30 bg-white px-4 py-2.5 text-sm text-brand-dark placeholder:text-brand-dark/40 outline-none focus:border-brand-gold/60"
          />
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder={t.lastNamePlaceholder}
            className="w-1/2 rounded-lg border border-brand-gold/30 bg-white px-4 py-2.5 text-sm text-brand-dark placeholder:text-brand-dark/40 outline-none focus:border-brand-gold/60"
          />
        </div>
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
