import { z } from "zod";
import { stringDate, type APISchema } from "@/schema/types";

const schema = {
  url: "/api/google/insert-new-business",
  request: z.object({
    place_id: z.string(),
    name: z.string().optional(),
    formatted_address: z.string().optional(),
  }),
  response: z.object({
    business_id: z.string().uuid(),
    reviews: z
      .object({
        author_name: z.string().nullable(),
        author_image: z.string().nullable(),
        datetime: stringDate.nullable(),
        link: z.string().nullable(),
        rating: z.number().nullable(),
        comments: z.string().nullable(),
      })
      .array(),
    stats: z.object({
      review_count: z.number().nullable(),
      review_score: z.number().nullable(),
    }),
  }),
} satisfies APISchema;

export default schema;
