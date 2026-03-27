// API Keys API endpoints
import { Router, Request, Response } from "express";
import { APIKey, UpdateAPIKeyRequest, CreateAPIKeyRequest } from "../../src/types/api";
import crypto from "crypto";

const router = Router();

// Helper function to send Slack notifications
async function sendSlackNotification(message: string, apiKey: APIKey): Promise<void> {
  // Read env vars at call time (not module load time) so dotenv has loaded
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  const channel = process.env.SLACK_CHANNEL || "#personal-website";

  if (!webhookUrl || webhookUrl.trim() === "") {
    console.warn("Slack webhook URL not configured, skipping notification");
    return;
  }

  try {
    const payload = {
      channel,
      username: "API Key Manager",
      text: message,
      icon_emoji: ":key:",
      attachments: [
        {
          color: "#36a64f",
          fields: [
            {
              title: "API Key ID",
              value: apiKey.id,
              short: true
            },
            {
              title: "Name",
              value: apiKey.name,
              short: true
            },
            {
              title: "Status",
              value: apiKey.status,
              short: true
            },
            {
              title: "Workspace",
              value: apiKey.workspace_id || "Default",
              short: true
            }
          ],
          footer: "Portfolio API",
          ts: Math.floor(Date.now() / 1000)
        }
      ]
    };

    await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    console.error("Failed to send Slack notification:", error);
  }
}

// In-memory API key store — resets on server restart.
// TODO: migrate to DynamoDB via Amplify Gen 2 for persistence.
const apiKeys: APIKey[] = [];

// Helper function to find API key by ID
function findApiKeyById(id: string): APIKey | undefined {
  return apiKeys.find(key => key.id === id);
}

// Helper function to validate status
function isValidStatus(status: string): status is "active" | "inactive" | "archived" {
  return ["active", "inactive", "archived"].includes(status);
}

// GET /api/organizations/api_keys - List all API keys
router.get("/", (_req: Request, res: Response) => {
  res.json(apiKeys);
});

// POST /api/organizations/api_keys - Create a new API key
router.post("/", (req: Request, res: Response) => {
  const authReq = req as import("../middleware/requireAuth").AuthenticatedRequest;
  const { name, workspace_id }: CreateAPIKeyRequest = req.body;

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return res.status(400).json({
      error: {
        code: "INVALID_PARAMETER",
        message: "Name is required and must be a non-empty string"
      }
    });
  }

  const id = `ak_${crypto.randomBytes(10).toString("hex")}`;
  const partialHint = id.slice(0, 7);

  const newKey: APIKey = {
    id,
    created_at: new Date().toISOString(),
    created_by: { id: authReq.uid ?? "unknown", type: "user" },
    name: name.trim(),
    partial_key_hint: partialHint,
    status: "active",
    type: "api_key",
    workspace_id: workspace_id ?? null,
  };

  apiKeys.push(newKey);

  void sendSlackNotification(`New API Key "${newKey.name}" created.`, newKey);

  res.status(201).json(newKey);
});

// GET /api/organizations/api_keys/{api_key_id} - Get API Key details
router.get("/:api_key_id", (req: Request, res: Response) => {
  const { api_key_id } = req.params;

  // Validate ID format (alphanumeric + hyphens only)
  if (!api_key_id || !/^[\w-]+$/.test(api_key_id)) {
    return res.status(400).json({
      error: { code: "INVALID_ID", message: "Invalid API key ID format" },
    });
  }

  const apiKey = findApiKeyById(api_key_id);

  if (!apiKey) {
    return res.status(404).json({
      error: { code: "NOT_FOUND", message: "API key not found" },
    });
  }

  res.json(apiKey);
});

// POST /api/organizations/api_keys/{api_key_id} - Update API Key
router.post("/:api_key_id", (req: Request, res: Response) => {
  const { api_key_id } = req.params;
  const { name, status }: UpdateAPIKeyRequest = req.body;
  
  // Find the API key
  const apiKeyIndex = apiKeys.findIndex(key => key.id === api_key_id);
  
  if (apiKeyIndex === -1) {
    return res.status(404).json({
      error: {
        code: "NOT_FOUND",
        message: `API key with ID ${api_key_id} not found`
      }
    });
  }
  
  const apiKey = apiKeys[apiKeyIndex];
  
  // Validate input
  if (name !== undefined && (typeof name !== "string" || name.trim().length === 0)) {
    return res.status(400).json({
      error: {
        code: "INVALID_PARAMETER",
        message: "Name must be a non-empty string if provided"
      }
    });
  }
  
  if (status !== undefined && !isValidStatus(status)) {
    return res.status(400).json({
      error: {
        code: "INVALID_PARAMETER",
        message: "Status must be one of: active, inactive, archived"
      }
    });
  }
  
  // Store original values for notification
  const originalName = apiKey.name;
  const originalStatus = apiKey.status;
  
  // Update the API key
  if (name !== undefined) {
    apiKey.name = name.trim();
  }
  
  if (status !== undefined) {
    apiKey.status = status;
  }
  
  // Send Slack notification about the update
  const changes: string[] = [];
  if (name !== undefined && name.trim() !== originalName) {
    changes.push(`Name: "${originalName}" → "${apiKey.name}"`);
  }
  if (status !== undefined && status !== originalStatus) {
    changes.push(`Status: ${originalStatus} → ${apiKey.status}`);
  }
  
  if (changes.length > 0) {
    const message = `API Key "${apiKey.name}" has been updated:\n• ${changes.join('\n• ')}`;
    sendSlackNotification(message, apiKey);
  }
  
  // Return the updated API key
  res.json(apiKey);
});

// DELETE /api/organizations/api_keys/{api_key_id} - Delete API Key
router.delete("/:api_key_id", (req: Request, res: Response) => {
  const { api_key_id } = req.params;
  const index = apiKeys.findIndex(key => key.id === api_key_id);

  if (index === -1) {
    return res.status(404).json({
      error: {
        code: "NOT_FOUND",
        message: `API key with ID ${api_key_id} not found`
      }
    });
  }

  const deleted = apiKeys.splice(index, 1)[0];

  if (deleted) {
    void sendSlackNotification(`API Key "${deleted.name}" (${deleted.id}) has been deleted.`, deleted);
  }

  res.json({ id: api_key_id, deleted: true });
});

export default router;