import { z } from "zod";
import { stringDate, type APISchema } from "@/schema/types";

const schema = {
  url: "/api/fetch-updated-data",
  request: z.object({
    business_id: z.string().uuid(),
  }),
  response: z.object({
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
