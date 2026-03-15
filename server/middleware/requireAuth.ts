import type { Request, Response, NextFunction } from "express";
import { CognitoJwtVerifier } from "aws-jwt-verify";

export interface AuthenticatedRequest extends Request {
  uid?: string;
  email?: string;
  groups?: string[];
}

// Cognito JWT verifier — uses env vars for user pool config.
// Falls back to sandbox values for local development.
const verifier = CognitoJwtVerifier.create({
  userPoolId:
    process.env.COGNITO_USER_POOL_ID ?? "us-east-1_ftPxvHt7n",
  clientId:
    process.env.COGNITO_CLIENT_ID ?? null,
  tokenUse: "id",
});

export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing or invalid authorization header" });
    return;
  }

  try {
    const payload = await verifier.verify(header.slice(7));
    req.uid = payload.sub;
    req.email = typeof payload.email === "string" ? payload.email : undefined;
    req.groups =
      Array.isArray(payload["cognito:groups"])
        ? (payload["cognito:groups"] as string[])
        : [];
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}
