import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';

/**
 * @description Auth-only backend — AppSync/DynamoDB removed (unused).
 * Contact form uses SES+Slack, bookings use Cal.com API directly.
 */
const backend = defineBackend({
  auth,
});

export default backend;
