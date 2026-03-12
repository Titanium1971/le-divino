import { createClient } from "@/lib/supabase/server";
import { getSetting } from "@/lib/supabase/settings";
import { getHoraires } from "@/lib/supabase/horaires";
import { SettingsManager } from "@/components/admin/settings-manager";

export default async function AdminSettingsPage() {
  const supabase = await createClient();

  const [pin, restaurantInfo, horaires, socialLinks, reservationConfig] =
    await Promise.all([
      getSetting<string>(supabase, "service_pin"),
      getSetting<RestaurantInfo>(supabase, "restaurant_info"),
      getHoraires(supabase),
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
        initialHoraires={horaires}
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
