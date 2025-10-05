import { z } from "zod";
import type { APISchema } from "@/schema/types";

const schema = {
  url: "/api/dashboard/get-user-businesses",
  request: z.undefined(),
  response: z.object({
    businesses: z.array(
      z.object({
        id: z.string().uuid(),
        name: z.string().nullable(),
        address: z.string().nullable(),
        stats: z
          .object({
            review_count: z.number().nullable(),
            review_score: z.number().nullable(),
          })
          .nullable(),
        apiCallCount: z.number(),
      }),
    ),
  }),
} satisfies APISchema;

export default schema;
