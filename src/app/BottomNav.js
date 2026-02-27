"use client";

import Link from "next/link";

export default function BottomNav() {
  return (
    <div className="bg-white shadow-inner p-3 flex justify-around">
      <Link href="/">Home</Link>
      <Link href="/worklog">OT</Link>
      <Link href="/expenses">Expense</Link>
      <Link href="/fixed">Fixed</Link>
    </div>
  );
}