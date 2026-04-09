export default function Input({
  label,
  error,
  className = "",
  containerClass = "",
  ...props
}) {
  return (
    <div className={`flex flex-col gap-1 ${containerClass}`}>
      {label && (
        <label className="text-sm font-medium text-stone-700">{label}</label>
      )}
      <input
        className={`px-3 py-2.5 rounded border text-sm transition-colors outline-none bg-white
          ${error
            ? "border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500"
            : "border-stone-300 focus:border-brand-500 focus:ring-1 focus:ring-brand-400"
          } ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
