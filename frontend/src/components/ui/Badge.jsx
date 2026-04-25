const styles = {
  success: "bg-emerald-50 text-emerald-800 ring-emerald-600/15",
  warning: "bg-amber-50 text-amber-900 ring-amber-600/15",
  danger: "bg-red-50 text-red-800 ring-red-600/15",
  neutral: "bg-slate-50 text-slate-700 ring-slate-600/10",
  primary: "bg-primary/10 text-primary ring-primary/15",
};

export function Badge({ children, tone = "neutral" }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${styles[tone] ?? styles.neutral}`}
    >
      {children}
    </span>
  );
}
