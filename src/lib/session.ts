import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

// Server-side session accessor for Better Auth.
export async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}

// Use in protected layouts/pages — redirects to /login when signed out.
export async function requireSession() {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}
