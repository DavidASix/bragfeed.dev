import { NextResponse } from "next/server";

import schema from "./schema";
import { NextRouteContext, RequestHandler } from "@/middleware/types";
import { withAuth } from "@/middleware/withAuth";
import { withBody } from "@/middleware/withBody";

import { selectBusinessReviews } from "@/lib/server/google/select";
import { recordEvent } from "@/lib/server/events";
import { userHasOwnership } from "@/lib/ownership";
import { businesses } from "@/schema/schema";

export const POST: RequestHandler<NextRouteContext> = withAuth(
  withBody(schema, async (_, context) => {
    try {
      const { business_id } = context.body;

      await userHasOwnership(context.user_id, business_id, businesses);
      const businessReviews = await selectBusinessReviews(business_id, 1);
      const response = schema.response.parse(businessReviews);
      await recordEvent("fetch_reviews", context.user_id, {
        business_id: business_id,
      });
      return NextResponse.json(response);
    } catch (error) {
      console.log(error);
      return NextResponse.json(
        { error: "Something went wrong" },
        { status: 400 },
      );
    }
  }),
);
