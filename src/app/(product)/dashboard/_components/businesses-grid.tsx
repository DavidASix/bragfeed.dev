import Link from "next/link";
import { Plus, MapPin, Star, Activity } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Business {
  id: string;
  name: string | null;
  address: string | null;
  stats: {
    review_count: number | null;
    review_score: number | null;
  } | null;
  apiCallCount: number;
}

interface BusinessesGridProps {
  businesses: Business[];
  topBusinessId: string | null;
}

interface BusinessSummaryCardProps {
  business: Business;
  isTopBusiness?: boolean;
}

function BusinessSummaryCard({
  business,
  isTopBusiness = false,
}: BusinessSummaryCardProps) {
  const reviewCount = business.stats?.review_count ?? 0;
  const reviewScore = business.stats?.review_score?.toFixed(1) ?? "N/A";

  return (
    <Link href={`/google-reviews/${business.id}`}>
      <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer h-full">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg truncate">
                {business.name ?? "Unnamed Business"}
              </h3>
              {business.address && (
                <div className="flex items-center text-sm text-muted-foreground mt-1">
                  <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                  <span className="truncate">{business.address}</span>
                </div>
              )}
            </div>
            {isTopBusiness && (
              <Badge variant="default" className="ml-2 flex-shrink-0">
                Top
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="flex items-center justify-center text-yellow-500 mb-1">
                <Star className="w-4 h-4 fill-current" />
              </div>
              <div className="text-lg font-semibold">{reviewScore}</div>
              <div className="text-xs text-muted-foreground">Rating</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center text-blue-500 mb-1">
                <Star className="w-4 h-4" />
              </div>
              <div className="text-lg font-semibold">{reviewCount}</div>
              <div className="text-xs text-muted-foreground">Reviews</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center text-green-500 mb-1">
                <Activity className="w-4 h-4" />
              </div>
              <div className="text-lg font-semibold">
                {business.apiCallCount}
              </div>
              <div className="text-xs text-muted-foreground">API Calls</div>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}

function AddBusinessCard() {
  return (
    <Link href="/google-reviews/add-business">
      <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer h-full border-dashed border-2 flex items-center justify-center min-h-[200px]">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <Plus className="w-6 h-6 text-primary" />
          </div>
          <h3 className="font-semibold">Add Business</h3>
          <p className="text-sm text-muted-foreground">
            Connect another Google Business
          </p>
        </div>
      </Card>
    </Link>
  );
}

export function BusinessesGrid({
  businesses,
  topBusinessId,
}: BusinessesGridProps) {
  // Top business is the first in the array (already sorted by API call count desc)
  const computedTopBusinessId = topBusinessId ?? businesses[0]?.id ?? null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {businesses.map((business) => (
        <BusinessSummaryCard
          key={business.id}
          business={business}
          isTopBusiness={business.id === computedTopBusinessId}
        />
      ))}
      <AddBusinessCard />
    </div>
  );
}
