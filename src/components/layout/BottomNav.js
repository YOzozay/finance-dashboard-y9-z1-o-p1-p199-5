"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNav() {
  const pathname = usePathname();

  const items = [
    { href: "/", label: "Dashboard" },
    { href: "/payments", label: "Payments" },
    { href: "/worklog", label: "Worklog" },
    { href: "/expenses", label: "Expenses" },
    { href: "/debt", label: "Debt" },
    { href: "/credit", label: "Credit" },
    { href: "/fixed", label: "Fixed" },
    { href: "/settings", label: "Settings" },
  ];


  return (
    <div className="bg-[var(--color-bg-nav)] border-t border-[var(--color-border-nav)]">
      <div className="flex justify-around py-3 text-sm">
        {items.map(item => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`transition-colors ${
                active
                  ? "text-[var(--color-primary-active)]"
                  : "text-[var(--color-text-muted)]"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}