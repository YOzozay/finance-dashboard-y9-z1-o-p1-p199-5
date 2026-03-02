"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/config/api";
import { getCurrentPayMonth } from "@/lib/date";
import { formatMoney } from "@/lib/format";
import { calculateDashboardMetrics } from "@/lib/dashboard";

export default function DashboardPage() {
  const [payMonth, setPayMonth] = useState(getCurrentPayMonth());
  const [summary, setSummary] = useState(null);
  const [debts, setDebts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);

      const summaryData = await apiGet({
        action: "summary",
        payMonth
      });

      const debtData = await apiGet({
        action: "getDebts"
      });

      setSummary(summaryData);
      setDebts(debtData);
      setLoading(false);
    }

    load();
  }, [payMonth]);

  if (loading || !summary) {
    return <div className="page-container">Loading...</div>;
  }

  const metrics = calculateDashboardMetrics(summary, debts);

  const burnColor =
    metrics.burnRatePercent > 80
      ? "var(--color-danger)"
      : metrics.burnRatePercent > 50
      ? "var(--color-warning)"
      : "var(--color-success)";

  return (
    <div className="page-container space-y-8">

      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* ===== KPI SECTION ===== */}
      <div className="grid md:grid-cols-3 gap-6">

        <StatCard title="Net Income" value={formatMoney(metrics.netIncome)} />
        <StatCard title="Total Expenses" value={formatMoney(metrics.totalExpenses)} />
        <StatCard title="Net Balance" value={formatMoney(metrics.netBalance)} />

        <StatCard title="Debt Remaining" value={formatMoney(metrics.totalDebtRemaining)} />
        <StatCard title="Monthly Obligation" value={formatMoney(metrics.monthlyObligation)} />
        <StatCard title="OT Contribution" value={`${metrics.otContributionPercent.toFixed(1)}%`} />

      </div>

      {/* ===== BURN RATE ===== */}
      <div className="card space-y-3">
        <div className="flex justify-between">
          <div className="font-semibold">Burn Rate</div>
          <div className="text-sm">
            {metrics.burnRatePercent.toFixed(1)}%
          </div>
        </div>

        <div className="progress-track">
          <div
            className="progress-fill"
            style={{
              width: `${metrics.burnRatePercent}%`,
              backgroundColor: burnColor
            }}
          />
        </div>
      </div>

      {/* ===== OT INSIGHT ===== */}
      <div className="card space-y-2">
        <div className="font-semibold">OT Insight</div>

        <div className="text-muted">
          OT Pay: {formatMoney(metrics.otPay)}
        </div>

        <div className="text-muted">
          Net Balance without OT: {formatMoney(metrics.netWithoutOT)}
        </div>
      </div>

    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="card">
      <div className="text-muted text-sm">{title}</div>
      <div className="text-xl font-semibold mt-2">{value}</div>
    </div>
  );
}