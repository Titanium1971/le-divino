export type Locale = "fr" | "en" | "it" | "es" | "de";

export type I18nField = Record<Locale, string>;

// ── Dishes (flat i18n columns) ──

export type DishCategory = "entree" | "plat" | "dessert";
export type DishSource = "carte" | "marche";

export type Dish = {
  id: string;
  name_fr: string;
  name_en: string | null;
  name_it: string | null;
  name_es: string | null;
  name_de: string | null;
  description_fr: string | null;
  description_en: string | null;
  description_it: string | null;
  description_es: string | null;
  description_de: string | null;
  category: DishCategory;
  source: DishSource;
  price: number;
  image_path: string | null;
  available: boolean;
  sort_order: number;
  created_at: string;
};

export type DishFormData = {
  name_fr: string;
  name_en?: string | null;
  name_it?: string | null;
  name_es?: string | null;
  name_de?: string | null;
  description_fr?: string | null;
  description_en?: string | null;
  description_it?: string | null;
  description_es?: string | null;
  description_de?: string | null;
  category: DishCategory;
  source: DishSource;
  price: number;
  available: boolean;
};

export const DISH_CATEGORIES: { value: DishCategory; label: string }[] = [
  { value: "entree", label: "Entrées" },
  { value: "plat", label: "Plats" },
  { value: "dessert", label: "Desserts" },
];

export const DISH_SOURCES: { value: DishSource; label: string }[] = [
  { value: "carte", label: "La Carte" },
  { value: "marche", label: "Menu du Marché" },
];

// ── Menus / Formules ──

export type MenuType = "entree_plat" | "plat_dessert" | "entree_plat_dessert";

export type Menu = {
  id: string;
  name_fr: string;
  name_en: string | null;
  name_it: string | null;
  name_es: string | null;
  name_de: string | null;
  description_fr: string | null;
  description_en: string | null;
  description_it: string | null;
  description_es: string | null;
  description_de: string | null;
  price: number;
  type: MenuType;
  active: boolean;
  created_at: string;
};

export type MenuFormData = {
  name_fr: string;
  name_en?: string | null;
  name_it?: string | null;
  name_es?: string | null;
  name_de?: string | null;
  description_fr?: string | null;
  description_en?: string | null;
  description_it?: string | null;
  description_es?: string | null;
  description_de?: string | null;
  price: number;
  type: MenuType;
  active?: boolean;
};

export const MENU_TYPES: { value: MenuType; label: string }[] = [
  { value: "entree_plat", label: "Entrée + Plat" },
  { value: "plat_dessert", label: "Plat + Dessert" },
  { value: "entree_plat_dessert", label: "Entrée + Plat + Dessert" },
];

// ── Menu ↔ Dish junction ──

export type MenuDish = {
  id: string;
  menu_id: string;
  dish_id: string;
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
  is_featured: boolean;
  show_on_screen: boolean;
  created_at: string;
};

export const GALLERY_TAGS: { value: GalleryTag; label: string }[] = [
  { value: "restaurant", label: "Restaurant" },
  { value: "dishes", label: "Plats" },
  { value: "events", label: "Événements" },
  { value: "team", label: "Équipe" },
  { value: "ambiance", label: "Ambiance" },
];

// ── Wines ──

export type WineColor = "rouge" | "blanc" | "rosé" | "petillant";

export type Wine = {
  id: string;
  name: string;
  description_fr: string | null;
  description_en: string | null;
  description_it: string | null;
  description_es: string | null;
  description_de: string | null;
  region: string | null;
  appellation: string | null;
  color: WineColor;
  vintage: number | null;
  grape_variety: string | null;
  alcohol_degree: string | null;
  style: string | null;
  image_path: string | null;
  price_bottle: number | null;
  price_glass: number | null;
  available: boolean;
  sort_order: number;
  created_at: string;
};

export type WineFormData = {
  name: string;
  description_fr?: string | null;
  description_en?: string | null;
  description_it?: string | null;
  description_es?: string | null;
  description_de?: string | null;
  region?: string | null;
  appellation?: string | null;
  color: WineColor;
  vintage?: number | null;
  grape_variety?: string | null;
  alcohol_degree?: string | null;
  style?: string | null;
  image_path?: string | null;
  price_bottle?: number | null;
  price_glass?: number | null;
  available?: boolean;
};

export const WINE_COLORS: { value: WineColor; label: string }[] = [
  { value: "rouge", label: "Rouge" },
  { value: "blanc", label: "Blanc" },
  { value: "rosé", label: "Rosé" },
  { value: "petillant", label: "Pétillant" },
];

// ── Drinks ──

export type DrinkCategory = "soft" | "cocktail" | "biere" | "biere_pression" | "biere_bouteille" | "spiritueux" | "hot" | "autre";

export type Drink = {
  id: string;
  name: string;
  description_fr: string | null;
  description_en: string | null;
  description_it: string | null;
  description_es: string | null;
  description_de: string | null;
  category: DrinkCategory;
  image_path: string | null;
  price: number | null;
  price_galopin: number | null;
  price_25cl: number | null;
  price_50cl: number | null;
  price_1l: number | null;
  available: boolean;
  sort_order: number;
  created_at: string;
};

export type DrinkFormData = {
  name: string;
  description_fr?: string | null;
  description_en?: string | null;
  description_it?: string | null;
  description_es?: string | null;
  description_de?: string | null;
  category: DrinkCategory;
  image_path?: string | null;
  price?: number | null;
  price_galopin?: number | null;
  price_25cl?: number | null;
  price_50cl?: number | null;
  price_1l?: number | null;
  available?: boolean;
};

export const DRINK_CATEGORIES: { value: DrinkCategory; label: string }[] = [
  { value: "soft", label: "Softs" },
  { value: "cocktail", label: "Cocktails" },
  { value: "biere_pression", label: "Bières Pression" },
  { value: "biere_bouteille", label: "Bières Bouteille" },
  { value: "spiritueux", label: "Spiritueux" },
  { value: "hot", label: "Boissons Chaudes" },
  { value: "autre", label: "Autres" },
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
