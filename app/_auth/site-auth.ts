import { createHmac } from "node:crypto";

export const COOKIE_NAME = "site_auth";

export function deriveToken(password: string): string {
  return createHmac("sha256", password).update("infiviz-site-auth").digest("hex");
}
