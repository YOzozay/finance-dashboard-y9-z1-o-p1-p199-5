"use client";

import Link from "next/link";

export default function Sidebar() {
  return (
    <div className="h-screen bg-white shadow p-6 space-y-6">
      <h2 className="text-xl font-bold">Finance</h2>

      <nav className="space-y-3">
        <NavItem href="/">Dashboard</NavItem>
        <NavItem href="/worklog">Worklog</NavItem>
        <NavItem href="/expenses">Expenses</NavItem>
        <NavItem href="/fixed">Fixed</NavItem>
        <NavItem href="/settings">Settings</NavItem>
      </nav>
    </div>
  );
}

function NavItem({ href, children }) {
  return (
    <Link
      href={href}
      className="block px-3 py-2 rounded-lg hover:bg-gray-100"
    >
      {children}
    </Link>
  );
}