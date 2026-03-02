export function calculateDebtProjection(debt, extraPerMonth = 0) {
  if (!debt) return null;

  const remaining = Number(debt.remaining_amount) || 0;
  const monthly = Number(debt.monthly_due) || 0;
  const extra = Math.max(Number(extraPerMonth) || 0, 0);

  if (monthly <= 0) return null;
  if (remaining <= 0) return { normalMonths: 0, acceleratedMonths: 0, monthsSaved: 0 };

  const normalMonths = Math.ceil(remaining / monthly);

  const acceleratedMonthly = monthly + extra;
  const acceleratedMonths = Math.ceil(remaining / acceleratedMonthly);

  const monthsSaved = normalMonths - acceleratedMonths;

  return {
    normalMonths,
    acceleratedMonths,
    monthsSaved,
  };
}