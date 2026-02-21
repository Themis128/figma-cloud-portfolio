import { a, defineData, type ClientSchema } from "@aws-amplify/backend";

import { schema as agentSchema } from './agent-schema'

const schema = agentSchema;

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "userPool",
  },
});
