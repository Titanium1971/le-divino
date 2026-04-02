"use client";

import { Fragment } from "react";

type Props = {
  role: "user" | "assistant";
  content: string;
};

function parseInline(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  // Split by URLs and **bold**
  const parts = text.split(/(https?:\/\/[^\s]+|\*\*[^*]+\*\*)/g);
  parts.forEach((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      nodes.push(
        <strong key={i} className="font-semibold">
          {part.slice(2, -2)}
        </strong>,
      );
    } else if (/^https?:\/\//.test(part)) {
      // Clean trailing punctuation
      const clean = part.replace(/[.,;:!?)]+$/, "");
      nodes.push(
        <a
          key={i}
          href={clean}
          target="_blank"
          rel="noopener noreferrer"
          className="text-brand-bordeaux underline underline-offset-2 hover:text-brand-bordeaux/80 break-all"
        >
          Voir sur Google Maps
        </a>,
      );
    } else {
      nodes.push(<Fragment key={i}>{part}</Fragment>);
    }
  });
  return nodes;
}

function renderContent(content: string): React.ReactNode[] {
  const lines = content.split("\n");
  const nodes: React.ReactNode[] = [];
  let listItems: string[] = [];

  function flushList() {
    if (listItems.length > 0) {
      nodes.push(
        <ul key={`list-${nodes.length}`} className="my-1 ml-4 space-y-0.5">
          {listItems.map((item, j) => (
            <li key={j} className="list-disc">{parseInline(item)}</li>
          ))}
        </ul>,
      );
      listItems = [];
    }
  }

  lines.forEach((line, i) => {
    const trimmed = line.trim();

    // List items (- or •)
    if (/^[-•]\s/.test(trimmed)) {
      listItems.push(trimmed.replace(/^[-•]\s/, ""));
      return;
    }

    flushList();

    // Empty lines
    if (!trimmed) {
      nodes.push(<br key={`br-${i}`} />);
      return;
    }

    // Headings (### or ##)
    if (/^#{1,3}\s/.test(trimmed)) {
      const text = trimmed.replace(/^#{1,3}\s/, "");
      nodes.push(
        <p key={i} className="font-semibold mt-1.5 mb-0.5">
          {parseInline(text)}
        </p>,
      );
      return;
    }

    // Regular text
    nodes.push(
      <p key={i} className="my-0.5">
        {parseInline(trimmed)}
      </p>,
    );
  });

  flushList();
  return nodes;
}

export function ChatMessage({ role, content }: Props) {
  if (!content) {
    if (role === "assistant") {
      return (
        <div className="flex justify-start">
          <div className="rounded-2xl rounded-bl-sm bg-white border border-brand-gold/20 px-4 py-3">
            <div className="flex gap-1">
              <span className="h-2 w-2 rounded-full bg-brand-gold/60 animate-bounce [animation-delay:0ms]" />
              <span className="h-2 w-2 rounded-full bg-brand-gold/60 animate-bounce [animation-delay:150ms]" />
              <span className="h-2 w-2 rounded-full bg-brand-gold/60 animate-bounce [animation-delay:300ms]" />
            </div>
          </div>
        </div>
      );
    }
    return null;
  }

  const isUser = role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          isUser
            ? "rounded-br-sm bg-brand-bordeaux text-brand-cream"
            : "rounded-bl-sm bg-white border border-brand-gold/20 text-brand-dark"
        }`}
      >
        {isUser ? (
          content.split("\n").map((line, i) => (
            <span key={i}>
              {line}
              {i < content.split("\n").length - 1 && <br />}
            </span>
          ))
        ) : (
          <div className="space-y-0">{renderContent(content)}</div>
        )}
      </div>
    </div>
  );
}
