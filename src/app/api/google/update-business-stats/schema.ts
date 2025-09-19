import { z } from "zod";
import type { APISchema } from "@/schema/types";

const schema = {
  url: "/api/google/update-business-stats",
  request: z.object({
    business_id: z.string().uuid(),
  }),
  response: z.object({
    business_id: z.string().uuid(),
    review_count: z.number().nullable(),
    review_score: z.number().nullable(),
  }),
} satisfies APISchema;

export default schema;
