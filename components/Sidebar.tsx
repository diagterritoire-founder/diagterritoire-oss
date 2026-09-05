import Link from "next/link";

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

export default function Sidebar() {
  return (
    <aside className="hidden min-h-screen w-72 flex-col bg-slate-950 px-5 py-6 text-white lg:flex">
      <div className="border-b border-slate-800 pb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-400">
          Intelligence territoriale
        </p>

        <Link href="/dashboard">
          <h1 className="mt-3 text-2xl font-bold">DiagTerritoire</h1>
        </Link>

        <p className="mt-2 text-sm text-slate-400">
          Voir. Comprendre. Décider.
        </p>
      </div>

      <nav className="mt-7 space-y-2">
        {navigationItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-slate-900 hover:text-white"
          >
            <span className="w-5 text-center text-lg">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="mt-auto rounded-2xl border border-slate-800 bg-slate-900 p-4">
        <p className="text-sm font-semibold">Pilote Mayotte</p>
        <p className="mt-1 text-xs leading-5 text-slate-400">
          Diagnostic, prospective, comparaison, veille et restitution territoriale.
        </p>
      </div>
    </aside>
  );
}
