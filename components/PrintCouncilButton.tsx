"use client";

export default function PrintCouncilButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 print:hidden"
    >
      Imprimer / enregistrer en PDF
    </button>
  );
}
