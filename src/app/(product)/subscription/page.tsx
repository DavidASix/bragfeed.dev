"use client";

import { toast } from "sonner";
import { api } from "@/trpc/client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { SubscriptionState } from "./_components/subscription-state";

export default function SubscriptionPage() {
  const utils = api.useUtils();

  const subscriptionQuery = api.purchases.getSubscriptionDetails.useQuery(
    undefined,
    {
      meta: {
        errorMessage: "Failed to fetch subscription status",
      },
    },
  );

  const checkoutMutation = api.purchases.initializeCheckout.useMutation();

  const onClickCheckout = async () => {
    try {
      const checkout = await checkoutMutation.mutateAsync({
        product: "all_access",
      });
      if (!checkout.session.url) {
        throw new Error("Error initializing checkout session");
      }
      window.location.assign(checkout.session.url);
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("Failed to initiate checkout. Please try again later.");
    }
  };

  const cancelSubscriptionMutation =
    api.purchases.cancelSubscription.useMutation({
      onSuccess: (result) => {
        if (result.success) {
          toast.success(result.message);
          // Refresh subscription status to reflect the cancellation
          utils.purchases.getSubscriptionDetails.invalidate();
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
            hasBillingOverride={
              subscriptionQuery.data?.hasBillingOverride ?? false
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
