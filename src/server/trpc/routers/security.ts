import { and, desc, eq } from "drizzle-orm";

import { decrypt } from "@/lib/encryption";
import { generateApiKey } from "@/lib/server/api-keys";
import { db } from "@/schema/db";
import { api_keys } from "@/schema/schema";
import { paidProcedure, protectedProcedure, router } from "../init";

export const securityRouter = router({
  getLatestActiveKey: protectedProcedure.query(async ({ ctx }) => {
    const [apiKey] = await db
      .select()
      .from(api_keys)
      .where(and(eq(api_keys.user_id, ctx.userId), eq(api_keys.expired, false)))
      .orderBy(desc(api_keys.created_at));

    return { apiKey: apiKey ? await decrypt(apiKey.key) : null };
  }),

  createApiKey: paidProcedure.mutation(async ({ ctx }) => {
    await db
      .update(api_keys)
      .set({ expired: true })
      .where(eq(api_keys.user_id, ctx.userId));
    return { key: await generateApiKey(ctx.userId) };
  }),
});
