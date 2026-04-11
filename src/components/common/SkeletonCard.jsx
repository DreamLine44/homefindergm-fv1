export default function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-stone-100 flex flex-col h-full animate-pulse">
      <div className="h-56 bg-stone-100 flex-shrink-0" />
      <div className="p-5 flex flex-col gap-3 flex-1">
        <div className="h-4 bg-stone-100 rounded w-3/4" />
        <div className="h-3 bg-stone-100 rounded w-1/2" />
        <div className="h-3 bg-stone-100 rounded w-full" />
        <div className="h-3 bg-stone-100 rounded w-5/6" />
        <div className="flex justify-between pt-2 border-t border-stone-50 mt-auto">
          <div className="h-5 bg-stone-100 rounded w-24" />
          <div className="h-4 bg-stone-100 rounded w-16" />
        </div>
      </div>
    </div>
  );
}
