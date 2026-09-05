"use client";

import Link from "next/link";
import {
  useState,
} from "react";

type HeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
};

const navigationItems = [
  { label: "Tableau de bord", href: "/dashboard", icon: "⌂" },
  { label: "Territoires", href: "/territoires", icon: "◎" },
  { label: "Indicateurs", href: "/indicateurs", icon: "▥" },
  { label: "Diagnostics", href: "/diagnostics", icon: "◇" },
  { label: "Veille", href: "/veille", icon: "⚠" },
  { label: "Comparaison", href: "/comparaison", icon: "⇄" },
  { label: "Cartographie", href: "/cartographie", icon: "⌖" },
  { label: "Assistant IA", href: "/assistant", icon: "✦" },
  { label: "Prospective", href: "/prospective", icon: "↗" },
];

export default function Header({
  eyebrow = "DiagTerritoire",
  title,
  description,
}: HeaderProps) {
  const [menuOpen, setMenuOpen] =
    useState(false);

  return (
    <header className="border-b border-slate-200 bg-white px-5 py-4 sm:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-700">
              {eyebrow}
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-950 sm:text-2xl">
              {title}
            </h2>

            {description ? (
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                {description}
              </p>
            ) : null}
          </div>

          <button
            type="button"
            onClick={() =>
              setMenuOpen(
                (current) => !current,
              )
            }
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-xl text-slate-700 shadow-sm lg:hidden"
            aria-label={
              menuOpen
                ? "Fermer le menu"
                : "Ouvrir le menu"
            }
            aria-expanded={menuOpen}
          >
            {menuOpen ? "×" : "☰"}
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
            aria-label="Ouvrir les notifications"
          >
            🔔
          </button>

          <div
            className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-950 text-sm font-bold text-white"
            aria-label="Profil utilisateur"
          >
            DT
          </div>
        </div>
      </div>

      {menuOpen ? (
        <nav className="mt-4 grid gap-2 border-t border-slate-200 pt-4 sm:grid-cols-2 lg:hidden">
          {navigationItems.map(
            (item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() =>
                  setMenuOpen(false)
                }
                className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                <span className="w-5 text-center text-lg">
                  {item.icon}
                </span>

                <span>
                  {item.label}
                </span>
              </Link>
            ),
          )}
        </nav>
      ) : null}
    </header>
  );
}
