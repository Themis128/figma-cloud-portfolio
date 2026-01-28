import fs from "node:fs";

// Postinstall optimizations and setup
async function postInstall() {
  try {
    console.log("Running postinstall optimizations...");

    // Create necessary directories if they don't exist
    const dirs = ["dist", "coverage", "test-results"];
    for (const dir of dirs) {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    }

    console.log("✅ Postinstall completed successfully");
  } catch (error) {
    console.warn("⚠️ Postinstall warning:", error.message);
  }
}

postInstall();
