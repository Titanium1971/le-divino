import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { posterId, duration, scheduleStart, scheduleEnd } = await request.json();

  if (!posterId) {
    return NextResponse.json(
      { error: "ID du poster requis" },
      { status: 400 },
    );
  }

  try {
    // Fetch poster
    const { data: poster, error: fetchError } = await supabase
      .from("poster_generations")
      .select("*")
      .eq("id", posterId)
      .single();

    if (fetchError || !poster) {
      return NextResponse.json(
        { error: "Poster non trouvé" },
        { status: 404 },
      );
    }

    // Get max sort_order for new slide
    const { data: maxSlide } = await supabase
      .from("screen_slides")
      .select("sort_order")
      .order("sort_order", { ascending: false })
      .limit(1)
      .single();

    const nextOrder = (maxSlide?.sort_order ?? 0) + 1;

    // Create screen slide
    const { data: slide, error: slideError } = await supabase
      .from("screen_slides")
      .insert({
        type: "poster",
        title: poster.variables?.title || poster.variables?.eventName || "Affiche",
        image_path: poster.image_path,
        reference_id: poster.event_id || null,
        duration_ms: (duration || 15) * 1000,
        sort_order: nextOrder,
        active: true,
        schedule_start: scheduleStart || null,
        schedule_end: scheduleEnd || null,
        content: { poster_id: poster.id },
      })
      .select()
      .single();

    if (slideError) {
      throw slideError;
    }

    // Update poster record
    await supabase
      .from("poster_generations")
      .update({
        pushed_to_screen: true,
        screen_slide_id: slide.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", posterId);

    return NextResponse.json({
      success: true,
      slideId: slide.id,
    });
  } catch (err) {
    console.error("Poster to screen error:", err);
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Erreur",
      },
      { status: 500 },
    );
  }
}
