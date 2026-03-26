"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoutButton } from "./logout-button";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: "◆" },
  { href: "/admin/menu", label: "Plats", icon: "◇" },
  { href: "/admin/menus", label: "Menus", icon: "◈" },
  { href: "/admin/vins", label: "Vins", icon: "◗" },
  { href: "/admin/boissons", label: "Boissons", icon: "◔" },
  { href: "/admin/reservations", label: "Réservations", icon: "◉" },
  { href: "/admin/events", label: "Événements", icon: "◎" },
  { href: "/admin/faq", label: "FAQ", icon: "?" },
  { href: "/admin/posters", label: "Affiches IA", icon: "⬡" },
  { href: "/admin/gallery", label: "Galerie", icon: "○" },
  { href: "/admin/ecran", label: "Écran 55\"", icon: "▢" },
  { href: "/admin/settings", label: "Paramètres", icon: "⚙" },
  { href: "/admin/conges", label: "Congés", icon: "✦" },
  { href: "/admin/activite", label: "Activité", icon: "▸" },
];

type AdminSidebarProps = {
  userEmail: string;
};

export function AdminSidebar({ userEmail }: AdminSidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const sidebarContent = (
    <>
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
      <nav className="flex-1 overflow-y-auto px-3 py-4">
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
    </>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="sticky top-0 z-50 flex items-center justify-between border-b border-[#C5A55A]/15 bg-[#1A0A0E] px-4 py-3 md:hidden">
        <Link href="/admin" className="flex items-center gap-2">
          <p className="text-sm font-light tracking-[0.2em] text-[#FAF6F0]">LE DIVINO</p>
          <p className="text-[9px] font-light tracking-wider text-[#C5A55A]">ADMIN</p>
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex h-10 w-10 items-center justify-center rounded-md text-[#FAF6F0]/80 hover:bg-[#C5A55A]/10 hover:text-[#FAF6F0]"
          aria-label="Menu"
        >
          {mobileOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          )}
        </button>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-[#1A0A0E] transition-transform duration-300 md:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Desktop sidebar */}
      <aside className="admin-scrollbar hidden w-64 shrink-0 flex-col border-r border-[#C5A55A]/15 bg-[#1A0A0E] md:flex">
        {sidebarContent}
      </aside>
    </>
  );
}
