import { Amplify } from "aws-amplify";
import outputs from "../../amplify_outputs.json";

// Production Cognito auth — used in all environments so admin login
// works even when `ampx sandbox` overwrites amplify_outputs.json
// with its own sandbox pool (which has no admin users).
const productionAuth = {
  user_pool_id: "us-east-1_EM9ipdfSA",
  aws_region: "us-east-1",
  user_pool_client_id: "47j0rigp21afji3u407g42gt75",
  identity_pool_id: "us-east-1:3e125cf2-cd62-4ce4-86ee-907b43b9bfe7",
  mfa_methods: [] as string[],
  standard_required_attributes: ["email"] as const,
  username_attributes: ["email"] as const,
  user_verification_types: ["email"] as const,
  groups: [{ admin: { precedence: 0 } }],
  mfa_configuration: "NONE" as const,
  password_policy: {
    min_length: 8,
    require_lowercase: true,
    require_numbers: true,
    require_symbols: true,
    require_uppercase: true,
  },
  unauthenticated_identities_enabled: true,
} as const;

// Configure Amplify with all resources (auth + data).
// Auth always uses production Cognito; data comes from amplify_outputs.json
// (sandbox or production depending on environment).
Amplify.configure({ ...outputs, auth: productionAuth }, { ssr: true });
