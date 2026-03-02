"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPost } from "@/config/api";
import { formatMoney } from "@/lib/format";

export default function InstallmentPage() {
  const [installments, setInstallments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState(null);
  const [error, setError] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await apiGet({ action: "getInstallments" });
      setInstallments(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Cannot load installments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handlePay = async (inst) => {
    try {
      setPayingId(inst.id);

      await apiPost({
        action: "payCreditInstallment",
        installment_id: inst.id,
      });

      await load();
    } catch (err) {
      alert("Payment failed");
    } finally {
      setPayingId(null);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-[var(--color-danger)]">{error}</div>;

  const unpaid = installments.filter(i => i.status === "unpaid");
  const paid = installments.filter(i => i.status === "paid");

  const totalUnpaid = unpaid.reduce(
    (sum, i) => sum + (Number(i.amount) || 0),
    0
  );

  return (
    <div className="space-y-8 pb-20 md:pb-0">
      <h1 className="text-2xl font-bold">Installments</h1>

      {/* Summary */}
      <div className="card">
        <div className="text-sm text-subtle">
          Total Unpaid
        </div>
        <div className="text-xl font-semibold mt-2">
          {formatMoney(totalUnpaid)}
        </div>
      </div>

      {/* Unpaid Section */}
      <div className="card space-y-4">
        <div className="font-semibold">
          Unpaid Installments
        </div>

        {unpaid.length === 0 && (
          <div className="text-subtle">
            No unpaid installments
          </div>
        )}

        {unpaid.map(inst => (
          <div
            key={inst.id}
            className="flex justify-between items-center border-t pt-3"
          >
            <div>
              <div className="font-medium">
                Due: {inst.due_date}
              </div>
              <div className="text-subtle text-sm">
                Installment #{inst.installment_no}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="font-medium">
                {formatMoney(inst.amount)}
              </div>

              <button
                className="btn-primary-sm"
                disabled={payingId === inst.id}
                onClick={() => handlePay(inst)}
              >
                {payingId === inst.id ? "Processing..." : "Pay"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Paid Section */}
      <div className="card space-y-4">
        <div className="font-semibold">
          Paid Installments
        </div>

        {paid.length === 0 && (
          <div className="text-subtle">
            No paid installments
          </div>
        )}

        {paid.map(inst => (
          <div
            key={inst.id}
            className="flex justify-between border-t pt-3 text-subtle"
          >
            <div>
              {inst.due_date} — Installment #{inst.installment_no}
            </div>
            <div>
              {formatMoney(inst.amount)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}