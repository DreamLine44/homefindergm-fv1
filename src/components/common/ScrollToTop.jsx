// src/components/common/ScrollToTop.jsx
// Scrolls to the top of the page on every route change.
// Uses requestAnimationFrame to fire AFTER the new page paints,
// preventing the "scrolled but not quite to top" issue.
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // First pass — instant, before paint
    window.scrollTo({ top: 0, behavior: "instant" });
    // Second pass — after paint, catches any async content that pushed things down
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: "instant" });
    });
  }, [pathname]);

  return null;
}
