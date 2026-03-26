"use client";

import { useState } from "react";

type FaqItem = {
  question: string;
  answer: string;
};

type FaqSectionProps = {
  title: string;
  items: FaqItem[];
};

export function FaqSection({ title, items }: FaqSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="bg-brand-dark/90 py-24">
      <div className="mx-auto max-w-3xl px-6">
        <div className="text-center">
          <h2 className="text-3xl font-extralight tracking-[0.15em] text-brand-cream md:text-4xl">
            {title}
          </h2>
          <div className="mx-auto mt-4 h-px w-16 bg-brand-gold" />
        </div>

        <div className="mt-14 divide-y divide-brand-gold/20">
          {items.map((item, index) => (
            <div key={index}>
              <button
                onClick={() => toggle(index)}
                className="flex w-full items-center justify-between py-6 text-left transition-colors duration-200"
                aria-expanded={openIndex === index}
              >
                <h3 className="pr-4 text-sm font-normal tracking-[0.1em] text-brand-cream md:text-base">
                  {item.question}
                </h3>
                <span
                  className={`flex-shrink-0 text-brand-gold transition-transform duration-300 ${
                    openIndex === index ? "rotate-45" : ""
                  }`}
                  aria-hidden="true"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M8 1v14M1 8h14"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === index
                    ? "max-h-96 pb-6 opacity-100"
                    : "max-h-0 opacity-0"
                }`}
              >
                <p className="text-sm font-light leading-relaxed text-brand-cream/80">
                  {item.answer}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
