import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";

import { db } from "@/schema/db";
import { api_keys } from "@/schema/schema";
import { encryptDeterministic } from "@/lib/encryption";

export async function generateApiKey(user_id: string) {
  const key = Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  const encryptedKey = await encryptDeterministic(key);
  await db.insert(api_keys).values({ key: encryptedKey, user_id });
  return key;
}

/**
 * Function to check if an API key is valid, if so returns the user_id associated with it.
 *
 * @param key
 * @returns user_id if the API key is valid, otherwise undefined.
 */
export async function apiKeyIsValid(key: string) {
  const encryptedKey = await encryptDeterministic(key);
  const apiKey = await db
    .select()
    .from(api_keys)
    .where(and(eq(api_keys.key, encryptedKey), eq(api_keys.expired, false)))
    .then((rows) => rows[0]);
  return apiKey?.user_id;
}

export async function invalidateApiKey(key: string) {
  const encryptedKey = await encryptDeterministic(key);
  await db
    .update(api_keys)
    .set({ expired: true })
    .where(eq(api_keys.key, encryptedKey));
}

export async function checkApiKey(request: NextRequest): Promise<{
  isValid: boolean;
  error: NextResponse | null;
}> {
  const key = request.headers.get("authorization")?.split(" ")[1];
  const encryptedKey = await encryptDeterministic(key || "");
  const isValid = Boolean(await apiKeyIsValid(encryptedKey));

  const response = {
    isValid: isValid,
    error: isValid
      ? null
      : NextResponse.json({ error: "Invalid API key" }, { status: 401 }),
  };
  return response;
}
