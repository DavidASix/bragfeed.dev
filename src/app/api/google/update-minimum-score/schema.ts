import { z } from "zod";
import type { APISchema } from "@/schema/types";

const schema = {
  url: "/api/google/update-minimum-score",
  request: z.object({
    businessId: z.string().uuid(),
    minimumScore: z.number().int().min(1).max(5),
  }),
  response: z.object({
    success: z.boolean(),
  }),
} satisfies APISchema;

export default schema;
