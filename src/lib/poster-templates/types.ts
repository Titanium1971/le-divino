import type { EventType } from "@/lib/types/database";

export type PosterOrientation = "portrait" | "landscape";

export type PosterVariableType = "text" | "date" | "time" | "price" | "textarea";

export type PosterVariable = {
  key: string;
  label: string;
  type: PosterVariableType;
  required: boolean;
  placeholder?: string;
  defaultFromEvent?: "title" | "event_date" | "event_time" | "end_time" | "description" | "location";
};

export type PosterOverlayStyle =
  | "gradient-bottom"
  | "full-overlay"
  | "split-left"
  | "split-right"
  | "vignette"
  | "minimal";

export type PosterColorScheme = {
  primary: string;
  accent: string;
  background: string;
  text: string;
};

export type PosterTemplate = {
  id: string;
  name: string;
  description: string;
  icon: string;
  eventTypes: EventType[];
  orientations: PosterOrientation[];
  variables: PosterVariable[];
  colorScheme: PosterColorScheme;
  aiPromptTemplate: string;
  overlayStyle: PosterOverlayStyle;
};

export type PosterGeneration = {
  id: string;
  event_id: string | null;
  template_id: string;
  orientation: PosterOrientation;
  variables: Record<string, string>;
  ai_prompt: string;
  image_path: string | null;
  image_width: number | null;
  image_height: number | null;
  is_favorite: boolean;
  pushed_to_screen: boolean;
  screen_slide_id: string | null;
  created_at: string;
  updated_at: string;
};

export type PosterGenerationFormData = {
  event_id?: string | null;
  template_id: string;
  orientation: PosterOrientation;
  variables: Record<string, string>;
  ai_prompt: string;
  image_path?: string | null;
  image_width?: number | null;
  image_height?: number | null;
};
