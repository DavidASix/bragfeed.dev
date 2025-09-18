import { z } from "zod";
import type { APISchema } from "@/schema/types";

const schema = {
  url: "/api/google/fetch-reviews",
  request: z.object({
    business_id: z.string().uuid(),
  }),
  response: z
    .object({
      author_name: z.string().nullable(),
      author_image: z.string().nullable(),
      datetime: z.string().nullable(),
      link: z.string().nullable(),
      rating: z.number().nullable(),
      comments: z.string().nullable(),
    })
    .array(),
} satisfies APISchema;

export default schema;
