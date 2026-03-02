"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNav() {
  const pathname = usePathname();

  const items = [
    { href: "/", label: "Home" },
    { href: "/worklog", label: "OT" },
    { href: "/expenses", label: "Expense" },
    { href: "/debt", label: "Debt" },
    { href: "/credit", label: "Credit"},
    { href: "/fixed", label: "Fixed" },
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