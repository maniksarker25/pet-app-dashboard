/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  // antd ships its own reset; Tailwind's preflight would fight it.
  corePlugins: { preflight: false },
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f1f9ec",
          100: "#dff1d3",
          200: "#c0e3a9",
          300: "#98d077",
          400: "#74bb4d",
          500: "#56a032",
          600: "#438025",
          700: "#366421",
          800: "#2e501f",
          900: "#27441d",
        },
        accent: {
          50: "#fdf0f7",
          100: "#fce1f0",
          500: "#e64fa3",
          600: "#d1358b",
        },
        ink: {
          DEFAULT: "#1f2937",
          muted: "#6b7280",
          subtle: "#9ca3af",
        },
        surface: "#f6f8f5",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(16, 24, 40, 0.04), 0 1px 3px rgba(16, 24, 40, 0.06)",
      },
    },
  },
  plugins: [],
};
