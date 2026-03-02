import { useTranslations } from "next-intl";
import { restaurantConfig } from "@/restaurant.config";

export function ContactInfo() {
  const t = useTranslations("contact");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
          {t("address")}
        </h2>
        <p className="mt-1">
          {restaurantConfig.address.street || "Adresse à compléter"}
          <br />
          {restaurantConfig.address.postalCode} {restaurantConfig.address.city}
        </p>
      </div>
      <div>
        <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
          {t("phone")}
        </h2>
        <p className="mt-1">{restaurantConfig.phone || "À compléter"}</p>
      </div>
      <div>
        <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
          {t("email")}
        </h2>
        <p className="mt-1">{restaurantConfig.email}</p>
      </div>
    </div>
  );
}
