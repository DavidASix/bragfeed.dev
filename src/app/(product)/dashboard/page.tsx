"use client";

import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import requests from "@/lib/requests";
import dashboardStatsSchema from "@/app/api/dashboard/api-stats/schema";
import getUserBusinessesSchema from "@/app/api/dashboard/get-user-businesses/schema";
import getSubscriptionDetailsSchema from "@/app/api/purchases/get-subscription-details/schema";

import { SpotlightSection } from "./_components/spotlight-section";
import { BusinessesGrid } from "./_components/businesses-grid";
import { ApiUsageSection } from "./_components/api-usage-section";
import CreateNewApiKey from "@/components/common/api-keys/create-new-api-key";

export default function DashboardPage() {
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ["dashboardStats"],
    queryFn: async () => {
      return await requests.get(dashboardStatsSchema);
    },
    meta: {
      errorMessage: "Failed to load dashboard statistics",
    },
  });

  const { data: businessesData, isLoading: businessesLoading } = useQuery({
    queryKey: ["dashboardBusinesses"],
    queryFn: async () => {
      return await requests.get(getUserBusinessesSchema);
    },
    meta: {
      errorMessage: "Failed to load businesses",
    },
  });

  const { data: subscriptionData, isLoading: subscriptionLoading } = useQuery({
    queryKey: ["subscription-status"],
    queryFn: async () => {
      return await requests.get(getSubscriptionDetailsSchema);
    },
    meta: {
      errorMessage: "Failed to load subscription status",
    },
  });

  const isLoading = statsLoading || businessesLoading || subscriptionLoading;

  if (isLoading) {
    return (
      <div className="space-y-16 py-16">
        {/* Spotlight Section Skeleton */}
        <section className="section">
          <div className="content">
            <Skeleton className="h-48 w-full rounded-lg" />
          </div>
        </section>

        {/* Usage Statistics Section Skeleton */}
        <section className="section">
          <div className="content">
            <div className="space-y-6">
              <div>
                <Skeleton className="h-8 w-48 mb-2" />
                <Skeleton className="h-4 w-96" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Skeleton className="h-40 rounded-lg" />
                <Skeleton className="h-40 rounded-lg" />
                <Skeleton className="h-40 rounded-lg" />
              </div>
            </div>
          </div>
        </section>

        {/* Businesses Section Skeleton */}
        <section className="section">
          <div className="content">
            <div className="space-y-6">
              <div>
                <Skeleton className="h-8 w-48 mb-2" />
                <Skeleton className="h-4 w-96" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Skeleton className="h-48 rounded-lg" />
                <Skeleton className="h-48 rounded-lg" />
                <Skeleton className="h-48 rounded-lg" />
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  const hasBusinesses = (businessesData?.businesses.length ?? 0) > 0;
  const topBusinessId = businessesData?.businesses[0]?.id ?? null;

  return (
    <div className="space-y-16 py-16">
      {/* Spotlight Section */}
      <section className="section">
        <div className="content">
          <SpotlightSection
            hasBusinesses={hasBusinesses}
            monthlyApiCalls={statsData?.monthlyApiCalls ?? 0}
            hasActiveSubscription={
              subscriptionData?.hasActiveSubscription ?? false
            }
          />
        </div>
      </section>

      {/* Usage Statistics Section */}
      <section className="section">
        <div className="content">
          <ApiUsageSection
            totalApiCalls={statsData?.totalApiCalls ?? 0}
            monthlyApiCalls={statsData?.monthlyApiCalls ?? 0}
            dailyAverageApiCalls={statsData?.dailyAverageApiCalls ?? 0}
            latestApiCall={statsData?.latestApiCall ?? null}
          />
        </div>
      </section>

      {/* Businesses Section */}
      {businessesData && businessesData.businesses.length > 0 && (
        <section className="section">
          <div className="content">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">Your Businesses</h2>
              <p className="text-muted-foreground">
                Overview of all your connected Google businesses
              </p>
            </div>
            <BusinessesGrid
              businesses={businessesData.businesses}
              topBusinessId={topBusinessId}
            />
          </div>
        </section>
      )}

      {/* API Key Management Section */}
      <section className="section">
        <div className="content">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">API Key Management</h2>
            <p className="text-muted-foreground">
              Generate and manage your API keys for programmatic access
            </p>
          </div>
          <CreateNewApiKey showDetails={true} />
        </div>
      </section>
    </div>
  );
}
