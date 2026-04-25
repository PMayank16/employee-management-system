export function Spinner({ className = "" }) {
  return (
    <span
      className={`inline-block size-5 animate-spin rounded-full border-2 border-primary/20 border-t-primary ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
}
