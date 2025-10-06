"use client";

import { loadStripe } from "@stripe/stripe-js";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import Stripe from "stripe";

import getSubscriptionDetailsSchema from "@/app/api/purchases/get-subscription-details/schema";
import checkoutContextSchema from "@/app/api/purchases/initialize-checkout/schema";
import cancelSubscriptionSchema from "@/app/api/purchases/cancel-subscription/schema";
import requests from "@/lib/requests";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { SubscriptionState } from "./_components/subscription-state";

export default function SubscriptionPage() {
  const queryClient = useQueryClient();

  const subscriptionQuery = useQuery({
    queryKey: ["subscription-status"],
    queryFn: async () => {
      return await requests.get(getSubscriptionDetailsSchema);
    },
    meta: {
      errorMessage: "Failed to fetch subscription status",
    },
  });

  const onClickCheckout = async () => {
    try {
      const checkout = await requests.post(checkoutContextSchema, {
        product: "all_access",
      });
      const session = checkout.session satisfies Stripe.Checkout.Session;
      const stripe = await loadStripe(
        process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
      );
      if (!session.id || !stripe) {
        throw new Error("Error initializing checkout session or Stripe");
      }
      await stripe.redirectToCheckout({ sessionId: session.id });
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("Failed to initiate checkout. Please try again later.");
    }
  };

  const cancelSubscriptionMutation = useMutation({
    mutationFn: async () => {
      return await requests.post(cancelSubscriptionSchema, undefined);
    },
    onSuccess: (result) => {
      if (result.success) {
        toast.success(result.message);
        // Refresh subscription status to reflect the cancellation
        queryClient.invalidateQueries({
          queryKey: ["subscription-status"],
        });
      } else {
        toast.error(result.message);
      }
    },
    onError: (error) => {
      console.error("Cancel subscription error:", error);
      toast.error("Failed to cancel subscription. Please try again later.");
    },
  });

  return (
    <div className="space-y-16 py-16">
      {/* Header Section */}
      <section className="section">
        <div className="content text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Subscription Management
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto">
            Manage your subscription and access to all Bragfeed tools
          </p>
        </div>
      </section>

      {/* Subscription Status Section */}
      <section className="section">
        <div className="content">
          <SubscriptionState
            dataIsLoading={subscriptionQuery.isLoading}
            cancelIsLoading={cancelSubscriptionMutation.isPending}
            hasActiveSubscription={
              subscriptionQuery.data?.hasActiveSubscription ?? false
            }
            endDate={subscriptionQuery.data?.subscriptionEnd}
            onClickCheckout={onClickCheckout}
            onClickCancel={() => {
              cancelSubscriptionMutation.mutate();
            }}
          />
        </div>
      </section>

      {/* Subscription Benefits Section */}
      <section className="section">
        <div className="content">
          <Card className="max-w-4xl mx-auto border-primary/20">
            <CardHeader>
              <CardTitle className="text-2xl">
                What&apos;s Included in Your Subscription
              </CardTitle>
              <CardDescription className="text-base">
                Get full access to all Bragfeed features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-primary font-bold">✓</span>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">
                      Unlimited Google Reviews
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Fetch reviews from unlimited Google Business Profiles
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-primary font-bold">✓</span>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">API Access</h3>
                    <p className="text-sm text-muted-foreground">
                      Full programmatic access to your reviews data
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-primary font-bold">✓</span>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Priority Support</h3>
                    <p className="text-sm text-muted-foreground">
                      Get help when you need it from our support team
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
