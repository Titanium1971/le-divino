import { createClient } from "@/lib/supabase/server";
import { getEvents } from "@/lib/supabase/events";
import { EventsManager } from "@/components/admin/events-manager";

export default async function AdminEventsPage() {
  const supabase = await createClient();
  const events = await getEvents(supabase);

  return (
    <div>
      <EventsManager initialEvents={events} />
    </div>
  );
}
