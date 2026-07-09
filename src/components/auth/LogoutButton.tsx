"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { authClient } from "@/lib/auth-client";

export function LogoutButton({
  className = "",
  label = "Log out",
}: {
  className?: string;
  label?: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function onClick() {
    setPending(true);
    await authClient.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      onClick={onClick}
      disabled={pending}
      className={className || "inline-flex items-center gap-2 rounded-xl border border-edge bg-paper px-4 py-2 text-sm font-semibold text-ink transition-colors hover:border-jp/50 hover:text-jp disabled:opacity-60"}
    >
      <LogOut className="h-4 w-4" />
      {pending ? "Signing out…" : label}
    </button>
  );
}
