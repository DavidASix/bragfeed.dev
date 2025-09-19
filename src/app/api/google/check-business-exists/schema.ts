import { z } from "zod";
import type { APISchema } from "@/schema/types";

const schema = {
  url: "/api/google/check-business-exists",
  request: z.object({
    place_id: z.string(),
  }),
  response: z.object({
    business_id: z.string().uuid().nullable(),
  }),
} satisfies APISchema;

export default schema;
