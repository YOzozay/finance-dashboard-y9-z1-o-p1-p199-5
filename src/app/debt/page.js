"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPost } from "@/config/api";
import { formatMoney } from "@/lib/format";
import { calculateDebtProjection } from "@/lib/debtProjection";

export default function DebtPage() {
  const [debts, setDebts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [payingId, setPayingId] = useState(null);

  // เก็บ extra amount แยกตาม debt.id
  const [extraMap, setExtraMap] = useState({});

  const load = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await apiGet({ action: "getDebts" });

      if (Array.isArray(data)) {
        setDebts(data);

        // initialize extra amount = 2000 ต่อหนี้ (ครั้งแรกเท่านั้น)
        setExtraMap((prev) => {
          const updated = { ...prev };
          data.forEach((d) => {
            if (updated[d.id] === undefined) {
              updated[d.id] = 2000;
            }
          });
          return updated;
        });
      } else {
        setDebts([]);
      }
    } catch (err) {
      setError("Cannot load debts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handlePay = async (debt) => {
    const amount = prompt("Payment amount:");
    if (!amount) return;

    try {
      setPayingId(debt.id);

      await apiPost({
        action: "payDebt",
        debt_id: debt.id,
        amount: Number(amount),
      });

      await load();
    } catch (err) {
      alert(err.message || "Payment failed");
    } finally {
      setPayingId(null);
    }
  };

  const handleExtraChange = (id, value) => {
    setExtraMap((prev) => ({
      ...prev,
      [id]: Number(value) || 0,
    }));
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (error)
    return (
      <div className="p-6 text-[var(--color-danger)]">
        {error}
      </div>
    );

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <h1 className="text-2xl font-bold">Debt Manager</h1>

      {debts.length === 0 && (
        <div className="text-subtle">No debts found</div>
      )}

      <div className="grid gap-4">
        {debts.map((d) => {
          const paidAmount =
            Number(d.total_amount) - Number(d.remaining_amount);

          const progress =
            d.total_amount > 0
              ? (paidAmount / d.total_amount) * 100
              : 0;

          const progressColor =
            d.status === "closed"
              ? "bg-gray-400"
              : progress > 80
              ? "bg-green-500"
              : progress > 50
              ? "bg-yellow-500"
              : "bg-blue-600";

          const extraAmount = extraMap[d.id] ?? 0;

          const projection = calculateDebtProjection(
            d,
            extraAmount
          );

          return (
            <div key={d.id} className="card space-y-4">
              {/* Header */}
              <div className="flex justify-between">
                <div>
                  <div className="font-semibold text-lg">
                    {d.name}
                  </div>

                  <div className="text-sm text-subtle">
                    Due every {d.due_day}
                  </div>

                  <div className="text-sm text-subtle">
                    Monthly Due:{" "}
                    {formatMoney(d.monthly_due)}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm text-subtle">
                    Remaining
                  </div>
                  <div className="font-bold text-lg">
                    {formatMoney(d.remaining_amount)}
                  </div>
                </div>
              </div>

              {/* Progress */}
              <div className="space-y-1">
                <div className="progress-track">
                  <div
                    className={`progress-fill ${progressColor}`}
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <div className="text-xs text-subtle">
                  {progress.toFixed(1)}% paid
                </div>
              </div>

              {/* Projection Section */}
              {d.status !== "closed" && projection && (
                <div className="border-t pt-4 space-y-3">
                  <div className="text-sm font-semibold">
                    Debt Projection
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-sm text-subtle">
                      Extra per month:
                    </span>

                    <input
                      type="number"
                      min="0"
                      value={extraAmount}
                      onChange={(e) =>
                        handleExtraChange(
                          d.id,
                          e.target.value
                        )
                      }
                      className="input-base w-32"
                    />
                  </div>

                  <div className="text-sm text-subtle space-y-1">
                    <div>
                      Normal payoff:{" "}
                      <span className="font-medium">
                        {projection.normalMonths} months
                      </span>
                    </div>

                    <div>
                      With extra:{" "}
                      <span className="font-medium">
                        {projection.acceleratedMonths} months
                      </span>
                    </div>

                    <div className="font-semibold">
                      Saved: {projection.monthsSaved} months
                    </div>
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="flex justify-between items-center border-t pt-4">
                <div className="text-sm text-subtle">
                  Total: {formatMoney(d.total_amount)}
                </div>

                <button
                  disabled={
                    d.status === "closed" ||
                    payingId === d.id
                  }
                  onClick={() => handlePay(d)}
                  className="btn-primary-sm"
                >
                  {d.status === "closed"
                    ? "Closed"
                    : payingId === d.id
                    ? "Processing..."
                    : "Pay"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}