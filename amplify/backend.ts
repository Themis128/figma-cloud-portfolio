import { defineBackend, defineFunction } from "@aws-amplify/backend";

const backend = defineBackend({});

// API Function for handling backend requests
const apiFunction = defineFunction({
  name: "api",
});

backend.addOutput({
  custom: {
    API_FUNCTION_URL: apiFunction.url,
  },
});

export default backend;
