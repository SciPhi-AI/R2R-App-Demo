import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        blue: {
          500: "#2F80ED",
        },
        red: {
          500: "#FF6384",
        },
        yellow: {
          500: "#FFCD56",
        },
        teal: {
          500: "#36A2EB",
        },
        purple: {
          500: "#9C27B0",
        },
        orange: {
          500: "#FF9F40",
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;
