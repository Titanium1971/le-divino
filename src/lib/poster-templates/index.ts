import type { PosterTemplate } from "./types";
import { concertLive } from "./templates/concert-live";
import { karaokeNight } from "./templates/karaoke-night";
import { djSet } from "./templates/dj-set";
import { wineTasting } from "./templates/wine-tasting";
import { brunchSpecial } from "./templates/brunch-special";
import { holidaySpecial } from "./templates/holiday-special";
import { happyHour } from "./templates/happy-hour";
import { themedNight } from "./templates/themed-night";
import { sportsViewing } from "./templates/sports-viewing";
import { privateParty } from "./templates/private-party";
import { weeklySpecial } from "./templates/weekly-special";
import { genericPromo } from "./templates/generic-promo";
import type { EventType } from "@/lib/types/database";

const POSTER_TEMPLATES: PosterTemplate[] = [
  concertLive,
  karaokeNight,
  djSet,
  wineTasting,
  brunchSpecial,
  holidaySpecial,
  happyHour,
  themedNight,
  sportsViewing,
  privateParty,
  weeklySpecial,
  genericPromo,
];

export function getAllTemplates(): PosterTemplate[] {
  return POSTER_TEMPLATES;
}

export function getTemplate(id: string): PosterTemplate | undefined {
  return POSTER_TEMPLATES.find((t) => t.id === id);
}

export function getTemplatesForEventType(eventType: EventType): PosterTemplate[] {
  return POSTER_TEMPLATES.filter((t) => t.eventTypes.includes(eventType));
}

export { POSTER_TEMPLATES };
