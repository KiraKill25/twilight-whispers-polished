import { defineNitroConfig } from "nitropack/config";

export default defineNitroConfig({
  preset: "static",
  prerender: {
    crawlLinks: false,
    routes: [],
  },
});
