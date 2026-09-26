"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/lib/actions";
import { useLocale } from "@/components/i18n/LocaleProvider";

export function AdminHeader({ name }: { name: string }) {
  const { t } = useLocale();
  const path = usePathname();
  const nav = [
    { href: "/admin", label: t.adminNavInbox },
    { href: "/admin/questionnaires", label: t.adminNavSurveys },
    { href: "/admin/stories", label: t.adminNavStories },
    { href: "/admin/export", label: t.adminNavExport },
    { href: "/admin/users", label: t.adminNavPeople },
  ];

  return (
    <header className="sticky top-0 z-10 bg-[#3a2718] text-[#fff3d6]">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3">
        <div>
          <p className="text-sm text-[#f0b429]">{t.adminMorning}</p>
          <p className="text-xl font-extrabold">{name}</p>
        </div>
        <nav className="flex flex-wrap gap-1 rounded-full bg-[#fff3d6]/10 p-1">
          {nav.map((item) => {
            const on = item.href === "/admin" ? path === "/admin" : path.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-3 py-1.5 text-sm font-medium ${
                  on ? "bg-[#f0b429] text-[#3a2718]" : "text-[#fff3d6] hover:bg-[#fff3d6]/10"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-4">
          <form action={logoutAction}>
            <button className="text-sm text-[#e0b67a] hover:text-[#fff3d6]">{t.adminLogout}</button>
          </form>
        </div>
      </div>
    </header>
  );
}
