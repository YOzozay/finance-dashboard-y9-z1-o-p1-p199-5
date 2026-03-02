export function calculateDashboardMetrics(summary, debtSummary = []) {
  if (!summary) return null;

  const netIncome = summary.netIncome || 0;
  const totalExpenses = summary.expenses?.totalExpenses || 0;
  const netBalance = summary.netBalance || 0;

  const otPay = summary.income?.otPay || 0;
  const grossIncome = summary.income?.grossIncome || 1;

  const otContributionPercent =
    grossIncome > 0 ? (otPay / grossIncome) * 100 : 0;

  const burnRatePercent =
    netIncome > 0 ? (totalExpenses / netIncome) * 100 : 0;

  const totalDebtRemaining = debtSummary.reduce(
    (sum, d) => sum + (Number(d.remaining_amount) || 0),
    0
  );

  const monthlyObligation = debtSummary.reduce(
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
    otPay
  };
}