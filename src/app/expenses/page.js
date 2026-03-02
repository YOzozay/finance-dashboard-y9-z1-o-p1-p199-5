"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPost } from "@/config/api";
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
    note: "",
  });

  // ======================
  // LOAD META
  // ======================
  useEffect(() => {
    let ignore = false;

    async function loadMeta() {
      try {
        const data = await apiGet({ action: "getExpenseMeta" });
        if (!ignore) {
          setCategories(data?.categories ?? []);
          setPaymentMethods(data?.paymentMethods ?? []);
        }
      } catch (err) {
        console.error(err);
      }
    }

    loadMeta();
    return () => (ignore = true);
  }, []);

  // ======================
  // LOAD EXPENSES
  // ======================
  const loadExpenses = async () => {
    try {
      setLoadingList(true);
      setError(null);

      const data = await apiGet({
        action: "getExpenses",
        payMonth,
      });

      setExpenses(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Cannot load expenses");
      setExpenses([]);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    loadExpenses();
  }, [payMonth]);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setError(null);

    const tempId = `temp_${Date.now()}`;
    const optimisticItem = {
      id: tempId,
      date: form.date,
      category: form.category,
      amount: Number(form.amount) || 0,
      payment_method: form.payment_method,
      note: form.note,
    };

    setExpenses((prev) => [optimisticItem, ...prev]);
    setForm({ date: getToday(), category: "", amount: "", payment_method: "", note: "" });
    setSubmitting(true);

    try {
      await apiPost({ action: "addExpense", ...optimisticItem });
      await loadExpenses();
    } catch (err) {
      setExpenses((prev) => prev.filter((e) => e.id !== tempId));
      setForm(optimisticItem);
      setError("Error saving expense");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this expense?")) return;

    const snapshot = expenses.find((e) => e.id === id);
    setExpenses((prev) => prev.filter((e) => e.id !== id));

    try {
      await apiPost({ action: "deleteExpense", id });
    } catch (err) {
      if (snapshot) setExpenses((prev) => [...prev, snapshot]);
      setError("Error deleting expense");
    }
  };

  const total = expenses.reduce(
    (sum, e) => sum + (Number(e.amount) || 0),
    0
  );

  return (
    <div className="space-y-8 pb-20 md:pb-0">
      <h1 className="text-2xl font-bold">Expenses</h1>

      {error && (
        <div className="error-banner">
          {error}
        </div>
      )}

      {/* Month Selector */}
      <div className="max-w-xs space-y-1">
        <label className="text-sm font-medium text-muted">Pay Month</label>
        <Input
          type="month"
          value={payMonth}
          onChange={(e) => setPayMonth(e.target.value)}
          disabled={submitting}
        />
      </div>

      {/* Add Form */}
      <form
        onSubmit={handleAdd}
        className="form-card grid md:grid-cols-2 gap-4"
      >
        {/* Row 1: Date | Amount */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-muted">
            Date <span className="text-[var(--color-danger)]">*</span>
          </label>
          <Input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            disabled={submitting}
            required
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-muted">
            Amount (฿) <span className="text-[var(--color-danger)]">*</span>
          </label>
          <Input
            type="number"
            step="0.01"
            min="0"
            name="amount"
            placeholder="0.00"
            value={form.amount}
            onChange={handleChange}
            disabled={submitting}
            required
          />
        </div>

        {/* Row 2: Category | Payment Method */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-muted">
            Category <span className="text-[var(--color-danger)]">*</span>
          </label>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            required
            disabled={submitting}
            className="select-base"
          >
            <option value="">Select category</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-muted">Payment Method</label>
          <select
            name="payment_method"
            value={form.payment_method}
            onChange={handleChange}
            disabled={submitting}
            className="select-base"
          >
            <option value="">Select payment method</option>
            {paymentMethods.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        {/* Row 3: Note (full width) */}
        <div className="space-y-1 md:col-span-2">
          <label className="text-sm font-medium text-muted">Note</label>
          <Input
            name="note"
            placeholder="Optional note"
            value={form.note}
            onChange={handleChange}
            disabled={submitting}
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="col-span-full btn-submit"
        >
          {submitting ? "Saving..." : "Add Expense"}
        </button>
      </form>

      {/* Table */}
      <div className="card-overflow">
        <table className="w-full text-sm">
          <thead className="table-head">
            <tr>
              <th className="py-3 px-4 text-left">Date</th>
              <th className="py-3 px-4 text-left">Category</th>
              <th className="py-3 px-4 text-right">Amount</th>
              <th className="py-3 px-4 text-right"></th>
            </tr>
          </thead>

          <tbody>
            {!loadingList && expenses.length === 0 && (
              <tr>
                <td
                  colSpan="4"
                  className="py-6 text-center text-subtle"
                >
                  No expenses found for this period
                </td>
              </tr>
            )}

            {expenses.map((item) => (
              <tr
                key={item.id}
                className="table-row"
              >
                <td className="py-3 px-4">{item.date}</td>
                <td className="py-3 px-4">{item.category}</td>
                <td className="py-3 px-4 text-right font-medium">
                  {formatMoney(item.amount)}
                </td>
                <td className="py-3 px-4 text-right">
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="btn-danger"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {expenses.length > 0 && (
          <div className="table-footer px-4 py-4 text-right font-semibold">
            Total: {formatMoney(total)}
          </div>
        )}
      </div>
    </div>
  );
}