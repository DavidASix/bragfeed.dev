"use client";

import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import requests from "@/lib/requests";
import dashboardStatsSchema from "@/app/api/dashboard/api-stats/schema";
import getUserBusinessesSchema from "@/app/api/dashboard/get-user-businesses/schema";

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

  const isLoading = statsLoading || businessesLoading;

  if (isLoading) {
    return (
      <div className="space-y-16 py-16">
        <section className="section">
          <div className="content">
            <Skeleton className="h-64 w-full" />
          </div>
        </section>
        <section className="section">
          <div className="content">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Skeleton className="h-48" />
              <Skeleton className="h-48" />
              <Skeleton className="h-48" />
            </div>
          </div>
        </section>
        <section className="section">
          <div className="content">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Skeleton className="h-48" />
              <Skeleton className="h-48" />
              <Skeleton className="h-48" />
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
