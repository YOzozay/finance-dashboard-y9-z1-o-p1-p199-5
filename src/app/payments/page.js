"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPost } from "@/config/api";
import { formatMoney } from "@/lib/format";

export default function PaymentsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [error, setError] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await apiPost({ action: "getDuePayments" });

      // รองรับทั้ง array และ { data: [...] }
      if (Array.isArray(data)) {
        setItems(data);
      } else if (data && Array.isArray(data.data)) {
        setItems(data.data);
      } else {
        setItems([]);
      }

    } catch (err) {
      console.error(err);
      setError("Failed to load payments");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handlePay = async (item) => {
    let amount = Number(item.amount);

    if (item.type !== "installment") {
      const input = prompt("Enter payment amount:", item.amount);
      if (input === null || input.trim() === "") return;
      amount = Number(input);
      if (isNaN(amount) || amount <= 0) {
        alert("Invalid amount");
        return;
      }
    }

    try {
      setProcessingId(item.source_id);

      await apiPost({
        action: "processPayment",
        type: item.type,
        source_id: item.source_id,
        amount,
      });

      await load();
    } catch (err) {
      alert(err.message || "Payment failed");
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <h1 className="text-2xl font-bold">Payment Center</h1>

      {error && (
        <div className="text-[var(--color-danger)]">
          {error}
        </div>
      )}

      {items.length === 0 && !error && (
        <div className="text-subtle">
          No payments due
        </div>
      )}

      <div className="grid gap-4">
        {Array.isArray(items) &&
          items.map((item) => (
            <div
              key={`${item.type}-${item.source_id}`}
              className="card flex justify-between items-center"
            >
              <div>
                <div className="font-semibold">
                  {item.title}
                </div>

                <div className="text-sm text-subtle">
                  {item.subtitle}
                </div>

                {item.due_date && (
                  <div className="text-xs text-subtle">
                    Due: {item.due_date}
                  </div>
                )}
              </div>

              <div className="text-right space-y-2">
                <div className="font-semibold">
                  {formatMoney(item.amount)}
                </div>

                <button
                  onClick={() => handlePay(item)}
                  disabled={processingId === item.source_id}
                  className="btn-primary-sm"
                >
                  {processingId === item.source_id
                    ? "Processing..."
                    : "Pay"}
                </button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}