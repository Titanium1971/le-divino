import { useTranslations } from "next-intl";
import { restaurantConfig } from "@/restaurant.config";
import { HoursDisplay } from "./hours-display";

export function SiteFooter() {
  const t = useTranslations("footer");

  return (
    <footer className="border-t bg-muted/30 py-12">
      <div className="container mx-auto grid gap-8 px-4 md:grid-cols-3">
        <div>
          <p className="text-lg font-medium">{restaurantConfig.name}</p>
          <p className="mt-1 text-sm text-muted-foreground">{restaurantConfig.tagline}</p>
          {restaurantConfig.address.street && (
            <p className="mt-4 text-sm text-muted-foreground">
              {restaurantConfig.address.street}
              <br />
              {restaurantConfig.address.postalCode} {restaurantConfig.address.city}
            </p>
          )}
        </div>
        <div>
          <HoursDisplay />
        </div>
        <div>
          {restaurantConfig.phone && (
            <p className="text-sm text-muted-foreground">{restaurantConfig.phone}</p>
          )}
          {restaurantConfig.email && (
            <p className="text-sm text-muted-foreground">{restaurantConfig.email}</p>
          )}
        </div>
      </div>
      <div className="container mx-auto mt-8 border-t px-4 pt-8">
        <p className="text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} {restaurantConfig.name}. {t("rights")}.
        </p>
      </div>
    </footer>
  );
}
