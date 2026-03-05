import { createClient } from "@/lib/supabase/server";
import { getSetting } from "@/lib/supabase/settings";
import { SettingsManager } from "@/components/admin/settings-manager";

export default async function AdminSettingsPage() {
  const supabase = await createClient();

  const [pin, restaurantInfo, openingHours, socialLinks, reservationConfig] =
    await Promise.all([
      getSetting<string>(supabase, "service_pin"),
      getSetting<RestaurantInfo>(supabase, "restaurant_info"),
      getSetting<OpeningHours>(supabase, "opening_hours"),
      getSetting<SocialLinks>(supabase, "social_links"),
      getSetting<ReservationConfig>(supabase, "reservation_config"),
    ]);

  return (
    <div>
      <SettingsManager
        initialPin={pin ?? "1234"}
        initialRestaurantInfo={
          restaurantInfo ?? {
            name: "",
            address: "",
            phone: "",
            email: "",
            website: "",
          }
        }
        initialOpeningHours={
          openingHours ?? {
            lundi: null,
            mardi: { midi: "12:00–14:30", soir: "19:00–22:30" },
            mercredi: { midi: "12:00–14:30", soir: "19:00–22:30" },
            jeudi: { midi: "12:00–14:30", soir: "19:00–22:30" },
            vendredi: { midi: "12:00–14:30", soir: "19:00–22:30" },
            samedi: { midi: "12:00–14:30", soir: "19:00–23:00" },
            dimanche: { midi: "12:00–14:30", soir: "19:00–22:30" },
          }
        }
        initialSocialLinks={
          socialLinks ?? {
            instagram: "",
            facebook: "",
            tripadvisor: "",
            google_maps: "",
          }
        }
        initialReservationConfig={
          reservationConfig ?? {
            min_delay_hours: 2,
            max_group_size: 20,
            confirmation_message: "",
          }
        }
      />
    </div>
  );
}

// Types used for getSetting generics
type RestaurantInfo = {
  name: string;
  address: string;
  phone: string;
  email: string;
  website: string;
};

type DayHours = { midi: string; soir: string } | null;

type OpeningHours = {
  lundi: DayHours;
  mardi: DayHours;
  mercredi: DayHours;
  jeudi: DayHours;
  vendredi: DayHours;
  samedi: DayHours;
  dimanche: DayHours;
};

type SocialLinks = {
  instagram: string;
  facebook: string;
  tripadvisor: string;
  google_maps: string;
};

type ReservationConfig = {
  min_delay_hours: number;
  max_group_size: number;
  confirmation_message: string;
};
