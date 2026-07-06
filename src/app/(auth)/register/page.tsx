import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth/AuthForm";
import { getSession } from "@/lib/session";

export default async function RegisterPage() {
  if (await getSession()) redirect("/home");
  return (
    <>
      <h1 className="font-display text-2xl font-extrabold text-ink">Create your account</h1>
      <p className="mb-6 mt-1 text-sm text-ink-soft">Start learning 4 languages in one place.</p>
      <AuthForm mode="register" />
    </>
  );
}
