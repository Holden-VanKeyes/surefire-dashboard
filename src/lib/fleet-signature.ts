import { createHmac, timingSafeEqual } from "node:crypto";

const SIGNATURE_HEADER = "x-fleet-signature-256";
const TIMESTAMP_HEADER = "x-fleet-timestamp";
const MAX_TIMESTAMP_SKEW_SECONDS = 5 * 60;

export function verifyFleetSignature(rawBody: string, headers: Headers): boolean {
  const signatureHeader = headers.get(SIGNATURE_HEADER);
  const timestampHeader = headers.get(TIMESTAMP_HEADER);
  const secret = process.env.FLEET_WEBHOOK_SECRET;

  if (!signatureHeader || !timestampHeader || !secret) return false;

  const timestamp = Number(timestampHeader);
  if (!Number.isFinite(timestamp)) return false;

  const nowSeconds = Math.floor(Date.now() / 1000);
  if (nowSeconds - timestamp > MAX_TIMESTAMP_SKEW_SECONDS) return false;

  const secretBytes = Buffer.from(secret, "base64");
  const signedContent = `${timestampHeader}.${rawBody}`;
  const expectedHex = createHmac("sha256", secretBytes).update(signedContent).digest("hex");

  const expected = Buffer.from(expectedHex, "hex");
  const actual = Buffer.from(signatureHeader, "hex");

  if (expected.length !== actual.length) return false;
  return timingSafeEqual(expected, actual);
}
