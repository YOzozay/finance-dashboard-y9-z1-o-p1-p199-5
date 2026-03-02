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

  const [extraMap, setExtraMap] = useState({});

  const [newDebt, setNewDebt] = useState({
    name: "",
    total_amount: "",
    monthly_due: "",
    due_day: 1,
  });

  const load = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await apiGet({ action: "getDebts" });

      if (Array.isArray(data)) {
        setDebts(data);

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

  const handleAddDebt = async () => {
    if (!newDebt.name.trim()) {
      alert("Please enter a debt name");
      return;
    }
    if (!newDebt.total_amount || Number(newDebt.total_amount) <= 0) {
      alert("Total amount must be greater than 0");
      return;
    }
    if (!newDebt.monthly_due || Number(newDebt.monthly_due) <= 0) {
      alert("Monthly due must be greater than 0");
      return;
    }
    const dueDay = Number(newDebt.due_day);
    if (isNaN(dueDay) || dueDay < 1 || dueDay > 31) {
      alert("Due day must be between 1 and 31");
      return;
    }

    try {
      await apiPost({
        action: "addDebt",
        ...newDebt,
        due_day: dueDay,
      });

      setNewDebt({
        name: "",
        total_amount: "",
        monthly_due: "",
        due_day: 1,
      });

      await load();
    } catch (err) {
      alert(err.message || "Add failed");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this debt?")) return;

    try {
      await apiPost({
        action: "deleteDebt",
        id,
      });

      await load();
    } catch {
      alert("Delete failed");
    }
  };

  const handlePay = async (debt) => {
    const input = prompt("Payment amount:", debt.monthly_due);
    if (input === null || input.trim() === "") return;

    const amount = Number(input);
    if (isNaN(amount) || amount <= 0) {
      alert("Invalid amount");
      return;
    }

    if (amount > Number(debt.remaining_amount)) {
      alert(`Amount exceeds remaining balance (${formatMoney(debt.remaining_amount)})`);
      return;
    }

    try {
      setPayingId(debt.id);

      await apiPost({
        action: "payDebt",
        debt_id: debt.id,
        amount,
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
    return <div className="p-6 text-[var(--color-danger)]">{error}</div>;

  return (
    <div className="space-y-8 pb-20 md:pb-0">
      <h1 className="text-2xl font-bold">Debt Manager</h1>

      {/* ===== ADD FORM ===== */}
      <div className="card space-y-4">
        <div className="font-semibold">Add Debt</div>

        <div className="grid md:grid-cols-2 gap-4">

          <div className="space-y-1">
            <label className="text-sm font-medium text-muted">
              Debt Name <span className="text-[var(--color-danger)]">*</span>
            </label>
            <input
              placeholder="e.g. Car Loan, Personal Loan"
              value={newDebt.name}
              onChange={(e) =>
                setNewDebt({ ...newDebt, name: e.target.value })
              }
              className="input-base"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-muted">
              Total Amount (฿) <span className="text-[var(--color-danger)]">*</span>
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="50000"
              value={newDebt.total_amount}
              onChange={(e) =>
                setNewDebt({ ...newDebt, total_amount: e.target.value })
              }
              className="input-base"
            />
            <div className="text-xs text-subtle">ยอดหนี้รวมทั้งหมด</div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-muted">
              Monthly Due (฿) <span className="text-[var(--color-danger)]">*</span>
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="5000"
              value={newDebt.monthly_due}
              onChange={(e) =>
                setNewDebt({ ...newDebt, monthly_due: e.target.value })
              }
              className="input-base"
            />
            <div className="text-xs text-subtle">ยอดที่ต้องจ่ายต่อเดือน</div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-muted">
              Due Day (1–31) <span className="text-[var(--color-danger)]">*</span>
            </label>
            <input
              type="number"
              min="1"
              max="31"
              value={newDebt.due_day}
              onChange={(e) =>
                setNewDebt({ ...newDebt, due_day: e.target.value })
              }
              className="input-base"
            />
            <div className="text-xs text-subtle">วันที่ครบกำหนดชำระในแต่ละเดือน</div>
          </div>

        </div>

        <button
          onClick={handleAddDebt}
          className="btn-primary-sm"
        >
          Add Debt
        </button>
      </div>

      {/* ===== LIST ===== */}
      {debts.length === 0 && (
        <div className="text-subtle">No debts found</div>
      )}

      <div className="grid gap-6">
        {debts.map((d) => {
          const paidAmount =
            Number(d.total_amount) -
            Number(d.remaining_amount);

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

              <div className="flex justify-between">
                <div>
                  <div className="font-semibold text-lg">
                    {d.name}
                  </div>
                  <div className="text-sm text-subtle">
                    Due every {d.due_day}
                  </div>
                  <div className="text-sm text-subtle">
                    Monthly Due: {formatMoney(d.monthly_due)}
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
                        handleExtraChange(d.id, e.target.value)
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

              <div className="flex justify-between items-center border-t pt-4">
                <div className="text-sm text-subtle">
                  Total: {formatMoney(d.total_amount)}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => handleDelete(d.id)}
                    className="btn-danger"
                  >
                    Delete
                  </button>

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

            </div>
          );
        })}
      </div>
    </div>
  );
}