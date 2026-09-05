import {
  LoginForm,
} from "./LoginForm";

export default function ConnexionPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-12">
      <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-700">
            DiagTerritoire
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-950">
            Connexion
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-600">
            Accédez à votre espace métier avec
            votre adresse e-mail autorisée.
          </p>
        </div>

        <LoginForm />
      </section>
    </main>
  );
}
