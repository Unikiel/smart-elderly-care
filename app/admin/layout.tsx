import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  return (
    <div className="theme-staff min-h-dvh">
      <AdminHeader name={user.name} />
      <div className="mx-auto max-w-6xl px-5 py-6">{children}</div>
    </div>
  );
}
