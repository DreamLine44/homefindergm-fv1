import { useState } from "react";

export default function ImageGallery({ images }) {
  const [active, setActive] = useState(0);
  if (!images || images.length === 0) return (
    <div className="w-full h-80 bg-stone-100 rounded-2xl flex items-center justify-center text-stone-400">No images</div>
  );
  return (
    <div className="space-y-3">
      <div className="relative h-80 md:h-96 rounded-2xl overflow-hidden bg-stone-100">
        <img src={images[active]?.url} alt="Property" className="w-full h-full object-cover" />
        {images.length > 1 && (
          <>
            <button onClick={() => setActive((p) => (p - 1 + images.length) % images.length)}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 rounded-full p-2 shadow">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button onClick={() => setActive((p) => (p + 1) % images.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 rounded-full p-2 shadow">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
          </>
        )}
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {images.map((img, i) => (
            <button key={i} onClick={() => setActive(i)}
              className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${i === active ? "border-brand-500" : "border-transparent"}`}>
              <img src={img.url} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
