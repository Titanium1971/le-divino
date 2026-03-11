"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { createMenu, updateMenu } from "@/lib/supabase/menus";
import type { Menu, MenuFormData, MenuType } from "@/lib/types/database";
import { MENU_TYPES } from "@/lib/types/database";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  menu: Menu | null;
  onSaved: () => Promise<void>;
};

export function MenuFormSheet({ open, onOpenChange, menu, onSaved }: Props) {
  const supabase = createClient();
  const isEdit = !!menu;

  const [nameFr, setNameFr] = useState("");
  const [descFr, setDescFr] = useState("");
  const [price, setPrice] = useState("");
  const [type, setType] = useState<MenuType>("entree_plat");
  const [active, setActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (menu) {
      setNameFr(menu.name_fr ?? "");
      setDescFr(menu.description_fr ?? "");
      setPrice(String(Number(menu.price)));
      setType(menu.type);
      setActive(menu.active);
    } else {
      setNameFr("");
      setDescFr("");
      setPrice("");
      setType("entree_plat");
      setActive(true);
    }
    setError(null);
  }, [menu, open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nameFr || !price) {
      setError("Nom et prix sont obligatoires.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const formData: MenuFormData = {
        name_fr: nameFr,
        description_fr: descFr || null,
        price: parseFloat(price),
        type,
        active,
      };

      if (isEdit) {
        await updateMenu(supabase, menu.id, formData);
      } else {
        await createMenu(supabase, formData);
      }

      await onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la sauvegarde.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{isEdit ? "Modifier le menu" : "Ajouter un menu"}</SheetTitle>
          <SheetDescription>
            {isEdit
              ? "Modifiez les informations du menu."
              : "Remplissez les informations du nouveau menu."}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-10rem)] px-4">
          <form id="menu-form" onSubmit={handleSubmit} className="space-y-6 pb-8 pt-4">
            <div className="space-y-2">
              <Label htmlFor="menu-name">Nom</Label>
              <Input
                id="menu-name"
                value={nameFr}
                onChange={(e) => setNameFr(e.target.value)}
                placeholder="Ex : Formule Entrée + Plat"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="menu-desc">Description</Label>
              <Textarea
                id="menu-desc"
                value={descFr}
                onChange={(e) => setDescFr(e.target.value)}
                placeholder="Description du menu"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={type} onValueChange={(v) => setType(v as MenuType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MENU_TYPES.map((mt) => (
                      <SelectItem key={mt.value} value={mt.value}>
                        {mt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="menu-price">Prix (€)</Label>
                <Input
                  id="menu-price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="menu-active">Actif</Label>
              <Switch id="menu-active" checked={active} onCheckedChange={setActive} />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
          </form>
        </ScrollArea>

        <div className="border-t px-4 pt-4">
          <Button type="submit" form="menu-form" disabled={saving} className="w-full">
            {saving ? "Enregistrement..." : isEdit ? "Mettre à jour" : "Créer le menu"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
