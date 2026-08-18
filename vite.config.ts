import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    spa: {},
    prerender: false,
  },
  vite: {
    base: "./",
  },
});
