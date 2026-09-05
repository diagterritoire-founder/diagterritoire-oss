import type { ReactNode } from "react";

type PageSectionProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

export default function PageSection({
  title,
  subtitle,
  children,
}: PageSectionProps) {
  return (
    <section className="mt-8">
      <div className="mb-5">
        <h2 className="text-2xl font-bold text-slate-950">{title}</h2>

        {subtitle ? (
          <p className="mt-2 text-sm text-slate-500">{subtitle}</p>
        ) : null}
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        {children}
      </div>
    </section>
  );
}
