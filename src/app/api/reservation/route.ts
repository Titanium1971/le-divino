import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient as createBrowserClient } from "@supabase/supabase-js";
import { createReservation } from "@/lib/supabase/reservations";

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const TIME_REGEX = /^\d{2}:\d{2}$/;

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  console.log("[reservation] Incoming request body:", JSON.stringify(body));

  const { name, email, phone, date, time, guests, message } = body as Record<string, string>;

  if (!name || !email || !phone || !date || !time || !guests) {
    return NextResponse.json(
      { error: "Missing required fields", received: { name: !!name, email: !!email, phone: !!phone, date: !!date, time: !!time, guests: !!guests } },
      { status: 400 },
    );
  }

  // Validate date format (YYYY-MM-DD)
  if (!DATE_REGEX.test(date)) {
    return NextResponse.json(
      { error: "Invalid date format. Expected YYYY-MM-DD.", received: date },
      { status: 400 },
    );
  }

  // Validate time format (HH:MM)
  if (!TIME_REGEX.test(time)) {
    return NextResponse.json(
      { error: "Invalid time format. Expected HH:MM.", received: time },
      { status: 400 },
    );
  }

  try {
    // Use direct Supabase client for public API routes (no auth cookies needed)
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
    console.log("[reservation] Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log("[reservation] Anon key present:", !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

    const insertData = {
      name,
      email,
      phone,
      date,
      time,
      guests: Number(guests),
      message: (message as string) ?? null,
      status: "pending" as const,
    };
    console.log("[reservation] Insert data:", JSON.stringify(insertData));

    const { data: row, error: dbError } = await supabase
      .from("reservations")
      .insert(insertData)
      .select()
      .single();

    if (dbError) {
      console.error("[reservation] Supabase error:", JSON.stringify(dbError));
      return NextResponse.json(
        { error: "Database error", details: dbError.message, code: dbError.code, hint: dbError.hint },
        { status: 500 },
      );
    }

    console.log("[reservation] Success:", row?.id);
    return NextResponse.json({ success: true, id: row.id });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("[reservation] Failed to create reservation:", errorMessage);
    return NextResponse.json(
      { error: "Failed to create reservation", details: errorMessage },
      { status: 500 },
    );
  }
}
