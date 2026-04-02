import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const token = searchParams.get("token");

  if (!id || !token) {
    return NextResponse.json(
      { error: "Missing id or token parameter" },
      { status: 400 },
    );
  }

  // Token validation: first 8 characters of the reservation ID
  const expectedToken = id.substring(0, 8);
  if (token !== expectedToken) {
    return NextResponse.json(
      { error: "Invalid confirmation token" },
      { status: 403 },
    );
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

    const { data, error } = await supabase
      .from("reservations")
      .update({ status: "confirmed" })
      .eq("id", id)
      .eq("status", "pending")
      .select()
      .single();

    if (error || !data) {
      console.error("[reservation/confirm] Supabase error:", error?.message);
      // Redirect anyway — the reservation may already be confirmed
      return NextResponse.redirect(
        new URL("/fr/reservation/merci", request.url),
      );
    }

    console.log("[reservation/confirm] Reservation confirmed:", id);
    return NextResponse.redirect(
      new URL("/fr/reservation/merci", request.url),
    );
  } catch (err) {
    console.error("[reservation/confirm] Error:", err);
    return NextResponse.redirect(
      new URL("/fr/reservation/merci", request.url),
    );
  }
}
