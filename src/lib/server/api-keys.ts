import { and, eq } from "drizzle-orm";

import { db } from "@/schema/db";
import { api_keys } from "@/schema/schema";
import { encryptDeterministic } from "@/lib/encryption";

/**
 * Generates, stores, and returns a new plaintext API key for a user.
 *
 * @param userId - User who will own the generated key.
 * @returns The plaintext key shown to the user once after encrypted storage.
 */
export async function generateApiKey(userId: string): Promise<string> {
  const key = Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  const encryptedKey = await encryptDeterministic(key);
  await db.insert(api_keys).values({ key: encryptedKey, user_id: userId });
  return key;
}

/**
 * Resolves the owner of a current API key without exposing transport concerns.
 *
 * @param key - Plaintext API key received from an authenticated boundary.
 * @returns The owning user ID, or null when the key is missing, invalid, or expired.
 */
export async function getUserIdForApiKey(key: string): Promise<string | null> {
  const encryptedKey = await encryptDeterministic(key);
  const apiKey = await db
    .select()
    .from(api_keys)
    .where(and(eq(api_keys.key, encryptedKey), eq(api_keys.expired, false)))
    .then((rows) => rows[0]);
  return apiKey?.user_id ?? null;
}
