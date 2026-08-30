import { z } from "zod";

export const inputSchema = z.object({
  business_id: z.string().uuid(),
});

export const outputSchema = z.object({
  reviews: z.array(
    z.object({
      author_name: z.string().nullable(),
      author_image: z.string().nullable(),
      datetime: z.string().datetime().nullable(),
      link: z.string().nullable(),
      rating: z.number().nullable(),
      comments: z.string().nullable(),
    }),
  ),
  stats: z.object({
    review_count: z.number().nullable(),
    review_score: z.number().nullable(),
  }),
});
