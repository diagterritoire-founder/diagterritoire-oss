import type { ReactNode } from "react";
type StatCardProps = {
  label: string;
  value: string | number;
  description: string;
  icon?: ReactNode;
};

export default function StatCard({
  label,
  value,
  description,
  icon = "📊",
}: StatCardProps) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-3 text-3xl font-bold text-slate-950">{value}</p>
        </div>

        <div
          className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-50 text-2xl"
          aria-hidden="true"
        >
          {icon}
        </div>
      </div>

      <p className="mt-4 text-xs leading-5 text-slate-500">{description}</p>
    </article>
  );
}
