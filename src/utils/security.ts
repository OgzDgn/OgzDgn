import crypto from "node:crypto";

export function sha256(input: string): string {
  return crypto.createHash("sha256").update(input).digest("hex");
}

export function createOpaqueToken(bytes = 48): string {
  return crypto.randomBytes(bytes).toString("hex");
}

export function createId(): string {
  return crypto.randomUUID();
}
