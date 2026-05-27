import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { nitro } from "nitro/vite";

export default defineConfig({
  cloudflare: process.env.VERCEL ? false : {},
  tanstackStart: {
    server: { entry: "server" },
  },
  plugins: [
    nitro({
      preset: "vercel",
    }),
  ],
});
