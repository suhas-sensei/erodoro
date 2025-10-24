import type { Config } from "tailwindcss";

const c = (v: string) => `var(${v})`;

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg0: c("--bg-0"),
        bg1: c("--bg-1"),
        bg2: c("--bg-2"),
        bg3: c("--bg-3"),
        bd0: c("--bd-0"),
        bd1: c("--bd-1"),
        txt1: c("--txt-1"),
        txt2: c("--txt-2"),
        txt3: c("--txt-3"),
        txtInv: c("--txt-inv"),
        blue: c("--blue"),
        bluePress: c("--blue-press"),
        green: c("--green"),
        greenPress: c("--green-press"),
        red: c("--red"),
        redPress: c("--red-press"),
        amber: c("--amber"),
        chip: c("--chip"),
        disabled: c("--disabled"),
        disabledTxt: c("--disabled-txt"),
        field: c("--field"),
        fieldBorder: c("--field-border"),
        focus: c("--focus"),
        overlay: c("--overlay"),
      },
      boxShadow: {
        card: "0 0 0 1px var(--bd-0) inset, 0 6px 16px rgba(0,0,0,.25)",
        modal: "0 20px 60px rgba(0,0,0,.45)",
      },
      borderRadius: {
        panel: "12px",
        control: "10px",
        chip: "10px",
        modal: "16px",
      },
      fontFamily: {
        sans: [
          "Inter",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
      },
      screens: {
        md2: "840px",
        xl2: "1200px",
      },
      spacing: {
        4.5: "18px",
      },
    },
  },
  plugins: [require("eslint-plugin-tailwindcss")],
} satisfies Config;
