const variants = {
  primary:
    "bg-gradient-to-r from-primary to-primary-light text-white shadow-md shadow-primary/25 hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0",
  secondary:
    "bg-white/80 text-primary border border-primary/20 backdrop-blur-sm hover:bg-white hover:border-primary/40 hover:-translate-y-0.5",
  danger:
    "bg-red-50 text-red-800 border border-red-200 hover:bg-red-100 hover:-translate-y-0.5",
  ghost: "text-slate-600 hover:bg-white/60 hover:text-primary",
};

export function Button({
  children,
  className = "",
  variant = "primary",
  type = "button",
  disabled,
  ...rest
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 ${variants[variant] ?? variants.primary} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
