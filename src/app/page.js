"use client";

import { useEffect, useState } from "react";

const API =
  "https://script.google.com/macros/s/AKfycbz6G10M9-e2kFYaC6E2wek-tr8a1xJkewtlLbrrxEpvFBqOSl1AAZBTTJcYGkxuybAF/exec";

export default function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const today = new Date();
    const payMonth = today.toISOString().slice(0, 7);

    fetch(`${API}?action=summary&payMonth=${payMonth}`)
      .then((res) => res.json())
      .then(setData);
  }, []);

  if (!data) return <div>Loading...</div>;

return (
  <div className="space-y-6">
    <h1 className="text-2xl font-bold">Dashboard</h1>

    {/* Top Cards */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card title="Gross Income" value={data.income.grossIncome} />
      <Card title="Net Income" value={data.netIncome} />
      <Card title="Net Balance" value={data.netBalance} />
    </div>

    {/* Breakdown Section */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

      {/* Income Breakdown */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="font-bold mb-4">Income Breakdown</h2>
        <ul className="space-y-2 text-sm">
          <li>Salary: {data.income.monthlySalary}</li>
          <li>OT Pay: {data.income.otPay}</li>
          <li>Meal Normal: {data.income.mealNormal}</li>
          <li>Meal OT: {data.income.mealOt}</li>
          <li>Fuel: {data.income.fuel}</li>
        </ul>
      </div>

      {/* Expense Breakdown */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="font-bold mb-4">Expenses</h2>
        <div>Total: {data.expenses.totalExpenses}</div>
      </div>

    </div>
  </div>
);
}



function Card({ title, value }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <div className="text-gray-500">{title}</div>
      <div className="text-2xl font-bold">
        {Number(value).toLocaleString()}
      </div>
    </div>
  );
}

