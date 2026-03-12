import { createClient } from "@/lib/supabase/server";
import { getHoraires, type Horaires } from "@/lib/supabase/horaires";

const DAY_KEYS: (keyof Horaires)[] = [
  "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche",
];

const DAY_LABELS: Record<keyof Horaires, string> = {
  lundi: "Lundi",
  mardi: "Mardi",
  mercredi: "Mercredi",
  jeudi: "Jeudi",
  vendredi: "Vendredi",
  samedi: "Samedi",
  dimanche: "Dimanche",
};

export async function HoursDisplay() {
  const supabase = await createClient();
  const horaires = await getHoraires(supabase);

  return (
    <div>
      <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
        Horaires
      </h3>
      <ul className="mt-2 space-y-1 text-sm">
        {DAY_KEYS.map((key) => {
          const day = horaires[key];
          return (
            <li key={key} className="flex justify-between">
              <span>{DAY_LABELS[key]}</span>
              <span className="text-muted-foreground">
                {day.ouvert ? `${day.debut} – ${day.fin}` : "Fermé"}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
