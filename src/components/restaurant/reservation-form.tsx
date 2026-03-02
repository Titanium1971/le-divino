"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function ReservationForm() {
  const t = useTranslations("reservation.form");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData);

    await fetch("/api/reservation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
      <div>
        <Label htmlFor="name">{t("name")}</Label>
        <Input id="name" name="name" required />
      </div>
      <div>
        <Label htmlFor="email">{t("email")}</Label>
        <Input id="email" name="email" type="email" required />
      </div>
      <div>
        <Label htmlFor="phone">{t("phone")}</Label>
        <Input id="phone" name="phone" type="tel" required />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="date">{t("date")}</Label>
          <Input id="date" name="date" type="date" required />
        </div>
        <div>
          <Label htmlFor="time">{t("time")}</Label>
          <Input id="time" name="time" type="time" required />
        </div>
      </div>
      <div>
        <Label htmlFor="guests">{t("guests")}</Label>
        <Input id="guests" name="guests" type="number" min={1} max={12} required />
      </div>
      <div>
        <Label htmlFor="message">{t("message")}</Label>
        <Textarea id="message" name="message" />
      </div>
      <Button type="submit" className="w-full">
        {t("submit")}
      </Button>
    </form>
  );
}
