import type { ReactNode } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

type DashboardLayoutProps = {
  title: string;
  eyebrow?: string;
  description?: string;
  children: ReactNode;
};

export default function DashboardLayout({
  title,
  eyebrow,
  description,
  children,
}: DashboardLayoutProps) {
  return (
    <main className="min-h-screen bg-slate-100">
      <div className="flex min-h-screen">
        <Sidebar />

        <section className="flex min-w-0 flex-1 flex-col">
          <Header
            title={title}
            eyebrow={eyebrow}
            description={description}
          />

          <div className="flex-1 p-5 sm:p-8">{children}</div>
        </section>
      </div>
    </main>
  );
}
