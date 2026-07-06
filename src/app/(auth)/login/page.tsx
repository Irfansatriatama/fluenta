import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth/AuthForm";
import { getSession } from "@/lib/session";

export default async function LoginPage() {
  if (await getSession()) redirect("/home");
  return (
    <>
      <h1 className="font-display text-2xl font-extrabold text-ink">Welcome back</h1>
      <p className="mb-6 mt-1 text-sm text-ink-soft">Log in to continue your journey.</p>
      <AuthForm mode="login" />
    </>
  );
}
