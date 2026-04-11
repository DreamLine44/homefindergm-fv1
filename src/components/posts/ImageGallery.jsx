import { useState } from "react";

export default function ImageGallery({ images }) {
  const [active, setActive] = useState(0);

  if (!images || images.length === 0) return (
    <div className="w-full h-64 sm:h-80 bg-stone-100 rounded-2xl flex items-center justify-center text-stone-400 text-sm">
      No images available
    </div>
  );

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div className="relative h-64 sm:h-80 md:h-96 rounded-2xl overflow-hidden bg-stone-100">
        <img
          src={images[active]?.url}
          alt="Property"
          className="w-full h-full object-cover"
        />
        {/* Counter badge */}
        {images.length > 1 && (
          <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2.5 py-1 rounded-full backdrop-blur-sm font-medium">
            {active + 1} / {images.length}
          </div>
        )}
        {/* Nav arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={() => setActive((p) => (p - 1 + images.length) % images.length)}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2.5 shadow-md transition-all active:scale-95"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => setActive((p) => (p + 1) % images.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2.5 shadow-md transition-all active:scale-95"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Thumbnails — centered and evenly spaced */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto px-1 pb-1 justify-center flex-wrap">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`flex-shrink-0 w-16 h-16 sm:w-18 sm:h-18 rounded-xl overflow-hidden border-2 transition-all ${
                i === active
                  ? "border-brand-500 ring-2 ring-brand-200"
                  : "border-stone-200 hover:border-stone-400 opacity-70 hover:opacity-100"
              }`}
            >
              <img src={img.url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
