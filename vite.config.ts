import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    spa: {},
  },
  vite: {
    base: "./",
    environments: {
      nitro: {
        build: {
          rollupOptions: {
            input: "src/entry-client.tsx",
          },
        },
      },
    },
  },
});
