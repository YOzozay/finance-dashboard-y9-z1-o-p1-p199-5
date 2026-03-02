"use client";

import { useEffect, useState } from "react";
import { API_BASE } from "@/config/api";
import { formatMoney } from "@/lib/format";
import Input from "@/components/ui/Input";
import { getToday, getCurrentPayMonth } from "@/lib/date";

export default function ExpensesPage() {

  const [payMonth, setPayMonth] = useState(getCurrentPayMonth());
  const [expenses, setExpenses] = useState([]);

  const [categories, setCategories] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);

  const [loadingList, setLoadingList] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    date: getToday(),
    category: "",
    amount: "",
    payment_method: "",
    note: ""
  });

  // ======================
  // LOAD META (Dropdown Data)
  // ======================
  useEffect(() => {
    fetch(`${API_BASE}?action=getExpenseMeta`)
      .then(res => res.json())
      .then(data => {
        if (data.categories) setCategories(data.categories);
        if (data.paymentMethods) setPaymentMethods(data.paymentMethods);
      })
      .catch(err => {
        console.error("Meta load error:", err);
      });
  }, []);

  // ======================
  // LOAD EXPENSES
  // ======================
  const loadExpenses = async () => {
    try {
      setLoadingList(true);
      setError(null);

      const res = await fetch(
        `${API_BASE}?action=getExpenses&payMonth=${payMonth}`
      );

      if (!res.ok) throw new Error("Failed to load expenses");

      const data = await res.json();

      if (data.error) throw new Error(data.error);

      if (Array.isArray(data)) {
        setExpenses(data);
      } else {
        setExpenses([]);
      }

    } catch (err) {
      console.error(err);
      setError(err.message || "Cannot load expenses");
      setExpenses([]);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    loadExpenses();
  }, [payMonth]);

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
      setSubmitting(true);
      setError(null);

      const res = await fetch(API_BASE, {
        method: "POST",
        body: JSON.stringify({
          action: "addExpense",
          ...form
        })
      });

      if (!res.ok) throw new Error("Failed to add expense");

      const result = await res.json();
      if (result.error) throw new Error(result.error);

      setForm({
        date: getToday(),
        category: "",
        amount: "",
        payment_method: "",
        note: ""
      });

      await loadExpenses();

    } catch (err) {
      console.error(err);
      setError(err.message || "Error saving expense");
    } finally {
      setSubmitting(false);
    }
  };

  // ======================
  // DELETE EXPENSE
  // ======================
  const handleDelete = async (id) => {
    if (!confirm("Delete this expense?")) return;

    try {
      setSubmitting(true);
      setError(null);

      const res = await fetch(API_BASE, {
        method: "POST",
        body: JSON.stringify({
          action: "deleteExpense",
          id
        })
      });

      if (!res.ok) throw new Error("Failed to delete expense");

      const result = await res.json();
      if (result.error) throw new Error(result.error);

      await loadExpenses();

    } catch (err) {
      console.error(err);
      setError(err.message || "Error deleting expense");
    } finally {
      setSubmitting(false);
    }
  };

  const total = expenses.reduce(
    (sum, e) => sum + (Number(e.amount) || 0),
    0
  );

  return (
    <div className="space-y-8">

      <h1 className="text-2xl font-bold">Expenses</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Month Selector */}
      <div className="max-w-xs">
        <Input
          type="month"
          value={payMonth}
          onChange={(e) => setPayMonth(e.target.value)}
          disabled={submitting}
        />
      </div>

      {/* Add Form */}
      <form onSubmit={handleAdd} className="grid md:grid-cols-2 gap-4">

        <Input
          type="date"
          name="date"
          value={form.date}
          onChange={handleChange}
          disabled={submitting}
          required
        />

        {/* Category Dropdown */}
        <select
          name="category"
          value={form.category}
          onChange={handleChange}
          required
          disabled={submitting}
          className="border rounded px-3 py-2"
        >
          <option value="">Select category</option>
          {categories.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <Input
          type="number"
          step="0.01"
          min="0"
          name="amount"
          placeholder="Amount"
          value={form.amount}
          onChange={handleChange}
          disabled={submitting}
          required
        />

        {/* Payment Dropdown */}
        <select
          name="payment_method"
          value={form.payment_method}
          onChange={handleChange}
          disabled={submitting}
          className="border rounded px-3 py-2"
        >
          <option value="">Select payment method</option>
          {paymentMethods.map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>

        <Input
          name="note"
          placeholder="Note"
          value={form.note}
          onChange={handleChange}
          disabled={submitting}
        />

        <button
          type="submit"
          disabled={submitting}
          className="col-span-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition disabled:bg-gray-400"
        >
          {submitting ? "Saving..." : "Add Expense"}
        </button>
      </form>

      {/* Loading */}
      {loadingList && (
        <div className="text-center text-gray-500">
          Loading...
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead className="border-b bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="py-2 px-2 text-left">Date</th>
              <th className="py-2 px-2 text-left">Category</th>
              <th className="py-2 px-2 text-right">Amount</th>
              <th className="py-2 px-2 text-right"></th>
            </tr>
          </thead>

          <tbody>
            {!loadingList && expenses.length === 0 && (
              <tr>
                <td colSpan="4" className="py-4 text-center text-gray-500">
                  No expenses found for this period
                </td>
              </tr>
            )}

            {expenses.map(item => (
              <tr key={item.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                <td className="py-2 px-2">{item.date}</td>
                <td>{item.category}</td>
                <td className="text-right">
                  {formatMoney(item.amount)}
                </td>
                <td className="text-right">
                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    disabled={submitting}
                    className="text-red-500 hover:text-red-700 disabled:text-gray-400"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Total */}
      {expenses.length > 0 && (
        <div className="text-right font-semibold">
          Total: {formatMoney(total)}
        </div>
      )}

    </div>
  );
}