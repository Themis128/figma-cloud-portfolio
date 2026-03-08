#!/usr/bin/env tsx
/**
 * Feature Branch Setup Hook
 * Sets up a new feature branch with proper structure and configuration
 *
 * Usage: Run automatically by Cline or manually via: npx tsx cline-hooks/tasks/feature-branch-setup.ts
 */

import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";

interface FeatureBranchConfig {
  branchName: string;
  featureName: string;
  description: string;
  timestamp: string;
}

function createFeatureBranch(branchName: string): boolean {
  try {
    console.log(`🌿 Creating feature branch: ${branchName}`);
    execSync(`git checkout -b ${branchName}`, { stdio: "inherit" });
    console.log("✅ Feature branch created");
    return true;
  } catch (error) {
    console.error("❌ Failed to create feature branch");
    return false;
  }
}

function setupFeatureDirectory(featureName: string): void {
  const featuresDir = path.join(process.cwd(), "features");
  const featureDir = path.join(featuresDir, featureName);

  if (!fs.existsSync(featuresDir)) {
    fs.mkdirSync(featuresDir, { recursive: true });
  }

  if (!fs.existsSync(featureDir)) {
    fs.mkdirSync(featureDir, { recursive: true });
    console.log(`📁 Created feature directory: ${featureDir}`);
  }

  // Create feature README
  const readmeContent = `# ${featureName}

## Description
${new Date().toISOString()}

## Implementation Plan
1. [ ] Research and planning
2. [ ] Implementation
3. [ ] Testing
4. [ ] Documentation

## Files
- \`components/\` - React components
- \`pages/\` - Next.js pages
- \`lib/\` - Utility functions
- \`tests/\` - Test files

## TODO
- [ ] Add implementation details
- [ ] Add test cases
- [ ] Update documentation
`;

  fs.writeFileSync(path.join(featureDir, "README.md"), readmeContent);
  console.log(`📝 Created feature README: ${featureDir}/README.md`);
}

function createFeatureConfig(config: FeatureBranchConfig): void {
  const configDir = path.join(process.cwd(), ".cline", "features");
  
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }

  const configFile = path.join(configDir, `${config.branchName}.json`);
  fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
  console.log(`⚙️  Created feature config: ${configFile}`);
}

function setupGitHooks(featureName: string): void {
  const hooksDir = path.join(process.cwd(), ".git", "hooks");
  
  if (!fs.existsSync(hooksDir)) return;

  // Create pre-commit hook for feature branch
  const preCommitHook = `#!/bin/sh
# Feature branch pre-commit hook for ${featureName}

echo "🔍 Running pre-commit checks for feature: ${featureName}"

# Run linting
pnpm lint

# Run type checking
pnpm typecheck

# Run tests
pnpm test

echo "✅ Pre-commit checks completed for ${featureName}"
`;

  const preCommitFile = path.join(hooksDir, "pre-commit-feature");
  fs.writeFileSync(preCommitFile, preCommitHook);
  fs.chmodSync(preCommitFile, 0o755);
  
  console.log(`🪝 Created feature pre-commit hook`);
}

function generateFeatureTemplate(featureName: string): void {
  const templateDir = path.join(process.cwd(), "features", featureName, "templates");
  
  if (!fs.existsSync(templateDir)) {
    fs.mkdirSync(templateDir, { recursive: true });
  }

  // Create component template
  const componentTemplate = `import React from 'react';

interface ${featureName.charAt(0).toUpperCase() + featureName.slice(1)}Props {
  // Props interface
}

export default function ${featureName.charAt(0).toUpperCase() + featureName.slice(1)}({}: ${featureName.charAt(0).toUpperCase() + featureName.slice(1)}Props) {
  return (
    <div>
      <h1>${featureName.charAt(0).toUpperCase() + featureName.slice(1)}</h1>
      {/* Component implementation */}
    </div>
  );
}
`;

  fs.writeFileSync(path.join(templateDir, "Component.tsx"), componentTemplate);
  console.log(`📄 Created component template`);

  // Create test template
  const testTemplate = `import { render, screen } from '@testing-library/react';
import ${featureName.charAt(0).toUpperCase() + featureName.slice(1)} from './Component';

describe('${featureName}', () => {
  it('should render successfully', () => {
    render(<${featureName.charAt(0).toUpperCase() + featureName.slice(1)} />);
    expect(screen.getByText('${featureName.charAt(0).toUpperCase() + featureName.slice(1)}')).toBeInTheDocument();
  });
});
`;

  fs.writeFileSync(path.join(templateDir, "Component.test.tsx"), testTemplate);
  console.log(`🧪 Created test template`);
}

async function main() {
  const featureName = process.argv[2] || "new-feature";
  const description = process.argv[3] || "New feature implementation";

  console.log("🌿 Cline Feature Branch Setup Hook");
  console.log("==================================");
  console.log(`🎯 Feature: ${featureName}`);
  console.log(`📝 Description: ${description}`);

  // Generate branch name
  const branchName = `feature/${featureName.toLowerCase().replace(/\s+/g, "-")}`;
  const timestamp = new Date().toISOString();

  const config: FeatureBranchConfig = {
    branchName,
    featureName,
    description,
    timestamp,
  };

  // Create feature branch
  const branchCreated = createFeatureBranch(branchName);
  if (!branchCreated) {
    console.log("❌ Failed to create feature branch");
    return;
  }

  // Setup feature directory
  setupFeatureDirectory(featureName);

  // Create feature config
  createFeatureConfig(config);

  // Setup git hooks
  setupGitHooks(featureName);

  // Generate templates
  generateFeatureTemplate(featureName);

  console.log("\n✅ Feature branch setup complete!");
  console.log(`🌿 Branch: ${branchName}`);
  console.log(`📁 Directory: features/${featureName}`);
  console.log(`⚙️  Config: .cline/features/${branchName}.json`);
  console.log("\n💡 Next steps:");
  console.log("1. Implement your feature in the components directory");
  console.log("2. Add tests for your implementation");
  console.log("3. Update the feature README with progress");
  console.log("4. Commit and push your changes");
}

main().catch(console.error);