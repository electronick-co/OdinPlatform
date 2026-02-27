// Must be the first import in index.ts
// Loads .env from repo root for local dev.
// In production (Railway) env vars are injected directly — dotenv no-ops silently.
import dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(process.cwd(), "../../.env") });
