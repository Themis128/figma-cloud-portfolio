import { defineData } from '@aws-amplify/backend';

export const data = defineData({
  schema: `
    type Todo @model {
      id: ID!
      content: String!
      completed: Boolean
    }
  `,
});