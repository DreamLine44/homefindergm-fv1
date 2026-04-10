export default function Loader({ text = "Loading…" }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 sm:py-20 gap-4">
      <div className="w-8 h-8 border-3 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
      <p className="text-stone-400 text-sm">{text}</p>
    </div>
  );
}
