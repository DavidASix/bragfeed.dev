import { z } from "zod";
import type { APISchema } from "@/schema/types";

const schema = {
  url: "/api/google/get-business-details",
  request: z.object({
    businessId: z.string().uuid(),
  }),
  response: z.object({
    business: z
      .object({
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
      })
      .nullable(),
    reviews: z.array(
      z.object({
        id: z.number(),
        author_name: z.string().nullable(),
        author_image: z.string().nullable(),
        datetime: z.string().nullable(),
        link: z.string().nullable(),
        rating: z.number().nullable(),
        comments: z.string().nullable(),
      }),
    ),
  }),
} satisfies APISchema;

export default schema;
