import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { suggestPosterPrompt } from "@/lib/gemini";
import { getTemplate } from "@/lib/poster-templates";

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { templateId, variables, eventType } = await request.json();

  if (!templateId) {
    return NextResponse.json(
      { error: "Template requis" },
      { status: 400 },
    );
  }

  const template = getTemplate(templateId);
  if (!template) {
    return NextResponse.json(
      { error: "Template inconnu" },
      { status: 400 },
    );
  }

  try {
    const prompt = await suggestPosterPrompt(
      template.aiPromptTemplate,
      variables || {},
      eventType,
    );

    return NextResponse.json({ success: true, prompt });
  } catch (err) {
    console.error("Generate prompt error:", err);
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Erreur de génération du prompt",
      },
      { status: 500 },
    );
  }
}
