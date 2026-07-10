import type { Config } from "tailwindcss";
import { claimsahayakPreset } from "@claimsahayak/design-tokens/tailwind-preset";

const config: Config = {
  presets: [claimsahayakPreset],
  content: ["./src/**/*.{ts,tsx}"],
};

export default config;
