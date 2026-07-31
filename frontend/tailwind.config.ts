import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0b0e14",
        surface: "#131722",
        card: "#1e222d",
        border: "#2a2e39",
        accent: "#2962ff",
        accentHover: "#1e53e5",
        success: "#089981",
        danger: "#f23645",
        warning: "#f5c000",
      },
    },
  },
  plugins: [],
};
export default config;
