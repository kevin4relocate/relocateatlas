/**
 * Pure calculations for user-entered relocation estimates.
 * All amounts must share a currency. No third-party pricing, FX or tax assumptions.
 */
export function calculateRelocationBudget(raw) {
  const amount = value => Number.isFinite(Number(value)) ? Math.max(0, Number(value)) : 0;
  const income = amount(raw.income);
  const rent = amount(raw.rent);
  const utilities = amount(raw.utilities);
  const groceries = amount(raw.groceries);
  const transport = amount(raw.transport);
  const other = amount(raw.other);
  const deposit = amount(raw.deposit);
  const moving = amount(raw.moving);
  const savings = amount(raw.savings);
  const months = Math.min(24, Math.round(amount(raw.months)));
  const monthlyExpenses = rent + utilities + groceries + transport + other;
  const monthlyBalance = income - monthlyExpenses;
  const upfront = deposit + moving;
  const emergency = monthlyExpenses * months;
  const totalTarget = upfront + emergency;
  const savingsGap = Math.max(0, totalTarget - savings);
  return {monthlyExpenses, monthlyBalance, upfront, emergency, totalTarget, savingsGap, months};
}
