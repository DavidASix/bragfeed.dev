import { arrayToTuple } from "./data-types";

export type Product = {
  slug: string;
  id: string; // Stripe product ID
  name: string;
  description: string;
  price_id: string;
  type: "subscription" | "one-time";
};

/**
 * Products priced in Canadian dollars (CAD).
 * price_id for testing: price_1RQaBMAY1r2O5Na5Kfg5joLI
 */
export const products = {
  all_access: {
    slug: "all_access",
    id: "prod_SLGiKkhJQ7qFox",
    name: "All Access",
    description: "Access to all features",
    price_id:
      process.env.NODE_ENV === "development"
        ? "price_1RQaBMAY1r2O5Na5Kfg5joLI"
        : "price_1RQZKfAY1r2O5Na5LVmPxVI6",
    type: "subscription",
  },
  ai_credit: {
    slug: "ai_credit",
    id: "",
    name: "AI Credit",
    description: "100 AI credits for use with AI features",
    price_id: "",
    type: "one-time",
  },
} satisfies Record<string, Product>;

export const productKeys = arrayToTuple(
  Object.keys(products) as (keyof typeof products)[],
);
