type ModulePlaceholderProps = {
  icon: string;
  title: string;
  description: string;
  actionLabel?: string;
};

export default function ModulePlaceholder({
  icon,
  title,
  description,
  actionLabel = "Fonctionnalité en préparation",
}: ModulePlaceholderProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex min-h-80 flex-col items-center justify-center text-center">
        <div
          className="flex h-20 w-20 items-center justify-center rounded-3xl bg-cyan-50 text-4xl"
          aria-hidden="true"
        >
          {icon}
        </div>

        <h3 className="mt-6 text-2xl font-bold text-slate-950">{title}</h3>

        <p className="mt-3 max-w-xl text-sm leading-7 text-slate-500 sm:text-base">
          {description}
        </p>

        <span className="mt-6 rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-600">
          {actionLabel}
        </span>
      </div>
    </section>
  );
}
