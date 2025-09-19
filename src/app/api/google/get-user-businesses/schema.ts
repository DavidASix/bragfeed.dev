import { z } from "zod";
import type { APISchema } from "@/schema/types";

const schema = {
  url: "/api/google/get-user-businesses",
  request: z.undefined(),
  response: z.object({
    businesses: z.array(
      z.object({
        id: z.string().uuid(),
        name: z.string().nullable(),
        place_id: z.string().nullable(),
        address: z.string().nullable(),
        stats: z
          .object({
            review_count: z.number().nullable(),
            review_score: z.number().nullable(),
          })
          .nullable(),
      }),
    ),
  }),
} satisfies APISchema;

export default schema;
