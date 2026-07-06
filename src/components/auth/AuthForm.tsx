"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { authClient } from "@/lib/auth-client";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const isRegister = mode === "register";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = isRegister
      ? await authClient.signUp.email({ name, email, password })
      : await authClient.signIn.email({ email, password });

    if (result.error) {
      setError(result.error.message ?? "Something went wrong. Try again.");
      setLoading(false);
      return;
    }
    router.push(isRegister ? "/onboarding" : "/home");
    router.refresh();
  }

  const field =
    "w-full rounded-xl border border-edge bg-ivory px-4 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-gold";

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      {isRegister && (
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold text-ink">Name</span>
          <input
            className={field}
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            autoComplete="name"
          />
        </label>
      )}
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-semibold text-ink">Email</span>
        <input
          className={field}
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
        />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-semibold text-ink">Password</span>
        <input
          className={field}
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 8 characters"
          autoComplete={isRegister ? "new-password" : "current-password"}
        />
      </label>

      {error && (
        <p className="rounded-lg bg-jp/10 px-3 py-2 text-sm text-jp">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="mt-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gold px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-gold-deep disabled:opacity-60"
      >
        {loading ? "Please wait…" : isRegister ? "Create account" : "Log in"}
        {!loading && <ArrowRight className="h-4 w-4" />}
      </button>

      <p className="text-center text-sm text-ink-soft">
        {isRegister ? "Already have an account? " : "New to Fluenta? "}
        <Link
          href={isRegister ? "/login" : "/register"}
          className="font-semibold text-gold-deep hover:underline"
        >
          {isRegister ? "Log in" : "Create one"}
        </Link>
      </p>
    </form>
  );
}
