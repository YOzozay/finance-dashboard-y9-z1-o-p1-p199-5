export function calculateDashboardMetrics(summary, debtSummary = []) {
  if (!summary) return null;

  const netIncome = Number(summary.netIncome) || 0;
  const totalExpenses = Number(summary.expenses?.totalExpenses) || 0;
  const netBalance = Number(summary.netBalance) || 0;

  const otPay = Number(summary.income?.otPay) || 0;
  const grossIncome = Number(summary.income?.grossIncome) || 0;

  const otContributionPercent =
    grossIncome > 0 ? (otPay / grossIncome) * 100 : 0;

  const burnRatePercent =
    netIncome > 0 ? Math.min((totalExpenses / netIncome) * 100, 100) : 0;

  const safeDebts = Array.isArray(debtSummary) ? debtSummary : [];

  const totalDebtRemaining = safeDebts.reduce(
    (sum, d) => sum + (Number(d.remaining_amount) || 0),
    0
  );

  const monthlyObligation = safeDebts.reduce(
    (sum, d) => sum + (Number(d.monthly_due) || 0),
    0
  );

  const netWithoutOT = netBalance - otPay;

  return {
    netIncome,
    totalExpenses,
    netBalance,
    totalDebtRemaining,
    monthlyObligation,
    otContributionPercent,
    burnRatePercent,
    netWithoutOT,
    otPay,
  };
}