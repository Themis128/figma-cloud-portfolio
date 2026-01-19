import { defineBackend, defineFunction } from "@aws-amplify/backend";

const backend = defineBackend({});

const apiFunction = defineFunction({
  name: "api",
});

backend.addOutput({
  custom: {
    API_FUNCTION_URL: apiFunction.url,
  },
});

export default backend;
