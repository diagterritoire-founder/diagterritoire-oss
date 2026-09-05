"use client";

import {
  type FormEvent,
  useState,
} from "react";

import {
  signIn,
} from "next-auth/react";

export function LoginForm() {
  const [error, setError] =
    useState<string | null>(null);

  const [pending, setPending] =
    useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError(null);
    setPending(true);

    const formData =
      new FormData(event.currentTarget);

    const email =
      formData.get("email");

    const password =
      formData.get("password");

    if (
      typeof email !== "string" ||
      !email.trim() ||
      typeof password !== "string" ||
      !password
    ) {
      setError(
        "Adresse e-mail et mot de passe obligatoires.",
      );
      setPending(false);
      return;
    }

    try {
      const result =
        await signIn("credentials", {
          email: email
            .trim()
            .toLowerCase(),
          password,
          redirect: false,
        });

      if (result?.error) {
        setError(
          "Adresse e-mail ou mot de passe incorrect.",
        );
        setPending(false);
        return;
      }

      window.location.assign(
        "/dashboard",
      );
    } catch {
      setError(
        "Impossible de se connecter pour le moment.",
      );
      setPending(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      <div>
        <label
          htmlFor="email"
          className="mb-2 block text-sm font-semibold text-slate-800"
        >
          Adresse e-mail
        </label>

        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="prenom.nom@collectivite.fr"
          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-950 outline-none transition focus:border-cyan-600"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="mb-2 block text-sm font-semibold text-slate-800"
        >
          Mot de passe
        </label>

        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-950 outline-none transition focus:border-cyan-600"
        />
      </div>

      {error ? (
        <p
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
        >
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-slate-950 px-4 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending
          ? "Connexion..."
          : "Se connecter"}
      </button>
    </form>
  );
}
