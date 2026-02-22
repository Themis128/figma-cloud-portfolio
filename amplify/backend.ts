import { defineBackend } from "@aws-amplify/backend";
import { auth } from "./backend/auth/resource";
import { data } from "./backend/data/resource";

/**
 * Amplify Gen 2 backend — Auth + Data only.
 * Lambda functions and API Gateway are managed manually via AWS CLI
 * (figma-portfolio-api + playwright-autofix on wctxhmfzgk.execute-api.us-east-1.amazonaws.com).
 */
const backend = defineBackend({
  auth,
  data,
});

/**
 * Configure CDK to use pnpm-lock.yaml instead of package-lock.json
 * This resolves the "Multiple package lock files found" error
 */
backend.stack.node.setContext("aws-cdk:depsLockFilePath", "pnpm-lock.yaml");

export default backend;
