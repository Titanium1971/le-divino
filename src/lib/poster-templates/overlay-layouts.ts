import type { PosterOverlayStyle, PosterOrientation } from "./types";

export type TextElementLayout = {
  key: string;
  role: "title" | "subtitle" | "detail" | "branding";
  x: number; // 0-1 relative
  y: number; // 0-1 relative
  maxWidth: number; // 0-1 relative to canvas width
  fontSize: number; // base px at 1080 width
  fontWeight: string;
  textAlign: CanvasTextAlign;
  textTransform?: "uppercase" | "none";
  letterSpacing?: number;
  color?: string; // override, otherwise uses template text color
  accentColor?: boolean; // use template accent color instead
};

export type OverlayLayout = {
  gradient: {
    type: "linear" | "radial" | "none";
    angle?: number;
    stops: { offset: number; color: string }[];
  };
  elements: TextElementLayout[];
};

// Map variable keys to display labels for common text fields
const TITLE_KEYS = ["eventName", "title"];
const SUBTITLE_KEYS = ["subtitle", "theme", "artistName", "djName", "teams", "wineRegion", "hostName"];
const DETAIL_KEYS = ["date", "time", "kickoff", "timeRange", "price", "dressCode", "validDates", "description", "promoText", "specialOffer", "menuHighlight", "ctaText"];

export function getVariableRole(key: string): "title" | "subtitle" | "detail" {
  if (TITLE_KEYS.includes(key)) return "title";
  if (SUBTITLE_KEYS.includes(key)) return "subtitle";
  return "detail";
}

// --- Layout definitions per overlayStyle ---

function gradientBottomPortrait(): OverlayLayout {
  return {
    gradient: {
      type: "linear",
      angle: 180,
      stops: [
        { offset: 0.0, color: "rgba(0,0,0,0)" },
        { offset: 0.45, color: "rgba(0,0,0,0)" },
        { offset: 0.7, color: "rgba(0,0,0,0.5)" },
        { offset: 1.0, color: "rgba(0,0,0,0.85)" },
      ],
    },
    elements: [
      { key: "_title", role: "title", x: 0.5, y: 0.62, maxWidth: 0.85, fontSize: 72, fontWeight: "700", textAlign: "center", textTransform: "uppercase", letterSpacing: 2 },
      { key: "_subtitle", role: "subtitle", x: 0.5, y: 0.72, maxWidth: 0.8, fontSize: 36, fontWeight: "400", textAlign: "center" },
      { key: "_details", role: "detail", x: 0.5, y: 0.82, maxWidth: 0.8, fontSize: 30, fontWeight: "400", textAlign: "center" },
      { key: "_branding", role: "branding", x: 0.5, y: 0.94, maxWidth: 0.6, fontSize: 28, fontWeight: "700", textAlign: "center", textTransform: "uppercase", letterSpacing: 4, accentColor: true },
    ],
  };
}

function gradientBottomLandscape(): OverlayLayout {
  return {
    gradient: {
      type: "linear",
      angle: 180,
      stops: [
        { offset: 0.0, color: "rgba(0,0,0,0)" },
        { offset: 0.4, color: "rgba(0,0,0,0)" },
        { offset: 0.65, color: "rgba(0,0,0,0.5)" },
        { offset: 1.0, color: "rgba(0,0,0,0.85)" },
      ],
    },
    elements: [
      { key: "_title", role: "title", x: 0.5, y: 0.58, maxWidth: 0.8, fontSize: 64, fontWeight: "700", textAlign: "center", textTransform: "uppercase", letterSpacing: 2 },
      { key: "_subtitle", role: "subtitle", x: 0.5, y: 0.72, maxWidth: 0.7, fontSize: 32, fontWeight: "400", textAlign: "center" },
      { key: "_details", role: "detail", x: 0.5, y: 0.83, maxWidth: 0.7, fontSize: 26, fontWeight: "400", textAlign: "center" },
      { key: "_branding", role: "branding", x: 0.5, y: 0.94, maxWidth: 0.5, fontSize: 24, fontWeight: "700", textAlign: "center", textTransform: "uppercase", letterSpacing: 4, accentColor: true },
    ],
  };
}

function fullOverlayPortrait(): OverlayLayout {
  return {
    gradient: {
      type: "linear",
      angle: 180,
      stops: [
        { offset: 0.0, color: "rgba(0,0,0,0.4)" },
        { offset: 0.3, color: "rgba(0,0,0,0.2)" },
        { offset: 0.7, color: "rgba(0,0,0,0.3)" },
        { offset: 1.0, color: "rgba(0,0,0,0.7)" },
      ],
    },
    elements: [
      { key: "_title", role: "title", x: 0.5, y: 0.3, maxWidth: 0.85, fontSize: 78, fontWeight: "700", textAlign: "center", textTransform: "uppercase", letterSpacing: 3 },
      { key: "_subtitle", role: "subtitle", x: 0.5, y: 0.45, maxWidth: 0.8, fontSize: 38, fontWeight: "400", textAlign: "center" },
      { key: "_details", role: "detail", x: 0.5, y: 0.65, maxWidth: 0.8, fontSize: 30, fontWeight: "400", textAlign: "center" },
      { key: "_branding", role: "branding", x: 0.5, y: 0.92, maxWidth: 0.6, fontSize: 28, fontWeight: "700", textAlign: "center", textTransform: "uppercase", letterSpacing: 4, accentColor: true },
    ],
  };
}

function fullOverlayLandscape(): OverlayLayout {
  return {
    gradient: {
      type: "linear",
      angle: 180,
      stops: [
        { offset: 0.0, color: "rgba(0,0,0,0.4)" },
        { offset: 0.3, color: "rgba(0,0,0,0.15)" },
        { offset: 0.7, color: "rgba(0,0,0,0.3)" },
        { offset: 1.0, color: "rgba(0,0,0,0.7)" },
      ],
    },
    elements: [
      { key: "_title", role: "title", x: 0.5, y: 0.3, maxWidth: 0.75, fontSize: 68, fontWeight: "700", textAlign: "center", textTransform: "uppercase", letterSpacing: 3 },
      { key: "_subtitle", role: "subtitle", x: 0.5, y: 0.48, maxWidth: 0.7, fontSize: 34, fontWeight: "400", textAlign: "center" },
      { key: "_details", role: "detail", x: 0.5, y: 0.68, maxWidth: 0.7, fontSize: 26, fontWeight: "400", textAlign: "center" },
      { key: "_branding", role: "branding", x: 0.5, y: 0.92, maxWidth: 0.5, fontSize: 24, fontWeight: "700", textAlign: "center", textTransform: "uppercase", letterSpacing: 4, accentColor: true },
    ],
  };
}

function splitLeftPortrait(): OverlayLayout {
  return {
    gradient: {
      type: "linear",
      angle: 90,
      stops: [
        { offset: 0.0, color: "rgba(0,0,0,0.8)" },
        { offset: 0.45, color: "rgba(0,0,0,0.6)" },
        { offset: 0.55, color: "rgba(0,0,0,0.1)" },
        { offset: 1.0, color: "rgba(0,0,0,0)" },
      ],
    },
    elements: [
      { key: "_title", role: "title", x: 0.25, y: 0.3, maxWidth: 0.4, fontSize: 60, fontWeight: "700", textAlign: "left", textTransform: "uppercase", letterSpacing: 2 },
      { key: "_subtitle", role: "subtitle", x: 0.25, y: 0.45, maxWidth: 0.4, fontSize: 30, fontWeight: "400", textAlign: "left" },
      { key: "_details", role: "detail", x: 0.25, y: 0.6, maxWidth: 0.4, fontSize: 26, fontWeight: "400", textAlign: "left" },
      { key: "_branding", role: "branding", x: 0.25, y: 0.92, maxWidth: 0.4, fontSize: 24, fontWeight: "700", textAlign: "left", textTransform: "uppercase", letterSpacing: 4, accentColor: true },
    ],
  };
}

function splitLeftLandscape(): OverlayLayout {
  return {
    gradient: {
      type: "linear",
      angle: 90,
      stops: [
        { offset: 0.0, color: "rgba(0,0,0,0.8)" },
        { offset: 0.4, color: "rgba(0,0,0,0.5)" },
        { offset: 0.5, color: "rgba(0,0,0,0.1)" },
        { offset: 1.0, color: "rgba(0,0,0,0)" },
      ],
    },
    elements: [
      { key: "_title", role: "title", x: 0.22, y: 0.3, maxWidth: 0.38, fontSize: 54, fontWeight: "700", textAlign: "left", textTransform: "uppercase", letterSpacing: 2 },
      { key: "_subtitle", role: "subtitle", x: 0.22, y: 0.48, maxWidth: 0.38, fontSize: 28, fontWeight: "400", textAlign: "left" },
      { key: "_details", role: "detail", x: 0.22, y: 0.65, maxWidth: 0.38, fontSize: 22, fontWeight: "400", textAlign: "left" },
      { key: "_branding", role: "branding", x: 0.22, y: 0.92, maxWidth: 0.38, fontSize: 22, fontWeight: "700", textAlign: "left", textTransform: "uppercase", letterSpacing: 4, accentColor: true },
    ],
  };
}

function splitRightPortrait(): OverlayLayout {
  return {
    gradient: {
      type: "linear",
      angle: 270,
      stops: [
        { offset: 0.0, color: "rgba(0,0,0,0.8)" },
        { offset: 0.45, color: "rgba(0,0,0,0.6)" },
        { offset: 0.55, color: "rgba(0,0,0,0.1)" },
        { offset: 1.0, color: "rgba(0,0,0,0)" },
      ],
    },
    elements: [
      { key: "_title", role: "title", x: 0.75, y: 0.3, maxWidth: 0.4, fontSize: 60, fontWeight: "700", textAlign: "right", textTransform: "uppercase", letterSpacing: 2 },
      { key: "_subtitle", role: "subtitle", x: 0.75, y: 0.45, maxWidth: 0.4, fontSize: 30, fontWeight: "400", textAlign: "right" },
      { key: "_details", role: "detail", x: 0.75, y: 0.6, maxWidth: 0.4, fontSize: 26, fontWeight: "400", textAlign: "right" },
      { key: "_branding", role: "branding", x: 0.75, y: 0.92, maxWidth: 0.4, fontSize: 24, fontWeight: "700", textAlign: "right", textTransform: "uppercase", letterSpacing: 4, accentColor: true },
    ],
  };
}

function splitRightLandscape(): OverlayLayout {
  return {
    gradient: {
      type: "linear",
      angle: 270,
      stops: [
        { offset: 0.0, color: "rgba(0,0,0,0.8)" },
        { offset: 0.4, color: "rgba(0,0,0,0.5)" },
        { offset: 0.5, color: "rgba(0,0,0,0.1)" },
        { offset: 1.0, color: "rgba(0,0,0,0)" },
      ],
    },
    elements: [
      { key: "_title", role: "title", x: 0.78, y: 0.3, maxWidth: 0.38, fontSize: 54, fontWeight: "700", textAlign: "right", textTransform: "uppercase", letterSpacing: 2 },
      { key: "_subtitle", role: "subtitle", x: 0.78, y: 0.48, maxWidth: 0.38, fontSize: 28, fontWeight: "400", textAlign: "right" },
      { key: "_details", role: "detail", x: 0.78, y: 0.65, maxWidth: 0.38, fontSize: 22, fontWeight: "400", textAlign: "right" },
      { key: "_branding", role: "branding", x: 0.78, y: 0.92, maxWidth: 0.38, fontSize: 22, fontWeight: "700", textAlign: "right", textTransform: "uppercase", letterSpacing: 4, accentColor: true },
    ],
  };
}

function vignettePortrait(): OverlayLayout {
  return {
    gradient: {
      type: "radial",
      stops: [
        { offset: 0.0, color: "rgba(0,0,0,0)" },
        { offset: 0.5, color: "rgba(0,0,0,0.1)" },
        { offset: 0.8, color: "rgba(0,0,0,0.5)" },
        { offset: 1.0, color: "rgba(0,0,0,0.8)" },
      ],
    },
    elements: [
      { key: "_title", role: "title", x: 0.5, y: 0.15, maxWidth: 0.85, fontSize: 68, fontWeight: "700", textAlign: "center", textTransform: "uppercase", letterSpacing: 2 },
      { key: "_subtitle", role: "subtitle", x: 0.5, y: 0.25, maxWidth: 0.8, fontSize: 34, fontWeight: "400", textAlign: "center" },
      { key: "_details", role: "detail", x: 0.5, y: 0.82, maxWidth: 0.8, fontSize: 30, fontWeight: "400", textAlign: "center" },
      { key: "_branding", role: "branding", x: 0.5, y: 0.94, maxWidth: 0.6, fontSize: 28, fontWeight: "700", textAlign: "center", textTransform: "uppercase", letterSpacing: 4, accentColor: true },
    ],
  };
}

function vignetteLandscape(): OverlayLayout {
  return {
    gradient: {
      type: "radial",
      stops: [
        { offset: 0.0, color: "rgba(0,0,0,0)" },
        { offset: 0.5, color: "rgba(0,0,0,0.1)" },
        { offset: 0.8, color: "rgba(0,0,0,0.5)" },
        { offset: 1.0, color: "rgba(0,0,0,0.8)" },
      ],
    },
    elements: [
      { key: "_title", role: "title", x: 0.5, y: 0.15, maxWidth: 0.75, fontSize: 58, fontWeight: "700", textAlign: "center", textTransform: "uppercase", letterSpacing: 2 },
      { key: "_subtitle", role: "subtitle", x: 0.5, y: 0.3, maxWidth: 0.7, fontSize: 30, fontWeight: "400", textAlign: "center" },
      { key: "_details", role: "detail", x: 0.5, y: 0.78, maxWidth: 0.7, fontSize: 26, fontWeight: "400", textAlign: "center" },
      { key: "_branding", role: "branding", x: 0.5, y: 0.92, maxWidth: 0.5, fontSize: 24, fontWeight: "700", textAlign: "center", textTransform: "uppercase", letterSpacing: 4, accentColor: true },
    ],
  };
}

function minimalPortrait(): OverlayLayout {
  return {
    gradient: {
      type: "linear",
      angle: 180,
      stops: [
        { offset: 0.0, color: "rgba(0,0,0,0)" },
        { offset: 0.7, color: "rgba(0,0,0,0)" },
        { offset: 0.85, color: "rgba(0,0,0,0.4)" },
        { offset: 1.0, color: "rgba(0,0,0,0.7)" },
      ],
    },
    elements: [
      { key: "_title", role: "title", x: 0.5, y: 0.12, maxWidth: 0.85, fontSize: 64, fontWeight: "700", textAlign: "center", textTransform: "uppercase", letterSpacing: 2 },
      { key: "_subtitle", role: "subtitle", x: 0.5, y: 0.22, maxWidth: 0.8, fontSize: 30, fontWeight: "400", textAlign: "center" },
      { key: "_details", role: "detail", x: 0.5, y: 0.88, maxWidth: 0.8, fontSize: 28, fontWeight: "400", textAlign: "center" },
      { key: "_branding", role: "branding", x: 0.5, y: 0.95, maxWidth: 0.6, fontSize: 24, fontWeight: "700", textAlign: "center", textTransform: "uppercase", letterSpacing: 4, accentColor: true },
    ],
  };
}

function minimalLandscape(): OverlayLayout {
  return {
    gradient: {
      type: "linear",
      angle: 180,
      stops: [
        { offset: 0.0, color: "rgba(0,0,0,0)" },
        { offset: 0.7, color: "rgba(0,0,0,0)" },
        { offset: 0.85, color: "rgba(0,0,0,0.4)" },
        { offset: 1.0, color: "rgba(0,0,0,0.7)" },
      ],
    },
    elements: [
      { key: "_title", role: "title", x: 0.5, y: 0.12, maxWidth: 0.75, fontSize: 54, fontWeight: "700", textAlign: "center", textTransform: "uppercase", letterSpacing: 2 },
      { key: "_subtitle", role: "subtitle", x: 0.5, y: 0.25, maxWidth: 0.7, fontSize: 26, fontWeight: "400", textAlign: "center" },
      { key: "_details", role: "detail", x: 0.5, y: 0.88, maxWidth: 0.7, fontSize: 24, fontWeight: "400", textAlign: "center" },
      { key: "_branding", role: "branding", x: 0.5, y: 0.95, maxWidth: 0.5, fontSize: 22, fontWeight: "700", textAlign: "center", textTransform: "uppercase", letterSpacing: 4, accentColor: true },
    ],
  };
}

const LAYOUTS: Record<PosterOverlayStyle, Record<PosterOrientation, () => OverlayLayout>> = {
  "gradient-bottom": { portrait: gradientBottomPortrait, landscape: gradientBottomLandscape },
  "full-overlay": { portrait: fullOverlayPortrait, landscape: fullOverlayLandscape },
  "split-left": { portrait: splitLeftPortrait, landscape: splitLeftLandscape },
  "split-right": { portrait: splitRightPortrait, landscape: splitRightLandscape },
  "vignette": { portrait: vignettePortrait, landscape: vignetteLandscape },
  "minimal": { portrait: minimalPortrait, landscape: minimalLandscape },
};

export function getOverlayLayout(
  overlayStyle: PosterOverlayStyle,
  orientation: PosterOrientation,
): OverlayLayout {
  return LAYOUTS[overlayStyle][orientation]();
}
