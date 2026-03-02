"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiGet, apiPost } from "@/config/api";
import { formatMoney } from "@/lib/format";
import { getToday } from "@/lib/date";

export default function CreditPage() {
  const [cards, setCards] = useState([]);
  const [summary, setSummary] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [cardForm, setCardForm] = useState({
    name: "",
    credit_limit: "",
    closing_day: "",
    due_day: "",
  });

  const [txForm, setTxForm] = useState({
    card_id: "",
    type: "purchase",
    description: "",
    amount: "",
    transaction_date: getToday(),
    installment_months: 0,
  });

  const load = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await apiGet({ action: "getCreditSummary" });
      const safeData = Array.isArray(data) ? data : [];

      setSummary(safeData);
      setCards(safeData);
    } catch (err) {
      setError("Cannot load credit data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreateCard = async (e) => {
    e.preventDefault();

    try {
      await apiPost({ action: "createCreditCard", ...cardForm });
      setCardForm({ name: "", credit_limit: "", closing_day: "", due_day: "" });
      await load();
    } catch (err) {
      setError(err.message || "Failed to create card");
    }
  };

  const handleCreateTx = async (e) => {
    e.preventDefault();

    const months = Number(txForm.installment_months);
    if (isNaN(months) || months < 0) {
      setError("Installment months must be 0 or positive");
      return;
    }

    try {
      await apiPost({
        action: "createCreditTransaction",
        ...txForm,
        installment_months: months,
      });

      setTxForm({
        card_id: "",
        type: "purchase",
        description: "",
        amount: "",
        transaction_date: getToday(),
        installment_months: 0,
      });

      await load();
    } catch (err) {
      setError(err.message || "Failed to create transaction");
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="space-y-8 pb-20 md:pb-0">

      {error && (
        <div className="error-banner">{error}</div>
      )}

      {/* ================= Header ================= */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Credit Manager</h1>

        <Link
          href="/credit/installments"
          className="btn-primary-sm"
        >
          Manage Installments
        </Link>
      </div>

      {/* ================= Card List ================= */}
      <div className="grid gap-4">
        {summary.map((c) => (
          <div key={c.card_id} className="card space-y-2">
            <div className="flex justify-between">
              <div className="font-semibold">{c.name}</div>
              <div>
                {c.utilization_percent.toFixed(1)}%
              </div>
            </div>

            <div className="text-sm text-subtle">
              Limit: {formatMoney(c.credit_limit)}
            </div>

            <div className="text-sm text-subtle">
              Outstanding: {formatMoney(c.outstanding)}
            </div>

            <div className="progress-track">
              <div
                className="progress-fill bg-blue-600"
                style={{ width: `${c.utilization_percent}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* ================= Add Card ================= */}
      <div className="card space-y-4">
        <div className="font-semibold">Add Credit Card</div>

        <form onSubmit={handleCreateCard} className="grid gap-3">
          <div className="space-y-1">
            <label className="text-sm font-medium text-muted">
              Card Name <span className="text-[var(--color-danger)]">*</span>
            </label>
            <input
              className="input-base"
              placeholder="e.g. KBank Platinum"
              value={cardForm.name}
              onChange={(e) =>
                setCardForm({ ...cardForm, name: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-muted">
              Credit Limit (฿) <span className="text-[var(--color-danger)]">*</span>
            </label>
            <input
              className="input-base"
              type="number"
              min="0"
              placeholder="50000"
              value={cardForm.credit_limit}
              onChange={(e) =>
                setCardForm({ ...cardForm, credit_limit: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-muted">
              Closing Day (1–31) <span className="text-[var(--color-danger)]">*</span>
            </label>
            <input
              className="input-base"
              type="number"
              min="1"
              max="31"
              placeholder="25"
              value={cardForm.closing_day}
              onChange={(e) =>
                setCardForm({ ...cardForm, closing_day: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-muted">
              Payment Due Day (1–31) <span className="text-[var(--color-danger)]">*</span>
            </label>
            <input
              className="input-base"
              type="number"
              min="1"
              max="31"
              placeholder="15"
              value={cardForm.due_day}
              onChange={(e) =>
                setCardForm({ ...cardForm, due_day: e.target.value })
              }
              required
            />
          </div>

          <button className="btn-primary">
            Create Card
          </button>
        </form>
      </div>

      {/* ================= Add Transaction ================= */}
      <div className="card space-y-4">
        <div className="font-semibold">Add Transaction</div>

        <form onSubmit={handleCreateTx} className="grid gap-3">
          <div className="space-y-1">
            <label className="text-sm font-medium text-muted">
              Card <span className="text-[var(--color-danger)]">*</span>
            </label>
            <select
              className="select-base"
              value={txForm.card_id}
              onChange={(e) =>
                setTxForm({ ...txForm, card_id: e.target.value })
              }
              required
            >
              <option value="">Select card</option>
              {cards.map((c) => (
                <option key={c.card_id} value={c.card_id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-muted">
              Description <span className="text-[var(--color-danger)]">*</span>
            </label>
            <input
              className="input-base"
              placeholder="e.g. iPhone 16 Pro"
              value={txForm.description}
              onChange={(e) =>
                setTxForm({ ...txForm, description: e.target.value })
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
              value={txForm.amount}
              onChange={(e) =>
                setTxForm({ ...txForm, amount: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-muted">
              Transaction Date <span className="text-[var(--color-danger)]">*</span>
            </label>
            <input
              className="input-base"
              type="date"
              value={txForm.transaction_date}
              onChange={(e) =>
                setTxForm({ ...txForm, transaction_date: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-muted">
              Installment Months
            </label>
            <input
              className="input-base"
              type="number"
              min="0"
              placeholder="0"
              value={txForm.installment_months}
              onChange={(e) =>
                setTxForm({ ...txForm, installment_months: e.target.value })
              }
            />
            <div className="text-xs text-subtle">0 = จ่ายเต็มจำนวน, 3/6/10/12 = แบ่งผ่อน</div>
          </div>

          <button className="btn-primary">
            Create Transaction
          </button>
        </form>
      </div>
    </div>
  );
}