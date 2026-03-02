import { restaurantConfig } from "@/restaurant.config";

const dayNames: Record<number, string> = {
  1: "Lundi",
  2: "Mardi",
  3: "Mercredi",
  4: "Jeudi",
  5: "Vendredi",
  6: "Samedi",
  7: "Dimanche",
};

export function HoursDisplay() {
  return (
    <div>
      <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
        Horaires
      </h3>
      <ul className="mt-2 space-y-1 text-sm">
        {restaurantConfig.hours.map((h) => (
          <li key={h.day} className="flex justify-between">
            <span>{dayNames[h.day]}</span>
            <span className="text-muted-foreground">
              {h.open ? `${h.open}–${h.close} / ${h.dinnerOpen}–${h.dinnerClose}` : "Fermé"}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
