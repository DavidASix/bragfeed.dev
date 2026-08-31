import { TRPCError } from "@trpc/server";
import { and, count, desc, eq } from "drizzle-orm";
import { z } from "zod";

import { recordEvent } from "@/lib/server/events";
import { selectBusinessStats } from "@/lib/server/google/select";
import {
  updateBusinessReviews,
  updateBusinessStats,
} from "@/lib/server/google/update";
import { db } from "@/schema/db";
import { businesses, reviews } from "@/schema/schema";
import { protectedProcedure, router } from "..";

const businessIdInput = z.object({ businessId: z.string().uuid() });

export const googleRouter = router({
  checkBusinessExists: protectedProcedure
    .input(z.object({ placeId: z.string() }))
    .query(async ({ ctx, input }) => {
      const [business] = await db
        .select({ id: businesses.id })
        .from(businesses)
        .where(
          and(
            eq(businesses.place_id, input.placeId),
            eq(businesses.user_id, ctx.userId),
          ),
        )
        .limit(1);
      return { businessId: business?.id ?? null };
    }),

  getBusinessDetails: protectedProcedure
    .input(businessIdInput)
    .query(async ({ ctx, input }) => {
      const [business] = await db
        .select({
          id: businesses.id,
          name: businesses.name,
          place_id: businesses.place_id,
          address: businesses.address,
          minimum_score: businesses.minimum_score,
        })
        .from(businesses)
        .where(
          and(
            eq(businesses.id, input.businessId),
            eq(businesses.user_id, ctx.userId),
          ),
        )
        .limit(1);
      if (!business) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const [stats, [reviewCount], [latestReview], businessReviews] =
        await Promise.all([
          selectBusinessStats(input.businessId),
          db
            .select({ count: count() })
            .from(reviews)
            .where(eq(reviews.business_id, input.businessId)),
          db
            .select({ created_at: reviews.created_at })
            .from(reviews)
            .where(eq(reviews.business_id, input.businessId))
            .orderBy(desc(reviews.created_at))
            .limit(1),
          db
            .select({
              id: reviews.id,
              author_name: reviews.author_name,
              author_image: reviews.author_image,
              datetime: reviews.datetime,
              link: reviews.link,
              rating: reviews.rating,
              comments: reviews.comments,
            })
            .from(reviews)
            .where(eq(reviews.business_id, input.businessId))
            .orderBy(desc(reviews.datetime)),
        ]);

      return {
        business: {
          ...business,
          stats: {
            review_count: stats.review_count,
            review_score: stats.review_score,
          },
        },
        reviews: businessReviews,
        available_reviews: reviewCount.count,
        last_refreshed: latestReview?.created_at ?? null,
      };
    }),

  addBusiness: protectedProcedure
    .input(
      z.object({
        placeId: z.string(),
        name: z.string().optional(),
        formattedAddress: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [existingBusiness] = await db
        .select({ id: businesses.id })
        .from(businesses)
        .where(
          and(
            eq(businesses.place_id, input.placeId),
            eq(businesses.user_id, ctx.userId),
          ),
        )
        .limit(1);
      if (existingBusiness) {
        throw new TRPCError({ code: "CONFLICT" });
      }

      const [business] = await db
        .insert(businesses)
        .values({
          id: crypto.randomUUID(),
          place_id: input.placeId,
          name: input.name ?? null,
          address: input.formattedAddress ?? null,
          user_id: ctx.userId,
        })
        .returning({ id: businesses.id });
      const stats = await updateBusinessStats(business.id);
      const insertedReviews = await updateBusinessReviews(business.id, 100);
      await recordEvent("update_reviews", ctx.userId, {
        business_id: business.id,
      });
      await recordEvent("update_stats", ctx.userId, {
        business_id: business.id,
      });

      return { businessId: business.id, reviews: insertedReviews, stats };
    }),

  refreshBusinessDetails: protectedProcedure
    .input(businessIdInput)
    .mutation(async ({ ctx, input }) => {
      const [business] = await db
        .select({ id: businesses.id })
        .from(businesses)
        .where(
          and(
            eq(businesses.id, input.businessId),
            eq(businesses.user_id, ctx.userId),
          ),
        )
        .limit(1);
      if (!business) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      await updateBusinessStats(input.businessId);
      await updateBusinessReviews(input.businessId, 100);
      await recordEvent("update_reviews", ctx.userId, {
        business_id: input.businessId,
      });
      await recordEvent("update_stats", ctx.userId, {
        business_id: input.businessId,
      });
      return { success: true };
    }),

  updateMinimumScore: protectedProcedure
    .input(
      businessIdInput.extend({ minimumScore: z.number().int().min(1).max(5) }),
    )
    .mutation(async ({ ctx, input }) => {
      const result = await db
        .update(businesses)
        .set({ minimum_score: input.minimumScore })
        .where(
          and(
            eq(businesses.id, input.businessId),
            eq(businesses.user_id, ctx.userId),
          ),
        )
        .returning({ id: businesses.id });
      if (result.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      return { success: true };
    }),
});
