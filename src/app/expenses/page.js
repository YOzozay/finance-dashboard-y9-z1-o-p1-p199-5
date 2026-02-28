"use client";

import { useEffect, useState } from "react";
import { API_BASE } from "@/config/api";
import { formatMoney } from "@/lib/format";
import Input from "@/components/ui/Input";
import { getToday, getCurrentPayMonth } from "@/lib/date";

export default function ExpensesPage() {

  const [month, setMonth] = useState(getCurrentPayMonth());
  const [expenses, setExpenses] = useState([]);
  const [form, setForm] = useState({
    date: getToday(),
    category: "",
    amount: "",
    payment_method: "",
    note: ""
  });

  // ======================
  // LOAD EXPENSES
  // ======================
  const loadExpenses = async () => {
    try {
      const res = await fetch(
        `${API_BASE}?action=getExpenses&payMonth=${month}`
      );

      const data = await res.json();

      if (Array.isArray(data)) {
        setExpenses(data);
      } else {
        console.error("Invalid expenses response:", data);
        setExpenses([]);
      }

    } catch (err) {
      console.error(err);
      setExpenses([]);
    }
  };

  useEffect(() => {
    loadExpenses();
  }, [month]);

  // ======================
  // FORM CHANGE
  // ======================
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ======================
  // ADD EXPENSE
  // ======================
  const handleAdd = async (e) => {
    e.preventDefault();

    try {
      await fetch(API_BASE, {
        method: "POST",

        body: JSON.stringify({
          action: "addExpense",
          ...form
        })
      });

      setForm({
        date: getToday(),
        category: "",
        amount: "",
        payment_method: "",
        note: ""
      });

      loadExpenses();

    } catch (err) {
      console.error(err);
      alert("Error saving expense");
    }
  };

  // ======================
  // DELETE EXPENSE
  // ======================
  const handleDelete = async (id) => {
    if (!confirm("Delete this expense?")) return;

    try {
      await fetch(API_BASE, {
        method: "POST",

        body: JSON.stringify({
          action: "deleteExpense",
          id
        })
      });

      loadExpenses();

    } catch (err) {
      console.error(err);
      alert("Error deleting expense");
    }
  };

  // ======================
  // TOTAL SAFE CALC
  // ======================
  const total = Array.isArray(expenses)
    ? expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0)
    : 0;

  return (
    <div className="space-y-8">

      <h1 className="text-2xl font-bold">Expenses</h1>

      {/* FILTER */}
      <div className="max-w-xs">
        <Input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
        />
      </div>

      {/* ADD FORM */}
      <form onSubmit={handleAdd} className="grid md:grid-cols-2 gap-4">

        <Input
          type="date"
          name="date"
          value={form.date}
          onChange={handleChange}
          required
        />

        <Input
          name="category"
          placeholder="Category"
          value={form.category}
          onChange={handleChange}
          required
        />

        <Input
          type="number"
          name="amount"
          placeholder="Amount"
          value={form.amount}
          onChange={handleChange}
          required
        />

        <Input
          name="payment_method"
          placeholder="Payment Method"
          value={form.payment_method}
          onChange={handleChange}
        />

        <Input
          name="note"
          placeholder="Note"
          value={form.note}
          onChange={handleChange}
        />

        <button
          type="submit"
          className="col-span-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          Add Expense
        </button>
      </form>

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b">
            <tr>
              <th className="text-left py-2">Date</th>
              <th className="text-left py-2">Category</th>
              <th className="text-right py-2">Amount</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {expenses.map(item => (
              <tr key={item.id} className="border-b">
                <td className="py-2">{item.date}</td>
                <td>{item.category}</td>
                <td className="text-right">
                  {formatMoney(item.amount)}
                </td>
                <td className="text-right">
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="text-right font-semibold">
        Total: {formatMoney(total)}
      </div>

    </div>
  );
}