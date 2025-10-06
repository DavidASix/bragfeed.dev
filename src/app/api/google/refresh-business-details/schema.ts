import { z } from "zod";
import type { APISchema } from "@/schema/types";

const schema = {
  url: "/api/google/refresh-business-details",
  request: z.object({
    businessId: z.string().uuid(),
  }),
  response: z.object({
    success: z.boolean(),
  }),
} satisfies APISchema;

export default schema;
