/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        theme: {
          bg: {
            primary: "var(--bg-primary)",
            secondary: "var(--bg-secondary)",
            tertiary: "var(--bg-tertiary)",
            elevated: "var(--bg-elevated)",
            hover: "var(--bg-hover)",
          },
          sidebar: {
            bg: "var(--sidebar-bg)",
            border: "var(--sidebar-border)",
            hover: "var(--sidebar-hover)",
            active: "var(--sidebar-active)",
          },
          text: {
            primary: "var(--text-primary)",
            secondary: "var(--text-secondary)",
            tertiary: "var(--text-tertiary)",
            inverse: "var(--text-inverse)",
          },
          border: {
            primary: "var(--border-primary)",
            secondary: "var(--border-secondary)",
            focus: "var(--border-focus)",
          },
          input: {
            bg: "var(--input-bg)",
            border: "var(--input-border)",
            hover: "var(--input-hover)",
          },
          card: {
            bg: "var(--card-bg)",
            border: "var(--card-border)",
          },
          table: {
            header: "var(--table-header-bg)",
            hover: "var(--table-row-hover)",
            border: "var(--table-border)",
          },
          dropdown: {
            bg: "var(--dropdown-bg)",
            hover: "var(--dropdown-hover)",
            border: "var(--dropdown-border)",
          },
        },
        accent: {
          DEFAULT: "var(--primary)",
          hover: "var(--primary-hover)",
          light: "var(--primary-light)",
          subtle: "var(--primary-subtle)",
        },
        success: {
          DEFAULT: "var(--success)",
          light: "var(--success-light)",
        },
        warning: {
          DEFAULT: "var(--warning)",
          light: "var(--warning-light)",
        },
        danger: {
          DEFAULT: "var(--danger)",
          light: "var(--danger-light)",
        },
        info: {
          DEFAULT: "var(--info)",
          light: "var(--info-light)",
        },
      },
      boxShadow: {
        card: "var(--card-shadow)",
        dropdown: "var(--dropdown-shadow)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.2s ease-out",
        "slide-down": "slideDown 0.2s ease-out",
        "slide-up": "slideUp 0.15s ease-in",
        "modal-overlay": "modalOverlay 0.2s ease-out forwards",
        "modal-in": "modalIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "modal-out": "modalOut 0.2s ease-in forwards",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideDown: {
          "0%": { opacity: "0", transform: "translateY(-4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideUp: {
          "0%": { opacity: "1", transform: "translateY(0)" },
          "100%": { opacity: "0", transform: "translateY(-4px)" },
        },
        modalOverlay: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        modalIn: {
          "0%": { opacity: "0", transform: "translateY(24px) scale(0.96)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        modalOut: {
          "0%": { opacity: "1", transform: "translateY(0) scale(1)" },
          "100%": { opacity: "0", transform: "translateY(24px) scale(0.96)" },
        },
      },
    },
  },
  plugins: [],
};
