/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "primary": "#30628a",
        "primary-container": "#a2d2ff",
        "on-primary": "#ffffff",
        "on-primary-container": "#275b82",
        "primary-fixed-dim": "#9bcbf8",
        "on-primary-fixed": "#001d32",
        "on-primary-fixed-variant": "#104a70",
        "secondary": "#40627b",
        "secondary-container": "#bee1ff",
        "on-secondary": "#ffffff",
        "on-secondary-container": "#42647e",
        "secondary-fixed-dim": "#a8cbe8",
        "secondary-fixed": "#cae6ff",
        "on-secondary-fixed": "#001e2f",
        "on-secondary-fixed-variant": "#274a63",
        "tertiary": "#7c5264",
        "tertiary-container": "#f4bed3",
        "on-tertiary": "#ffffff",
        "on-tertiary-container": "#744a5c",
        "tertiary-fixed-dim": "#edb8cc",
        "tertiary-fixed": "#ffd8e6",
        "on-tertiary-fixed-variant": "#623b4c",
        "on-tertiary-fixed": "#301020",
        "background": "#f7f9fb",
        "surface": "#f7f9fb",
        "surface-bright": "#f7f9fb",
        "surface-dim": "#d8dadc",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#f2f4f6",
        "surface-container": "#eceef0",
        "surface-container-high": "#e6e8ea",
        "surface-container-highest": "#e0e3e5",
        "on-surface": "#191c1e",
        "on-surface-variant": "#41474e",
        "inverse-surface": "#2d3133",
        "inverse-on-surface": "#eff1f3",
        "inverse-primary": "#9bcbf8",
        "outline": "#72787f",
        "outline-variant": "#c1c7cf",
        "error": "#ba1a1a",
        "on-error": "#ffffff",
        "error-container": "#ffdad6",
        "on-error-container": "#93000a",
        "sand-pastel": "#FFF9E5"
      },
      borderRadius: {
        "DEFAULT": "1rem",
        "lg": "2rem",
        "xl": "3rem",
        "full": "9999px"
      },
      spacing: {
        "stack-gap": "16px",
        "container-margin": "20px",
        "inline-gap": "12px",
        "section-padding": "24px"
      },
      fontFamily: {
        "quicksand": ["Quicksand", "sans-serif"]
      }
    },
  },
  plugins: [],
}
