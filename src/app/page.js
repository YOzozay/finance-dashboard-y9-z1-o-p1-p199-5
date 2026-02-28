"use client";

import { useEffect, useState } from "react";
import { API_BASE } from "@/config/api";
import { getCurrentPayMonth } from "@/lib/date";
import Input from "@/components/ui/Input";
import { formatMoney } from "@/lib/format";

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [payMonth, setPayMonth] = useState(getCurrentPayMonth());


useEffect(() => {

  setData(null);

  fetch(`${API_BASE}?action=summary&payMonth=${payMonth}`)
    .then(res => {
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    })
    .then(setData)
    .catch(err => {
      console.error(err);
      setError("Cannot load data");
    });

}, [payMonth]);


  if (error) return <div className="p-6">{error}</div>;
  if (!data) return <div className="p-6">Loading...</div>;

  return (
    <div className="space-y-6">

      <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="max-w-xs">
          <Input
            type="month"
            value={payMonth}
            onChange={(e) => setPayMonth(e.target.value)}
          />
        </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card title="Gross Income" value={data?.income?.grossIncome ?? 0} />
        <Card title="Net Income" value={data?.netIncome ?? 0} />
        <Card title="Net Balance" value={data?.netBalance ?? 0} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
          <h2 className="font-bold mb-4">Income Breakdown</h2>
          <ul className="space-y-2 text-sm">
            <li>Salary: {data?.income?.monthlySalary ?? 0}</li>
            <li>OT Pay: {data?.income?.otPay ?? 0}</li>
            <li>Meal Normal: {data?.income?.mealNormal ?? 0}</li>
            <li>Meal OT: {data?.income?.mealOt ?? 0}</li>
            <li>Fuel: {data?.income?.fuel ?? 0}</li>
          </ul>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
          <h2 className="font-bold mb-4">Expenses</h2>
          <div>Total: {data?.expenses?.totalExpenses ?? 0}</div>
        </div>

      </div>
    </div>
  );
}

function Card({ title, value }) {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
      <div className="text-sm text-gray-500 dark:text-gray-400">
        {title}
      </div>

      <div className="text-2xl font-semibold mt-2">
        {formatMoney(value)}
      </div>
    </div>
  );
}