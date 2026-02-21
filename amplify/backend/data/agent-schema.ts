import { a, defineData, type ClientSchema } from "@aws-amplify/backend";

const schema = a.schema({
  Agent: a
    .model({
      name: a.string().required(),
      description: a.string(),
      createdAt: a.timestamp().default(() => new Date()),
      updatedAt: a.timestamp().default(() => new Date()),
    })
    .authorization((allow) => [allow.owner()]),

  AgentVersion: a
    .model({
      agentId: a.string().required(),
      version: a.integer().required(),
      config: a.json().required(),
      createdAt: a.timestamp().default(() => new Date()),
    })
    .authorization((allow) => [allow.owner()]),

  AgentExecution: a
    .model({
      agentId: a.string().required(),
      startedAt: a.timestamp().default(() => new Date()),
      endedAt: a.timestamp(),
      status: a.string().required(),
      error: a.string(),
      metrics: a.json(),
    })
    .authorization((allow) => [allow.owner()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "userPool",
  },
});
