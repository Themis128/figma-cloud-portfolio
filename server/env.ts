// Side-effect module: loads .env files before any other module reads process.env.
// MUST be the first import in server/index.ts.
//
// Mirrors Next.js loading order: .env.local overrides .env.
// dotenv won't overwrite existing values, so load .env.local first.
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config(); // .env as fallback for vars not in .env.local
