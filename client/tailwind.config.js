export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        mono: ["Share Tech Mono", "monospace"],
        sans: ["Space Mono", "monospace"],
      },
      colors: {
        neon: "#00ff64",
        dark: "#080f09",
      },
    },
  },
  plugins: [],
};
