import { defineConfig } from "vitest/config";

// Konfigurasi khusus benchmark bot (npm run bench)
export default defineConfig({
  test: {
    include: ["bench/**/*.bench.test.js"],
    silent: false,
  },
});
