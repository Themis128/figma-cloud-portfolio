import { Amplify } from "aws-amplify";
import outputs from "../../amplify_outputs.json";

// Configure auth only — skip data/AppSync to avoid probing an unused endpoint.
// When you need AppSync, call configureAmplifyData() first.
const { data: _data, ...authOnlyOutputs } = outputs;
Amplify.configure(authOnlyOutputs, { ssr: true });

let dataConfigured = false;

export function configureAmplifyData() {
  if (!dataConfigured) {
    Amplify.configure(outputs, { ssr: true });
    dataConfigured = true;
  }
}
