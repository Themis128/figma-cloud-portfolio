import { Amplify } from "aws-amplify";
import outputs from "../../amplify_outputs.json";

// Configure Amplify with all resources (auth + data).
// Auth: Cognito User Pools (email login, admin group).
// Data: AppSync GraphQL + DynamoDB (ContactSubmission, Booking).
Amplify.configure(outputs, { ssr: true });
