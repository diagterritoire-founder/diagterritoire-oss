type CouncilAction = {
  indicatorId: string;
  indicatorName: string;
  score: number;
  priority: "forte" | "consolider" | "preserver";
  action: string;
};

type CouncilPrioritiesProps = {
  actions: CouncilAction[];
};

function priorityLabel(
  priority: CouncilAction["priority"],
) {
  if (priority === "forte") {
    return "Priorité forte";
  }

  if (priority === "consolider") {
    return "À consolider";
  }

  return "À préserver";
}

export default function CouncilPriorities({
  actions,
}: CouncilPrioritiesProps) {
  const priorities = [...actions]
    .sort((a, b) => a.score - b.score)
    .slice(0, 3);

  if (priorities.length === 0) {
    return null;
  }

  return (
    <section className="rounded-3xl bg-white p-7 shadow-sm print:break-inside-avoid print:shadow-none">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">
        Lecture décisionnelle
      </p>

      <h2 className="mt-2 text-2xl font-bold text-slate-950">
        Enjeux prioritaires de la séance
      </h2>

      <p className="mt-2 text-sm leading-6 text-slate-600">
        Les trois sujets présentant les scores diagnostiques
        les plus faibles dans les données actuellement disponibles.
      </p>

      <div className="mt-5 grid gap-4 md:grid-cols-3">
        {priorities.map((action, index) => (
          <article
            key={action.indicatorId}
            className="rounded-2xl border border-slate-200 p-5 print:break-inside-avoid"
          >
            <div className="flex items-start justify-between gap-3">
              <span className="text-2xl font-bold text-cyan-700">
                {index + 1}
              </span>

              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                {priorityLabel(action.priority)}
              </span>
            </div>

            <h3 className="mt-4 font-semibold leading-6 text-slate-950">
              {action.indicatorName}
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              {action.action}
            </p>

            <div className="mt-4 border-t border-slate-200 pt-3">
              <p className="text-xs font-semibold uppercase text-slate-500">
                Indice diagnostic DT
              </p>

              <p className="mt-1 text-xl font-bold text-slate-950">
                {action.score}/100
              </p>
            </div>
          </article>
        ))}
      </div>

      <p className="mt-5 text-xs leading-5 text-slate-500">
        Ce classement constitue une aide à la préparation de la séance.
        Il ne détermine pas les priorités politiques de la collectivité.
      </p>
    </section>
  );
}
