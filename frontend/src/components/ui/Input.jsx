export function Input({ label, id, className = "", error, ...rest }) {
  const inputId = id || rest.name;
  return (
    <label className="block">
      {label ? (
        <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>
      ) : null}
      <input
        id={inputId}
        className={`w-full rounded-xl border border-slate-200/80 bg-white/80 px-4 py-2.5 text-sm text-slate-900 shadow-inner shadow-slate-100 outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/20 ${error ? "border-red-300 focus:ring-red-200" : ""} ${className}`}
        {...rest}
      />
      {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
    </label>
  );
}
