/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary:    "var(--color-primary)",
        "primary-hover": "var(--color-primary-hover)",
        accent:     "var(--color-accent)",
        surface:    "var(--color-bg-surface)",
        "page-bg":  "var(--color-bg-page)",
        "input-bg": "var(--color-bg-input)",
        "muted-bg": "var(--color-bg-input-muted)",
        "nav-bg":   "var(--color-bg-nav)",
        border:     "var(--color-border)",
        "text-muted":  "var(--color-text-muted)",
        "text-subtle": "var(--color-text-subtle)",
        danger:     "var(--color-danger)",
        success:    "var(--color-success)",
        warning:    "var(--color-warning)",
        disabled:   "var(--color-disabled)",
      },
      boxShadow: {
        card: "var(--shadow-card)",
      },
    },
  },
  plugins: [],
};

