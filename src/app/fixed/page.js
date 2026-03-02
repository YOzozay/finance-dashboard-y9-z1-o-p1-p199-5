"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPost } from "@/config/api";
import { formatMoney } from "@/lib/format";

export default function FixedPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    name: "",
    amount: "",
    start_date: "",
    end_date: ""
  });

  // =============================
  // LOAD
  // =============================
  const load = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await apiGet({ action: "getFixedList" });

      if (Array.isArray(data)) {
        setItems(data);
      } else {
        setItems([]);
      }
    } catch (err) {
      setError("Cannot load fixed expenses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // =============================
  // ADD
  // =============================
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      setError(null);

      await apiPost({
        action: "addFixedExpense",
        ...form
      });

      setForm({
        name: "",
        amount: "",
        start_date: "",
        end_date: ""
      });

      await load();
    } catch (err) {
      setError(err.message || "Error saving");
    } finally {
      setSubmitting(false);
    }
  };

  // =============================
  // DELETE
  // =============================
  const handleDelete = async (id) => {
    if (!confirm("Delete this fixed expense?")) return;

    try {
      setSubmitting(true);
      await apiPost({
        action: "deleteFixedExpense",
        id
      });
      await load();
    } finally {
      setSubmitting(false);
    }
  };

  // =============================
  // TOGGLE
  // =============================
  const handleToggle = async (id) => {
    try {
      setSubmitting(true);
      await apiPost({
        action: "toggleFixedExpense",
        id
      });
      await load();
    } finally {
      setSubmitting(false);
    }
  };

  // =============================
  // SUMMARY
  // =============================
  const totalActive = items
    .filter(i => i.active)
    .reduce((sum, i) => sum + (Number(i.amount) || 0), 0);

  return (
    <div className="space-y-8 pb-20 md:pb-0">
      <h1 className="text-2xl font-bold">Fixed Expenses</h1>

      {error && (
        <div className="error-banner">{error}</div>
      )}

      {/* ================= SUMMARY ================= */}
      <div className="card">
        <div className="text-subtle text-sm">Total Active / Month</div>
        <div className="text-2xl font-bold">
          {formatMoney(totalActive)}
        </div>
      </div>

      {/* ================= ADD FORM ================= */}
      <div className="card space-y-4">
        <div className="font-semibold">Add Fixed Expense</div>

        <form onSubmit={handleSubmit} className="grid gap-4">

          <div className="space-y-1">
            <label className="text-sm font-medium text-muted">
              Name <span className="text-[var(--color-danger)]">*</span>
            </label>
            <input
              className="input-base"
              placeholder="e.g. Internet, Rent"
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-muted">
              Amount (฿) <span className="text-[var(--color-danger)]">*</span>
            </label>
            <input
              className="input-base"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={form.amount}
              onChange={(e) =>
                setForm({ ...form, amount: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-muted">
              Effective From <span className="text-[var(--color-danger)]">*</span>
            </label>
            <input
              className="input-base"
              type="date"
              value={form.start_date}
              onChange={(e) =>
                setForm({ ...form, start_date: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-muted">
              End Date{" "}
              <span className="text-xs font-normal text-subtle">(optional — leave blank if ongoing)</span>
            </label>
            <input
              className="input-base"
              type="date"
              value={form.end_date}
              onChange={(e) =>
                setForm({ ...form, end_date: e.target.value })
              }
            />
          </div>

          <button
            disabled={submitting}
            className="btn-primary"
          >
            {submitting ? "Saving..." : "Add"}
          </button>
        </form>
      </div>

      {/* ================= TABLE ================= */}
      <div className="card-overflow">
        <table className="w-full text-sm">
          <thead className="table-head">
            <tr>
              <th className="py-3 px-4 text-left">Name</th>
              <th className="py-3 px-4 text-right">Amount</th>
              <th className="py-3 px-4 text-center">Active</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>

          <tbody>
            {!loading && items.length === 0 && (
              <tr>
                <td
                  colSpan="4"
                  className="py-6 text-center text-subtle"
                >
                  No fixed expenses
                </td>
              </tr>
            )}

            {items.map(item => (
              <tr key={item.id} className="table-row">
                <td className="py-3 px-4">
                  {item.name}
                </td>

                <td className="py-3 px-4 text-right">
                  {formatMoney(item.amount)}
                </td>

                <td className="py-3 px-4 text-center">
                  <button
                    onClick={() => handleToggle(item.id)}
                    className={
                      item.active
                        ? "text-[var(--color-success)]"
                        : "text-subtle"
                    }
                    disabled={submitting}
                  >
                    {item.active ? "Active" : "Inactive"}
                  </button>
                </td>

                <td className="py-3 px-4 text-right">
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="btn-danger"
                    disabled={submitting}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}