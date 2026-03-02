"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiGet, apiPost } from "@/config/api";
import { formatMoney } from "@/lib/format";

export default function InstallmentsPage() {
  const router = useRouter();
  const [installments, setInstallments] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const handleCancel = async (txId) => {
    if (!confirm("Cancel this transaction? This cannot be undone.")) return;

    try {
      await apiPost({
        action: "cancelCreditTransaction",
        transaction_id: txId,
      });
      await load();
    } catch (err) {
      alert(err.message || "Cancel failed");
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  const grouped = {};

  installments.forEach(inst => {
    if (!grouped[inst.transaction_id]) {
      grouped[inst.transaction_id] = [];
    }
    grouped[inst.transaction_id].push(inst);
  });

  return (
    <div className="space-y-6 pb-20 md:pb-0">

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Manage Installments</h1>
        <button
          onClick={() => router.back()}
          className="btn-primary-sm"
        >
          ← Back
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {Object.entries(grouped).map(([txId, items]) => {

        const first = items[0];

        const total = first.total_amount;

        const paid = items.filter(i => i.status === "paid").length;
        const remaining = items.filter(i => i.status === "unpaid").length;

        const unpaidAmount = items
          .filter(i => i.status === "unpaid")
          .reduce((sum, i) => sum + i.amount, 0);

        const progress =
          first.months > 0
            ? (paid / first.months) * 100
            : 0;

        return (
          <div key={txId} className="card space-y-4">

            <div className="flex justify-between">

              <div>
                <div className="font-semibold text-lg">
                  {first.description}
                </div>

                <div className="text-sm text-subtle">
                  {first.card_name}
                </div>

                <div className="text-sm text-subtle">
                  {paid}/{first.months} paid
                </div>
              </div>

              <button
                onClick={() => handleCancel(txId)}
                className="btn-danger"
              >
                Cancel
              </button>

            </div>

            <div className="progress-track">
              <div
                className="progress-fill"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="text-sm text-subtle">
              Total: {formatMoney(total)}
            </div>

            <div className="text-sm text-subtle">
              Remaining: {formatMoney(unpaidAmount)}
            </div>

          </div>
        );
      })}
    </div>
  );
}