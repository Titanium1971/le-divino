"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoutButton } from "./logout-button";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: "◆" },
  { href: "/admin/menu", label: "Plats", icon: "◇" },
  { href: "/admin/menus", label: "Menus", icon: "◈" },
  { href: "/admin/reservations", label: "Réservations", icon: "◉" },
  { href: "/admin/events", label: "Événements", icon: "◎" },
  { href: "/admin/gallery", label: "Galerie", icon: "○" },
  { href: "/admin/ecran", label: "Écran 55\"", icon: "▢" },
  { href: "/admin/settings", label: "Paramètres", icon: "⚙" },
];

type AdminSidebarProps = {
  userEmail: string;
};

export function AdminSidebar({ userEmail }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r bg-[#1a0a0a] text-[#f5f0eb]">
      {/* Brand */}
      <div className="border-b border-[#f5f0eb]/10 px-6 py-5">
        <Link href="/admin" className="block">
          <p className="text-lg font-light tracking-[0.2em]">LE DIVINO</p>
          <p className="mt-0.5 text-[10px] font-light tracking-wider text-[#c5962c]">
            ADMINISTRATION
          </p>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname === item.href || pathname.startsWith(item.href + "/");

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-light transition-colors ${
                    isActive
                      ? "bg-[#6b1a1a] text-[#f5f0eb]"
                      : "text-[#f5f0eb]/60 hover:bg-[#f5f0eb]/5 hover:text-[#f5f0eb]"
                  }`}
                >
                  <span className="w-4 text-center text-xs">{item.icon}</span>
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User / Logout */}
      <div className="border-t border-[#f5f0eb]/10 px-4 py-4">
        <p className="truncate text-xs text-[#f5f0eb]/40">{userEmail}</p>
        <LogoutButton />
      </div>
    </aside>
  );
}
