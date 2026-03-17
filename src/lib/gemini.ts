import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || "");

/**
 * Generate a poster image using Gemini's Imagen 3 model.
 * Returns base64-encoded image data.
 */
export async function generatePosterImage(
  prompt: string,
  aspectRatio: "9:16" | "16:9" = "9:16",
): Promise<string> {
  const model = genAI.getGenerativeModel({
    model: "imagen-3.0-generate-002",
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const response = await (model as any).generateImages({
    prompt,
    config: {
      numberOfImages: 1,
      aspectRatio,
    },
  });

  const image = response.generatedImages?.[0];
  if (!image?.image?.imageBytes) {
    throw new Error("Aucune image générée par Imagen 3");
  }

  // imageBytes is already base64 from the SDK
  return typeof image.image.imageBytes === "string"
    ? image.image.imageBytes
    : Buffer.from(image.image.imageBytes).toString("base64");
}

/**
 * Use Gemini Flash to refine/suggest a poster prompt.
 */
export async function suggestPosterPrompt(
  templatePrompt: string,
  variables: Record<string, string>,
  eventType?: string,
): Promise<string> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  // Replace template variables
  let assembled = templatePrompt;
  for (const [key, value] of Object.entries(variables)) {
    assembled = assembled.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), value || "");
    // Handle conditional expressions like {{artistName ? 'text' + artistName : ''}}
    const conditionalRegex = new RegExp(
      `\\{\\{${key}\\s*\\?\\s*[^}]+\\}\\}`,
      "g",
    );
    assembled = assembled.replace(conditionalRegex, value ? value : "");
  }
  // Clean remaining unresolved placeholders
  assembled = assembled.replace(/\{\{[^}]+\}\}/g, "");

  const result = await model.generateContent({
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `Tu es un expert en création d'affiches pour un restaurant méditerranéen premium "Le Divino" à Agde, France.

Voici un prompt de base pour générer une affiche :
"${assembled}"

${eventType ? `Type d'événement : ${eventType}` : ""}

Améliore ce prompt pour obtenir une affiche de qualité professionnelle. Le prompt doit :
- Être en anglais (pour Imagen 3)
- Décrire précisément le style visuel, les couleurs, la composition
- Mentionner le restaurant Le Divino et l'ambiance méditerranéenne
- Être concis (max 200 mots)
- NE PAS inclure de texte à afficher sur l'affiche (pas de titre, pas de date, pas de nom)

Réponds UNIQUEMENT avec le prompt amélioré, sans explication ni formatage.`,
          },
        ],
      },
    ],
  });

  return result.response.text().trim();
}

/**
 * Assemble template prompt with variables (simple replacement).
 */
export function assemblePrompt(
  templatePrompt: string,
  variables: Record<string, string>,
): string {
  let assembled = templatePrompt;

  for (const [key, value] of Object.entries(variables)) {
    // Simple replacement
    assembled = assembled.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), value || "");
    // Conditional expressions: {{key ? 'text' + key + '.' : ''}}
    const conditionalRegex = new RegExp(
      `\\{\\{${key}\\s*\\?\\s*([^:]+):\\s*([^}]+)\\}\\}`,
      "g",
    );
    assembled = assembled.replace(conditionalRegex, value ? `$1`.replace(key, value) : "");
  }

  // Clean remaining unresolved placeholders
  assembled = assembled.replace(/\{\{[^}]+\}\}/g, "").replace(/\s{2,}/g, " ").trim();

  return assembled;
}
