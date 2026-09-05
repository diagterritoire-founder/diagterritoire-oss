"use client";

import dynamic from "next/dynamic";

const MayotteLeafletMap = dynamic(
  () => import("./MayotteLeafletMap"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[620px] items-center justify-center rounded-3xl bg-slate-100 text-sm text-slate-500">
        Chargement de la carte…
      </div>
    ),
  },
);

export default function MayotteMap() {
  return <MayotteLeafletMap />;
}
