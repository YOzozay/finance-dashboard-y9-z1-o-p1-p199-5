"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNav() {
  const pathname = usePathname();

  const items = [
    { href: "/", label: "Home" },
    { href: "/worklog", label: "OT" },
    { href: "/expenses", label: "Expense" },
    { href: "/fixed", label: "Fixed" },
  ];

  return (
    <div className="bg-white dark:bg-[#111827] border-t border-gray-200 dark:border-gray-800">
      <div className="flex justify-around py-3 text-sm">
        {items.map(item => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`transition-colors ${
                active
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-gray-600 dark:text-gray-400"
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