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

      setSummary(data);
      setCards(data);
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

    await apiPost({
      action: "createCreditCard",
      ...cardForm,
    });

    setCardForm({
      name: "",
      credit_limit: "",
      closing_day: "",
      due_day: "",
    });

    await load();
  };

  const handleCreateTx = async (e) => {
    e.preventDefault();

    await apiPost({
      action: "createCreditTransaction",
      ...txForm,
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
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-[var(--color-danger)]">{error}</div>;

  return (
    <div className="space-y-8 pb-20 md:pb-0">

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
          <input
            className="input-base"
            placeholder="Card name"
            value={cardForm.name}
            onChange={(e) =>
              setCardForm({ ...cardForm, name: e.target.value })
            }
            required
          />

          <input
            className="input-base"
            type="number"
            placeholder="Credit limit"
            value={cardForm.credit_limit}
            onChange={(e) =>
              setCardForm({
                ...cardForm,
                credit_limit: e.target.value,
              })
            }
            required
          />

          <input
            className="input-base"
            type="number"
            placeholder="Closing day"
            value={cardForm.closing_day}
            onChange={(e) =>
              setCardForm({
                ...cardForm,
                closing_day: e.target.value,
              })
            }
            required
          />

          <input
            className="input-base"
            type="number"
            placeholder="Due day"
            value={cardForm.due_day}
            onChange={(e) =>
              setCardForm({
                ...cardForm,
                due_day: e.target.value,
              })
            }
            required
          />

          <button className="btn-primary">
            Create Card
          </button>
        </form>
      </div>

      {/* ================= Add Transaction ================= */}
      <div className="card space-y-4">
        <div className="font-semibold">Add Transaction</div>

        <form onSubmit={handleCreateTx} className="grid gap-3">
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

          <input
            className="input-base"
            placeholder="Description"
            value={txForm.description}
            onChange={(e) =>
              setTxForm({
                ...txForm,
                description: e.target.value,
              })
            }
            required
          />

          <input
            className="input-base"
            type="number"
            placeholder="Amount"
            value={txForm.amount}
            onChange={(e) =>
              setTxForm({
                ...txForm,
                amount: e.target.value,
              })
            }
            required
          />

          <input
            className="input-base"
            type="date"
            value={txForm.transaction_date}
            onChange={(e) =>
              setTxForm({
                ...txForm,
                transaction_date: e.target.value,
              })
            }
          />

          <input
            className="input-base"
            type="number"
            placeholder="Installment months (0 = no installment)"
            value={txForm.installment_months}
            onChange={(e) =>
              setTxForm({
                ...txForm,
                installment_months: e.target.value,
              })
            }
          />

          <button className="btn-primary">
            Create Transaction
          </button>
        </form>
      </div>
    </div>
  );
}