/* eslint-disable import/no-extraneous-dependencies */
import tsConfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["**/*.e2e-test.ts"],
    globals: true,
    root: "./",
    setupFiles: ["./test/e2e/setup-e2e.ts"],
    // fileParallelism: false,
  },
  plugins: [tsConfigPaths()],
});
