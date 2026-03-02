export function calculateDebtProjection(debt, extraPerMonth = 0) {
  if (!debt) return null;

  const remaining = Number(debt.remaining_amount) || 0;
  const monthly = Number(debt.monthly_due) || 0;

  if (monthly <= 0) return null;

  const normalMonths = Math.ceil(remaining / monthly);

  const acceleratedMonthly = monthly + extraPerMonth;

  const acceleratedMonths =
    acceleratedMonthly > 0
      ? Math.ceil(remaining / acceleratedMonthly)
      : normalMonths;

  const monthsSaved = normalMonths - acceleratedMonths;

  return {
    normalMonths,
    acceleratedMonths,
    monthsSaved
  };
}