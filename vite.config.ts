/// <reference types="vitest"/>

import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environmentMatchGlobs: [["test/bdd/**", "prisma"]],
    include: ["**/*.{test,spec}.?(c|m)[jt]s?(x)"],
    reporters: [
      "verbose",
      [
        "vitest-sonar-reporter",
        { outputFile: "coverage/reports/sonar-reporter.xml" },
      ],
    ],
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/cypress/**",
      "**/.{idea,git,cache,output,temp}/**",
      "**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build,eslint,prettier}.config.*",
      "**/*Presenter.ts",
      "**/repositories/**",
      "**/useCases/*/*UseCase.ts",
    ],
    globals: true,
    coverage: {
      provider: "istanbul",
      reportsDirectory: "./coverage",
      reporter: ["cobertura", "html", "lcov", "text-summary", "text"],
      include: ["src/**/*"],
      exclude: [
        "**/config/**",
        "**/schemas/**",
        "**/errors/**",
        "**/core/domain/**",
        "**/drivers/**",
        "**/repositories/PrismaRepositoryFactory.ts",
        "**/*Presenter.ts",
        "**/repositories/**",
        "**/useCases/*/*UseCase.ts",
      ],
      all: true,
      thresholds: {
        statements: 0,
        branches: 0,
        functions: 0,
        lines: 0,
      },
    },
  },
});
