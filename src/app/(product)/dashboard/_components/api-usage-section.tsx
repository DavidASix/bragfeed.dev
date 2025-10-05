import { Activity, TrendingUp, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { MONTHLY_API_LIMIT } from "@/lib/config";

interface ApiUsageSectionProps {
  totalApiCalls: number;
  monthlyApiCalls: number;
  dailyAverageApiCalls: number;
  latestApiCall: {
    timestamp: Date;
    businessName: string | null;
  } | null;
}

export function ApiUsageSection({
  totalApiCalls,
  monthlyApiCalls,
  dailyAverageApiCalls,
  latestApiCall,
}: ApiUsageSectionProps) {
  const monthlyPercentage = Math.min(
    (monthlyApiCalls / MONTHLY_API_LIMIT) * 100,
    100,
  );

  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60)
      return `${diffMins} minute${diffMins !== 1 ? "s" : ""} ago`;
    if (diffHours < 24)
      return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;

    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Usage Statistics</h2>
        <p className="text-muted-foreground">
          Monitor your API usage and track performance metrics
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Left Card - Total Lifetime API Requests */}
        <Card className="p-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  Lifetime API Requests
                </p>
                <p className="text-2xl font-bold">
                  {totalApiCalls.toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Activity className="w-6 h-6 text-primary" />
              </div>
            </div>
            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground">Daily Average</p>
              <p className="text-lg font-semibold">
                {dailyAverageApiCalls.toLocaleString()}
              </p>
            </div>
          </div>
        </Card>

        {/* Middle Card - Monthly Usage with Progress */}
        <Card className="p-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Monthly Usage</p>
                <p className="text-2xl font-bold">
                  {monthlyApiCalls.toLocaleString()}{" "}
                  <span className="text-sm text-muted-foreground font-normal">
                    / {MONTHLY_API_LIMIT.toLocaleString()}
                  </span>
                </p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
            </div>
            <div className="space-y-1">
              <Progress value={monthlyPercentage} className="h-2" />
              <p className="text-xs text-muted-foreground text-right">
                {monthlyPercentage.toFixed(1)}% of monthly limit
              </p>
            </div>
          </div>
        </Card>

        {/* Right Card - Last API Call */}
        <Card className="p-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Last API Call</p>
                <p className="text-2xl font-bold">
                  {latestApiCall
                    ? formatRelativeTime(latestApiCall.timestamp)
                    : "Never"}
                </p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-primary" />
              </div>
            </div>
            {latestApiCall?.businessName && (
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground">Business</p>
                <p className="text-sm font-medium truncate">
                  {latestApiCall.businessName}
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
