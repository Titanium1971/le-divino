import { createClient } from "@/lib/supabase/server";
import { getReservations, getTodayReservationsCount } from "@/lib/supabase/reservations";
import { ReservationsManager } from "@/components/admin/reservations-manager";

export default async function AdminReservationsPage() {
  const supabase = await createClient();
  const [reservations, todayCount] = await Promise.all([
    getReservations(supabase),
    getTodayReservationsCount(supabase),
  ]);

  return (
    <div>
      <ReservationsManager initialReservations={reservations} todayCount={todayCount} />
    </div>
  );
}
