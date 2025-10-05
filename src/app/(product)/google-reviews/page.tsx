"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

import getUserBusinessesSchema from "@/app/api/dashboard/get-user-businesses/schema";
import requests from "@/lib/requests";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/custom/loading-spinner";

export default function GoogleReviewsHomePage() {
  const businessesQuery = useQuery({
    queryKey: ["userBusinesses"],
    queryFn: async () => {
      return requests.get(getUserBusinessesSchema);
    },
    meta: {
      errorMessage: "Failed to fetch businesses",
    },
  });

  return (
    <>
      <section className="section section-padding">
        <div className="content text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 lg:text-5xl mb-6">
            Google Reviews
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Manage your Google Business Profile integrations and display reviews
            on your static websites
          </p>
          <Button size="lg" asChild>
            <Link href="/google-reviews/add-business">Add New Business</Link>
          </Button>
        </div>
      </section>

      <section className="section section-padding bg-gray-50">
        <div className="content">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Your Businesses
          </h2>

          {businessesQuery.isLoading && (
            <div className="flex justify-center py-8">
              <LoadingSpinner size={32} />
            </div>
          )}

          {businessesQuery.data?.businesses && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {businessesQuery.data.businesses.map((business) => (
                <Card
                  key={business.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {business.name || "Unnamed Business"}
                    </CardTitle>
                    <CardDescription>
                      {business.address || "No address available"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {business.stats ? (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Reviews:</span>
                          <span className="font-medium">
                            {business.stats.review_count || 0}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Rating:</span>
                          <span className="font-medium">
                            {business.stats.review_score
                              ? `${business.stats.review_score.toFixed(1)}/5`
                              : "No rating"}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">
                        No stats available
                      </p>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full" asChild>
                      <Link href={`/google-reviews/${business.id}`}>View</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}

          {businessesQuery.data?.businesses?.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">
                You haven&apos;t added any businesses yet.
              </p>
              <Button asChild>
                <Link href="/google-reviews/add-business">
                  Add Your First Business
                </Link>
              </Button>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
