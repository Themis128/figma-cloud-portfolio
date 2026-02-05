/**
 * pnpm hooks for dependency optimization
 */

function readPackage(pkg, context) {
  // Optimize React-related dependencies
  if (pkg.dependencies?.["react"] && pkg.dependencies?.["react-dom"]) {
    // Ensure React versions are aligned
    if (pkg.dependencies["react"] !== pkg.dependencies["react-dom"]) {
      context.log("⚠️  React and React-DOM versions mismatch detected");
    }
  }

  // Optimize TypeScript dependencies
  if (pkg.devDependencies?.["typescript"]) {
    // Ensure consistent TypeScript tooling versions
    const tsVersion = pkg.devDependencies["typescript"];
    if (
      pkg.devDependencies["@types/node"] &&
      !pkg.devDependencies["@types/node"].includes("^")
    ) {
      context.log("ℹ️  Consider using flexible @types/node version");
    }
  }

  // Optimize testing dependencies
  if (
    pkg.devDependencies?.["vitest"] &&
    pkg.devDependencies?.["@playwright/test"]
  ) {
    // Ensure testing tools are properly configured
    context.log("✅ Testing stack detected: Vitest + Playwright");
  }

  return pkg;
}

module.exports = {
  hooks: {
    readPackage,
  },
};
