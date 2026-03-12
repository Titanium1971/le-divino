type Props = {
  message: string;
  dateDebut: string;
  dateFin: string;
};

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  try {
    return new Date(dateStr + "T00:00:00").toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export function CongesBanner({ message, dateDebut, dateFin }: Props) {
  const hasDates = dateDebut && dateFin;

  return (
    <section className="bg-brand-bordeaux/90 py-6">
      <div className="mx-auto max-w-3xl px-6 text-center">
        {message && (
          <p className="text-base font-light leading-relaxed text-brand-cream">
            {message}
          </p>
        )}
        {hasDates && (
          <p className="mt-2 text-sm font-medium tracking-wide text-brand-gold">
            {formatDate(dateDebut)} &mdash; {formatDate(dateFin)}
          </p>
        )}
      </div>
    </section>
  );
}
