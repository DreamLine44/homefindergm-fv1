export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Playfair Display'", "serif"],
        body:    ["'DM Sans'", "sans-serif"],
        mono:    ["'DM Mono'", "monospace"],
      },
      colors: {
        // Primary brand blue — clean, professional, matches logo
        brand: {
          50:  "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
        },
        // Orange — matches "GM" in logo, used for accents & CTAs
        gm: {
          50:  "#fff7ed",
          100: "#ffedd5",
          200: "#fed7aa",
          400: "#fb923c",
          500: "#f97316",
          600: "#ea580c",
          700: "#c2410c",
        },
        // Warm neutral — replaces stone for main backgrounds
        warm: {
          50:  "#fafaf8",
          100: "#f4f3ef",
          200: "#e8e6df",
          300: "#d4d0c4",
        },
      },
      animation: {
        "fade-up":     "fadeUp 0.35s ease forwards",
        "fade-in":     "fadeIn 0.25s ease forwards",
        "slide-right": "slideRight 0.35s ease forwards",
      },
      keyframes: {
        fadeUp:     { "0%": { opacity: 0, transform: "translateY(14px)" }, "100%": { opacity: 1, transform: "translateY(0)" } },
        fadeIn:     { "0%": { opacity: 0 }, "100%": { opacity: 1 } },
        slideRight: { "0%": { opacity: 0, transform: "translateX(-12px)" }, "100%": { opacity: 1, transform: "translateX(0)" } },
      },
    },
  },
  plugins: [],
}
