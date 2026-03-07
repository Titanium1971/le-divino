import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createReservation } from "@/lib/supabase/reservations";

export async function POST(request: NextRequest) {
  const body = await request.json();

  const { name, email, phone, date, time, guests, message } = body;

  if (!name || !email || !phone || !date || !time || !guests) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    const supabase = await createClient();
    const reservation = await createReservation(supabase, {
      name,
      email,
      phone,
      date,
      time,
      guests: Number(guests),
      message: message ?? null,
      status: "pending",
    });

    return NextResponse.json({ success: true, id: reservation.id });
  } catch {
    return NextResponse.json({ error: "Failed to create reservation" }, { status: 500 });
  }
}
