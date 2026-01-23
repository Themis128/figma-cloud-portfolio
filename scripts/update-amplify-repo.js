#!/usr/bin/env node

/**
 * Script to update AWS Amplify repository settings
 * This attempts to update the repository URL and branch settings
 */

import { AmplifyClient, UpdateAppCommand } from "@aws-sdk/client-amplify";

async function updateAmplifyRepository() {
  const amplifyClient = new AmplifyClient({
    region: "us-east-1",
  });

  const appId = "d1zjif7pi1h3om";
  const newRepository = "https://github.com/Themis128/new-portfolio";
  const branchName = "ai_main_ac9340bcfb26";

  try {
    console.log("🔄 Attempting to update Amplify repository settings...");
    console.log(`📋 App ID: ${appId}`);
    console.log(`📦 New Repository: ${newRepository}`);
    console.log(`🌿 Branch: ${branchName}`);

    // Set build spec with pnpm installation
    const buildSpec = `version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm install -g pnpm
        - pnpm install
    build:
      commands:
        - pnpm run build:resume
        - pnpm run build:client
  artifacts:
    baseDirectory: dist
    files:
      - '**/*'
backend:
  phases:
    build:
      commands:
        - pnpm run build:server
        - amplifyPush --simple`;

    const updateCommand = new UpdateAppCommand({
      appId: appId,
      name: "new-portfolio",
      buildSpec: buildSpec,
      // Other settings that might be updatable
      enableBranchAutoBuild: false,
      enableBranchAutoDeletion: true,
      enableBasicAuth: false,
    });

    const response = await amplifyClient.send(updateCommand);

    console.log("✅ Repository update attempted");
    console.log("📊 Response:", JSON.stringify(response, null, 2));

    // Check if repository was actually updated
    if (response.app?.repository === newRepository) {
      console.log("🎉 Repository URL successfully updated!");
    } else {
      console.log("⚠️ Repository URL may not have changed (re-authorization required)");
      console.log("🔗 Current repository:", response.app?.repository);
    }
  } catch (error) {
    console.error("❌ Error updating repository:", error.message);

    if (error.name === "BadRequestException") {
      console.log("💡 This error usually means:");
      console.log("   - Repository changes require re-authorization");
      console.log("   - Use AWS Amplify Console for repository URL changes");
      console.log("   - GitHub App permissions may need updating");
    }

    process.exit(1);
  }
}

// Run the update
updateAmplifyRepository().catch(console.error);
