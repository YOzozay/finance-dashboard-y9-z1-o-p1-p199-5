"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
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
    <div className="h-full p-6 bg-[var(--color-bg-nav)] border-r border-[var(--color-border-nav)]">
      <h1 className="text-xl font-bold mb-6">Finance</h1>

      <nav className="space-y-2">
        {items.map(item => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-4 py-2 rounded-lg transition ${
                active
                  ? "nav-link-active"
                  : "nav-link-inactive"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}