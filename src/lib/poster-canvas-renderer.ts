import { getPosterFont } from "./poster-fonts";
import { getOverlayLayout } from "./poster-templates/overlay-layouts";
import type { PosterTemplate, PosterOrientation } from "./poster-templates/types";

function formatDateFR(dateStr: string): string {
  try {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

/** Load a Google Font into the document so Canvas can use it */
async function loadFont(fontFamily: string, fontUrl: string): Promise<void> {
  // Check if already loaded
  if (document.fonts.check(`16px "${fontFamily}"`)) return;

  // Fetch the CSS to extract the woff2 URL
  const cssRes = await fetch(fontUrl);
  const cssText = await cssRes.text();

  // Extract all @font-face src urls
  const urlMatches = cssText.matchAll(/url\(([^)]+)\)\s*format\(['"]?woff2['"]?\)/g);

  for (const match of urlMatches) {
    const woff2Url = match[1];
    // Extract weight from the @font-face block
    const blockStart = cssText.lastIndexOf("@font-face", match.index);
    const blockText = cssText.slice(blockStart, (match.index ?? 0) + match[0].length);
    const weightMatch = blockText.match(/font-weight:\s*(\d+)/);
    const weight = weightMatch ? weightMatch[1] : "400";

    const face = new FontFace(fontFamily, `url(${woff2Url})`, {
      weight,
      style: "normal",
    });
    await face.load();
    document.fonts.add(face);
  }

  await document.fonts.ready;
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

function drawGradient(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement | OffscreenCanvas,
  layout: ReturnType<typeof getOverlayLayout>,
) {
  const w = canvas.width;
  const h = canvas.height;
  const g = layout.gradient;
  if (g.type === "none") return;

  let gradient: CanvasGradient;
  if (g.type === "radial") {
    const cx = w / 2;
    const cy = h / 2;
    const r = Math.max(w, h) * 0.7;
    gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
  } else {
    const angle = ((g.angle ?? 180) * Math.PI) / 180;
    const cx = w / 2;
    const cy = h / 2;
    const len = Math.max(w, h);
    const x1 = cx - Math.sin(angle) * len / 2;
    const y1 = cy - Math.cos(angle) * len / 2;
    const x2 = cx + Math.sin(angle) * len / 2;
    const y2 = cy + Math.cos(angle) * len / 2;
    gradient = ctx.createLinearGradient(x1, y1, x2, y2);
  }

  for (const stop of g.stops) {
    gradient.addColorStop(stop.offset, stop.color);
  }

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, w, h);
}

export type RenderPosterParams = {
  backgroundBase64: string;
  variables: Record<string, string>;
  template: PosterTemplate;
  orientation: PosterOrientation;
  fontId: string;
  scale?: number; // 1 = full resolution, 0.5 = preview
};

export async function renderPosterComposite(
  params: RenderPosterParams,
): Promise<string> {
  const { backgroundBase64, variables, template, orientation, fontId, scale = 1 } = params;

  const fullW = orientation === "landscape" ? 1920 : 1080;
  const fullH = orientation === "landscape" ? 1080 : 1920;
  const w = Math.round(fullW * scale);
  const h = Math.round(fullH * scale);
  const scaleFactor = w / 1080; // font sizes are defined relative to 1080 width

  // Load font
  const font = getPosterFont(fontId);
  await loadFont(font.family, font.url);

  // Create canvas
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;

  // Draw background image
  const img = new Image();
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = `data:image/png;base64,${backgroundBase64}`;
  });
  ctx.drawImage(img, 0, 0, w, h);

  // Draw gradient overlay
  const layout = getOverlayLayout(template.overlayStyle, orientation);
  drawGradient(ctx, canvas, layout);

  // Build text content from variables
  const titleKeys = ["eventName", "title"];
  const subtitleKeys = ["subtitle", "theme", "artistName", "djName", "teams", "wineRegion", "hostName"];

  let titleText = "";
  for (const k of titleKeys) {
    if (variables[k]) { titleText = variables[k]; break; }
  }

  const subtitleParts: string[] = [];
  for (const k of subtitleKeys) {
    if (variables[k] && variables[k] !== titleText) {
      subtitleParts.push(variables[k]);
    }
  }

  const detailParts: string[] = [];
  // Format date nicely
  if (variables.date) detailParts.push(formatDateFR(variables.date));
  if (variables.time) detailParts.push(variables.time);
  if (variables.kickoff) detailParts.push(variables.kickoff);
  if (variables.timeRange) detailParts.push(variables.timeRange);
  if (variables.price) detailParts.push(variables.price);
  if (variables.dressCode) detailParts.push(variables.dressCode);
  if (variables.validDates) detailParts.push(variables.validDates);
  if (variables.promoText) detailParts.push(variables.promoText);
  if (variables.specialOffer) detailParts.push(variables.specialOffer);
  if (variables.menuHighlight) detailParts.push(variables.menuHighlight);
  if (variables.description) detailParts.push(variables.description);

  const textColor = template.colorScheme.text;
  const accentColor = template.colorScheme.accent;

  // Draw each layout element
  for (const el of layout.elements) {
    let text = "";

    if (el.key === "_title") {
      text = titleText;
    } else if (el.key === "_subtitle") {
      text = subtitleParts.join(" — ");
    } else if (el.key === "_details") {
      text = detailParts.join("  ·  ");
    } else if (el.key === "_branding") {
      text = "Le Divino";
    }

    if (!text) continue;

    if (el.textTransform === "uppercase") text = text.toUpperCase();

    const fontSize = Math.round(el.fontSize * scaleFactor);
    const weight = el.fontWeight || "400";
    ctx.font = `${weight} ${fontSize}px "${font.family}", sans-serif`;
    ctx.textAlign = el.textAlign;
    ctx.textBaseline = "middle";

    const color = el.accentColor ? accentColor : textColor;
    const maxWidthPx = el.maxWidth * w;
    const x = el.x * w;
    const y = el.y * h;

    // Word wrap
    const lines = wrapText(ctx, text, maxWidthPx);
    const lineHeight = fontSize * 1.3;
    const totalHeight = lines.length * lineHeight;
    const startY = y - totalHeight / 2 + lineHeight / 2;

    for (let i = 0; i < lines.length; i++) {
      const ly = startY + i * lineHeight;

      // Text shadow for readability
      ctx.fillStyle = "rgba(0,0,0,0.6)";
      ctx.fillText(lines[i], x + 2 * scaleFactor, ly + 2 * scaleFactor, maxWidthPx);

      // Main text
      ctx.fillStyle = color;
      if (el.letterSpacing && el.letterSpacing > 0) {
        // Canvas doesn't support letterSpacing natively in all browsers
        // Use the standard property if available
        (ctx as unknown as Record<string, unknown>).letterSpacing = `${el.letterSpacing * scaleFactor}px`;
      }
      ctx.fillText(lines[i], x, ly, maxWidthPx);
      (ctx as unknown as Record<string, unknown>).letterSpacing = "0px";
    }
  }

  // Return base64 without prefix
  const dataUrl = canvas.toDataURL("image/png");
  return dataUrl.replace(/^data:image\/png;base64,/, "");
}
