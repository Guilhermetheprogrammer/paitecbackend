import { createHash } from "node:crypto";

export function valueToHash(value: string): string {
  const hash = createHash("sha256");
  hash.update(value);

  return hash.digest("hex");
}
