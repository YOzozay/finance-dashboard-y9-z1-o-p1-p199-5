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
  const [upcoming, setUpcoming] = useState([]);
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

      const upcomingData = await apiGet({
        action: "getUpcomingInstallments"
      });

      setSummary(summaryData);
      setDebts(debtData);
      setUpcoming(upcomingData || []);
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

      {/* ===== UPCOMING INSTALLMENTS (Moved to Bottom) ===== */}
      <UpcomingInstallments data={upcoming} />

    </div>
  );
}

/* =========================
   STAT CARD
========================= */

function StatCard({ title, value }) {
  return (
    <div className="card">
      <div className="text-muted text-sm">{title}</div>
      <div className="text-xl font-semibold mt-2">{value}</div>
    </div>
  );
}

/* =========================
   UPCOMING INSTALLMENTS
   Accordion Slide Version
========================= */

function UpcomingInstallments({ data }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="card space-y-4">

      {/* Header */}
      <div
        className="flex justify-between items-center cursor-pointer"
        onClick={() => setOpen(!open)}
      >
        <div className="font-semibold">
          Upcoming Installments
        </div>

        <div className="text-sm text-muted">
          {open ? "Hide ▲" : "Show ▼"}
        </div>
      </div>

      {/* Slide Content */}
      <div
        className={`transition-all duration-300 overflow-hidden ${
          open ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        {data.length === 0 && (
          <div className="text-muted text-sm mt-3">
            No upcoming payments
          </div>
        )}

        {data.map(item => {
          const today = new Date();
          const due = new Date(item.due_date);
          const diffDays = Math.ceil(
            (due - today) / (1000 * 60 * 60 * 24)
          );

          const urgent =
            diffDays <= 7 ? "var(--color-danger)" : undefined;

          return (
            <div
              key={item.id}
              className="flex justify-between items-center border-b py-3 last:border-none"
            >
              <div className="space-y-1">
                <div
                  className="text-sm font-medium"
                  style={{ color: urgent }}
                >
                  {item.card_name}
                </div>

                <div className="text-xs text-muted">
                  {item.description}
                </div>

                <div className="text-xs text-muted">
                  Due: {item.due_date} — Installment #{item.installment_no}
                </div>
              </div>

              <div className="font-semibold">
                {formatMoney(item.amount)}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}