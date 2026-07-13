import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth/AuthForm";
import { getSession } from "@/lib/session";

export default async function LoginPage() {
  if (await getSession()) redirect("/home");
  return (
    <>
      <h1 className="font-display text-2xl font-extrabold text-ink">Selamat datang kembali</h1>
      <p className="mb-6 mt-1 text-sm text-ink-soft">Masuk untuk melanjutkan perjalananmu.</p>
      <AuthForm mode="login" />
    </>
  );
}
