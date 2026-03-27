import type { Request, Response, NextFunction } from "express";
import { CognitoJwtVerifier } from "aws-jwt-verify";

export interface AuthenticatedRequest extends Request {
  uid?: string;
  email?: string;
  groups?: string[];
}

// Cognito JWT verifier — requires env vars for user pool config.
// Fails loudly if not configured (no silent fallback to sandbox pool).
const userPoolId = process.env.COGNITO_USER_POOL_ID;
const clientId = process.env.COGNITO_CLIENT_ID ?? null;

if (!userPoolId && process.env.NODE_ENV === "production") {
  throw new Error("COGNITO_USER_POOL_ID must be set in production");
}

const verifier = userPoolId
  ? CognitoJwtVerifier.create({ userPoolId, clientId, tokenUse: "id" })
  : null;

export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  if (!verifier) {
    // No Cognito configured (local dev without auth) — skip auth
    next();
    return;
  }

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
