import { Outlet, Link } from "react-router-dom";

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-700 via-brand-800 to-brand-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center justify-center">
            {/* White version of logo for dark bg */}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 56" fill="none" className="h-11">
              <path d="M8 30 L28 10 L48 30" stroke="white" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="13" y1="27" x2="13" y2="48" stroke="white" strokeWidth="3.5" strokeLinecap="round"/>
              <line x1="43" y1="27" x2="43" y2="48" stroke="white" strokeWidth="3.5" strokeLinecap="round"/>
              <line x1="13" y1="48" x2="43" y2="48" stroke="white" strokeWidth="3.5" strokeLinecap="round"/>
              <rect x="21" y="30" width="14" height="10" rx="1.5" fill="#f97316"/>
              <line x1="28" y1="30" x2="28" y2="40" stroke="white" strokeWidth="1.2"/>
              <line x1="21" y1="35" x2="35" y2="35" stroke="white" strokeWidth="1.2"/>
              <path d="M6 52 Q28 47 50 52" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round"/>
              <text x="60" y="40" fontFamily="DM Sans, Arial, sans-serif" fontWeight="800" fontSize="28" fill="white" letterSpacing="-0.8">HomeFinder</text>
              <text x="229" y="40" fontFamily="DM Sans, Arial, sans-serif" fontWeight="900" fontSize="29" fill="#f97316" letterSpacing="-0.5">GM</text>
            </svg>
          </Link>
          <p className="text-brand-200 text-sm mt-3">The Gambia's Premier Property Platform</p>
        </div>
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <Outlet />
        </div>
        <p className="text-center mt-6 text-sm text-brand-200">
          <Link to="/" className="hover:text-white transition-colors">← Back to home</Link>
        </p>
      </div>
    </div>
  );
}
