/* eslint-disable import/no-extraneous-dependencies */
import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src"],
  outDir: "build",
  loader: {
    ".html": "text",
    ".sql": "text",
    ".toml": "text",
    ".prisma": "text",
  },
});
