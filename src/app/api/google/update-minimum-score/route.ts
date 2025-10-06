import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";

import { NextRouteContext, RequestHandler } from "@/middleware/types";
import { withAuth } from "@/middleware/withAuth";
import { withBody } from "@/middleware/withBody";
import { db } from "@/schema/db";
import { businesses } from "@/schema/schema";

import schema from "./schema";

export const POST: RequestHandler<NextRouteContext> = withAuth(
  withBody(schema, async (_, context) => {
    const { user_id, body } = context;
    const { businessId, minimumScore } = body;

    // Update the business minimum_score
    const result = await db
      .update(businesses)
      .set({ minimum_score: minimumScore })
      .where(
        and(eq(businesses.id, businessId), eq(businesses.user_id, user_id)),
      )
      .returning({ id: businesses.id });

    if (result.length === 0) {
      return NextResponse.json(
        { error: "Business not found or unauthorized" },
        { status: 404 },
      );
    }

    const response = schema.response.parse({ success: true });
    return NextResponse.json(response);
  }),
);
