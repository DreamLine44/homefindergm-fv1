import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#faf9f7] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="font-display text-[120px] font-bold text-stone-200 leading-none select-none">
          404
        </div>
        <h1 className="font-display text-3xl font-bold text-stone-900 mb-3 -mt-4">
          Page not found
        </h1>
        <p className="text-stone-500 mb-8 leading-relaxed">
          The page you're looking for doesn't exist or has been moved.
          Let's get you back on track.
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            to="/"
            className="px-6 py-3 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 transition-colors"
          >
            Go Home
          </Link>
          <Link
            to="/properties"
            className="px-6 py-3 border border-stone-300 text-stone-700 rounded-xl font-medium hover:bg-stone-50 transition-colors"
          >
            Browse Listings
          </Link>
        </div>
      </div>
    </div>
  );
}
