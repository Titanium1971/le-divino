export type Locale = "fr" | "en" | "it" | "es" | "de";

export type I18nField = Record<Locale, string>;

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number;
  visible: boolean;
  created_at: string;
  updated_at: string;
};

export type Dish = {
  id: string;
  category_id: string;
  name: I18nField;
  description: I18nField;
  price: number;
  image_path: string | null;
  allergens: string[];
  is_vegetarian: boolean;
  is_signature: boolean;
  available: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type DishWithCategory = Dish & {
  categories: Pick<Category, "id" | "name" | "slug">;
};

export type DishFormData = {
  category_id: string;
  name: I18nField;
  description: I18nField;
  price: number;
  allergens: string[];
  is_vegetarian: boolean;
  is_signature: boolean;
  available: boolean;
};

// ── Menus / Formules ──

export type MenuCourse = {
  label: string;
  dish_ids: string[];
};

export type Menu = {
  id: string;
  name: I18nField;
  description: I18nField;
  price: number;
  courses: MenuCourse[];
  available: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type MenuFormData = {
  name: I18nField;
  description: I18nField;
  price: number;
  courses: MenuCourse[];
  available: boolean;
};

// ── Categories form ──

export type CategoryFormData = {
  name: string;
  slug: string;
  description: string;
  visible: boolean;
};

// ── Reservations ──

export type ReservationStatus = "pending" | "confirmed" | "cancelled" | "completed" | "no_show";

export type Reservation = {
  id: string;
  name: string;
  email: string;
  phone: string;
  date: string;       // "YYYY-MM-DD"
  time: string;       // "HH:MM"
  guests: number;
  message: string | null;
  status: ReservationStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

// ── Events ──

export type EventType = "karaoke" | "concert" | "private" | "holiday" | "animation" | "custom";

export type Event = {
  id: string;
  title: I18nField;
  slug: string;
  description: I18nField;
  event_type: EventType;
  event_date: string;       // "YYYY-MM-DD"
  event_time: string | null; // "HH:MM"
  end_time: string | null;   // "HH:MM"
  location: string | null;
  image_path: string | null;
  is_featured: boolean;
  show_on_screen: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type EventFormData = {
  title: I18nField;
  slug: string;
  description: I18nField;
  event_type: EventType;
  event_date: string;
  event_time: string;
  end_time: string;
  location: string;
  is_featured: boolean;
  show_on_screen: boolean;
  is_active: boolean;
};

export const EVENT_TYPES: { value: EventType; label: string }[] = [
  { value: "karaoke", label: "Karaoké" },
  { value: "concert", label: "Concert" },
  { value: "private", label: "Soirée privée" },
  { value: "holiday", label: "Jour férié" },
  { value: "animation", label: "Animation" },
  { value: "custom", label: "Autre" },
];

// ── Gallery ──

export type GalleryTag = "restaurant" | "dishes" | "events" | "team" | "ambiance";

export type GalleryItem = {
  id: string;
  image_path: string;
  caption: I18nField;
  tag: GalleryTag;
  sort_order: number;
  published: boolean;
  created_at: string;
};

export const GALLERY_TAGS: { value: GalleryTag; label: string }[] = [
  { value: "restaurant", label: "Restaurant" },
  { value: "dishes", label: "Plats" },
  { value: "events", label: "Événements" },
  { value: "team", label: "Équipe" },
  { value: "ambiance", label: "Ambiance" },
];

export const ALLERGENS = [
  "Gluten",
  "Crustacés",
  "Œufs",
  "Poissons",
  "Arachides",
  "Soja",
  "Lait",
  "Fruits à coque",
  "Céleri",
  "Moutarde",
  "Sésame",
  "Sulfites",
  "Lupin",
  "Mollusques",
] as const;

// ── Screen Slides ──

export type SlideType =
  | "daily_special"
  | "menu"
  | "event"
  | "gallery"
  | "poster"
  | "custom"
  | "image"
  | "dish";

export type ScreenSlide = {
  id: string;
  type: SlideType;
  title: string | null;
  subtitle: string | null;
  image_path: string | null;
  reference_id: string | null;
  duration_ms: number;
  sort_order: number;
  active: boolean;
  schedule_start: string | null;
  schedule_end: string | null;
  content: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export const SLIDE_TYPES: { value: SlideType; label: string }[] = [
  { value: "daily_special", label: "Plat du jour" },
  { value: "menu", label: "Formule / Menu" },
  { value: "event", label: "Événement" },
  { value: "gallery", label: "Photo galerie" },
  { value: "poster", label: "Affiche" },
  { value: "custom", label: "Texte libre" },
];
