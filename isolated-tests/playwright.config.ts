import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./",
  workers: 1,
  reporter: "line",
  use: {
    baseURL: "http://localhost:8080",
    actionTimeout: 10000,
  },
  projects: [
    {
      name: "Mobile Safari",
      use: { ...devices["iPhone 12"] },
    },
  ],
});
