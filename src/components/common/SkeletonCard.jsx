export default function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-stone-100 flex flex-col animate-pulse">
      <div className="h-52 bg-stone-100" />
      <div className="p-4 flex flex-col gap-3">
        <div className="h-4 bg-stone-100 rounded w-3/4" />
        <div className="h-3 bg-stone-100 rounded w-1/2" />
        <div className="h-3 bg-stone-100 rounded w-full" />
        <div className="h-3 bg-stone-100 rounded w-5/6" />
        <div className="flex justify-between pt-2 border-t border-stone-50">
          <div className="h-5 bg-stone-100 rounded w-24" />
          <div className="h-3 bg-stone-100 rounded w-16" />
        </div>
      </div>
    </div>
  );
}
