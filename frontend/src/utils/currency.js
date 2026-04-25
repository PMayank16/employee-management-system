/** Format a number as Indian Rupees (₹). */
export function formatINR(value, options = {}) {
  const n = Number(value);
  if (Number.isNaN(n)) return "₹0";
  const { minimumFractionDigits = 0, maximumFractionDigits = 2 } = options;
  const abs = Math.abs(n);
  const formatted = abs.toLocaleString("en-IN", {
    minimumFractionDigits,
    maximumFractionDigits,
  });
  const sign = n < 0 ? "-" : "";
  return `${sign}₹${formatted}`;
}
