"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoutButton } from "./logout-button";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: "◆" },
  { href: "/admin/menu", label: "Plats", icon: "◇" },
  { href: "/admin/menus", label: "Menus", icon: "◈" },
  { href: "/admin/formules", label: "Formules", icon: "◇" },
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
    <aside className="admin-scrollbar flex w-64 shrink-0 flex-col border-r border-[#C5A55A]/15 bg-[#1A0A0E]">
      {/* Brand */}
      <div className="border-b border-[#C5A55A]/10 px-6 py-5">
        <Link href="/admin" className="group block admin-focus rounded-md">
          <p className="text-lg font-light tracking-[0.2em] text-[#FAF6F0] transition-colors duration-200 group-hover:text-[#C5A55A]">
            LE DIVINO
          </p>
          <p className="mt-0.5 text-[10px] font-light tracking-wider text-[#C5A55A]">
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
                  className={`admin-nav-link admin-focus flex items-center gap-3 rounded-md px-3 py-2 text-sm font-light ${
                    isActive
                      ? "admin-nav-active font-medium"
                      : "text-[#FAF6F0]/60"
                  }`}
                >
                  <span className={`w-4 text-center text-xs transition-colors duration-200 ${isActive ? "text-[#C5A55A]" : ""}`}>
                    {item.icon}
                  </span>
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User / Logout */}
      <div className="border-t border-[#C5A55A]/10 px-4 py-4">
        <p className="truncate text-xs text-[#FAF6F0]/40">{userEmail}</p>
        <LogoutButton />
      </div>
    </aside>
  );
}
