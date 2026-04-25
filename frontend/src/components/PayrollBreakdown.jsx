import { Card, CardHeader } from "@/components/ui/Card";
import { formatINR } from "@/utils/currency";

function upper(x) {
  return String(x || "").toUpperCase();
}

export default function PayrollBreakdown({ payroll, employee, title = "Payroll" }) {
  const salaryType = upper(
    payroll?.salaryType ??
      payroll?.salary_type ??
      employee?.salaryType ??
      employee?.salary_type
  );
  const baseSalary = Number(
    payroll?.baseSalary ??
      payroll?.salaryAmount ??
      payroll?.salary_amount ??
      payroll?.base ??
      payroll?.monthlySalary ??
      employee?.salaryAmount ??
      employee?.salary_amount ??
      0
  );
  const presentDays = Number(payroll?.presentDays ?? payroll?.present ?? 0);
  const totalDays = Number(payroll?.totalDays ?? payroll?.daysInMonth ?? 30);
  const finalSalary = Number(
    payroll?.finalSalary ?? payroll?.calculatedSalary ?? payroll?.salary ?? payroll?.netSalary ?? 0
  );

  const isMonthly = salaryType === "MONTHLY";
  const isDaily = salaryType === "DAILY";
  const safeTotalDays = totalDays > 0 ? totalDays : 30;

  const dailyWage =
    baseSalary > 0
      ? isMonthly
        ? safeTotalDays > 0
          ? baseSalary / safeTotalDays
          : 0
        : baseSalary
      : 0;

  const computedFinal = dailyWage * Math.max(0, presentDays);

  const salaryTypeLabel = isMonthly ? "MONTHLY" : isDaily ? "DAILY" : salaryType || "—";
  // Only show "no data" when everything meaningful is missing/zero.
  const showNoData =
    (!Number.isFinite(baseSalary) || baseSalary <= 0) &&
    (!Number.isFinite(finalSalary) || finalSalary <= 0) &&
    (!Number.isFinite(presentDays) || presentDays <= 0);

  const breakdownLine1 = isMonthly
    ? `${formatINR(baseSalary, { maximumFractionDigits: 0 })} ÷ ${safeTotalDays || "—"} days = ${formatINR(dailyWage, {
        maximumFractionDigits: 2,
      })} per day`
    : `${formatINR(dailyWage, { maximumFractionDigits: 0 })} × ${Math.max(0, presentDays)} days = ${formatINR(
        computedFinal,
        { maximumFractionDigits: 0 }
      )}`;

  const breakdownLine2 = isMonthly
    ? `${formatINR(dailyWage, { maximumFractionDigits: 2 })} × ${Math.max(0, presentDays)} days = ${formatINR(
        computedFinal,
        { maximumFractionDigits: 0 }
      )}`
    : null;

  return (
    <Card className="border-primary/15">
      <CardHeader
        title={title}
        subtitle={
          isMonthly
            ? "Monthly: (Monthly Salary ÷ totalDays) × presentDays"
            : "Daily: (Daily Wage) × presentDays"
        }
      />

      {showNoData ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-white/50 px-4 py-10 text-center text-sm text-slate-500">
          No salary data available.
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-white/60 bg-white/70 p-4 shadow-inner">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Salary Type</p>
              <p className="mt-2 text-xl font-bold text-slate-900 transition-all duration-300">
                {salaryTypeLabel}
              </p>
            </div>
            <div className="rounded-2xl border border-white/60 bg-white/70 p-4 shadow-inner">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Base Salary</p>
              <p className="mt-2 text-xl font-bold text-slate-900 transition-all duration-300">
                {formatINR(baseSalary, { maximumFractionDigits: 0 })}
              </p>
            </div>
            <div className="rounded-2xl border border-white/60 bg-white/70 p-4 shadow-inner">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Present Days</p>
              <p className="mt-2 text-xl font-bold text-slate-900 transition-all duration-300">
                {Number.isFinite(presentDays) ? presentDays : "—"}
              </p>
            </div>
            <div className="rounded-2xl border border-red-200 bg-gradient-to-r from-red-600 to-rose-600 p-4 text-white shadow-lg shadow-red-500/25">
              <p className="text-xs font-semibold uppercase tracking-wide text-white/85">Final Salary</p>
              <p className="mt-2 text-2xl font-bold tracking-tight transition-all duration-300">
                {formatINR(finalSalary, { maximumFractionDigits: 0 })}
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-white/60 bg-white/60 p-4 text-sm text-slate-700">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <span className="font-semibold text-slate-800">Breakdown</span>
              {isMonthly ? (
                <span className="text-xs text-slate-500">Daily wage = baseSalary ÷ totalDays</span>
              ) : (
                <span className="text-xs text-slate-500">Daily wage = baseSalary</span>
              )}
            </div>
            <div className="mt-2 flex flex-col gap-1 text-slate-700">
              <p>{breakdownLine1}</p>
              {breakdownLine2 ? <p>{breakdownLine2}</p> : null}
              <p className="text-xs text-slate-500">
                (Final Salary is from API. Breakdown lines follow the same formula.)
              </p>
            </div>
          </div>
        </>
      )}
    </Card>
  );
}

