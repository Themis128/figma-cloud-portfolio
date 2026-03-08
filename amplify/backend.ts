import { defineBackend } from '@aws-amplify/backend';
import { data } from './data/resource';
import { auth } from './auth/resource';

/**
 * @description Define your backend with data, auth, and storage resources
 */
const backend = defineBackend({
  data,
  auth,
});

export default backend;