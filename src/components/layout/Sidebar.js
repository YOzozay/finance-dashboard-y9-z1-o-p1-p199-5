"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  const items = [
    { href: "/", label: "Dashboard" },
    { href: "/worklog", label: "Worklog" },
    { href: "/expenses", label: "Expenses" },
    { href: "/fixed", label: "Fixed" },
    { href: "/settings", label: "Settings" },
  ];

  return (
    <div className="h-full p-6 bg-white dark:bg-[#0f172a] border-r border-gray-200 dark:border-gray-800">
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
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md"
                  : "hover:bg-gray-200 dark:hover:bg-gray-800"
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