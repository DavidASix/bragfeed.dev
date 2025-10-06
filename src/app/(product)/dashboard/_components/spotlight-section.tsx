import Link from "next/link";
import {
  Sparkles,
  Plus,
  AlertTriangle,
  XCircle,
  CreditCard,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MONTHLY_API_LIMIT } from "@/lib/config";

interface SpotlightSectionProps {
  hasBusinesses: boolean;
  monthlyApiCalls: number;
  hasActiveSubscription: boolean;
}

/**
 * Extensible spotlight content registry
 * Add new spotlight announcements here in the future
 *
 * To add a new announcement:
 * 1. Create a new spotlight component below (e.g., MaintenanceSpotlight, NewFeatureSpotlight)
 * 2. Add it to the contentOptions array with a condition and priority
 * 3. Higher priority = shown first (when multiple conditions are true)
 *
 * Example priorities:
 * - Critical announcements: 100
 * - Important updates: 50
 * - Welcome messages: 10
 * - Onboarding (no businesses): 0
 */
type SpotlightContent = {
  component: React.ReactNode;
  priority: number;
};

function NoBusinessesSpotlight() {
  return (
    <Card className="p-12 text-center bg-gradient-to-br from-primary/5 to-primary/10">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
          <Plus className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h2 className="text-3xl font-bold mb-2">Welcome to Bragfeed.dev</h2>
          <p className="text-lg text-muted-foreground">
            Get started by adding your first Google Business to start tracking
            reviews
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/google-reviews/add-business">
            Add Your First Business
          </Link>
        </Button>
      </div>
    </Card>
  );
}

function WelcomeSpotlight() {
  return (
    <Card className="p-8 text-center bg-gradient-to-br from-primary/5 to-primary/10">
      <div className="max-w-2xl mx-auto space-y-3">
        <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
          <Sparkles className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-1">Welcome to Bragfeed.dev</h2>
          <p className="text-muted-foreground">
            Your Google Reviews integration is ready to go. Check your API usage
            below and manage your businesses.
          </p>
        </div>
      </div>
    </Card>
  );
}

function ApproachingLimitSpotlight({
  monthlyApiCalls,
  resetDate,
}: {
  monthlyApiCalls: number;
  resetDate: string;
}) {
  const percentage = ((monthlyApiCalls / MONTHLY_API_LIMIT) * 100).toFixed(1);

  return (
    <Card className="p-8 text-center bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 border-orange-200 dark:border-orange-800">
      <div className="max-w-2xl mx-auto space-y-3">
        <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-1">Approaching Monthly Limit</h2>
          <p className="text-muted-foreground">
            You&apos;ve used{" "}
            <span className="font-semibold text-foreground">
              {monthlyApiCalls.toLocaleString()} ({percentage}%)
            </span>{" "}
            of your {MONTHLY_API_LIMIT.toLocaleString()} monthly API requests.{" "}
            <br />
            Your limit resets on{" "}
            <span className="font-semibold text-foreground">{resetDate}</span>.
          </p>
        </div>
      </div>
    </Card>
  );
}

function LimitReachedSpotlight({ resetDate }: { resetDate: string }) {
  return (
    <Card className="p-8 text-center bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/20 dark:to-rose-950/20 border-red-200 dark:border-red-800">
      <div className="max-w-2xl mx-auto space-y-3">
        <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mx-auto">
          <XCircle className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-1 text-red-900 dark:text-red-100">
            Monthly Limit Reached
          </h2>
          <p className="text-muted-foreground">
            You&apos;ve reached your monthly limit of{" "}
            <span className="font-semibold text-foreground">
              {MONTHLY_API_LIMIT.toLocaleString()}
            </span>{" "}
            API requests.
            <br /> Your limit will reset on{" "}
            <span className="font-semibold text-foreground">{resetDate}</span>.
            <br />
            Contact support if you need to increase your limit.
          </p>
        </div>
      </div>
    </Card>
  );
}

function NoSubscriptionSpotlight() {
  return (
    <Card className="p-8 text-center bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
      <div className="max-w-2xl mx-auto space-y-3">
        <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto">
          <CreditCard className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-1">
            Subscribe to Access Reviews
          </h2>
          <p className="text-muted-foreground">
            You need an active subscription to access your Google Reviews data
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/subscription">View Subscription Plans</Link>
        </Button>
      </div>
    </Card>
  );
}

export function SpotlightSection({
  hasBusinesses,
  monthlyApiCalls,
  hasActiveSubscription,
}: SpotlightSectionProps) {
  // Calculate next reset date (first day of next month)
  const getNextResetDate = () => {
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return nextMonth.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const resetDate = getNextResetDate();
  const usagePercentage = (monthlyApiCalls / MONTHLY_API_LIMIT) * 100;
  const isApproachingLimit = usagePercentage >= 90 && usagePercentage < 100;
  const hasReachedLimit = usagePercentage >= 100;

  /**
   * Spotlight content registry - displays announcements and important messages
   * The highest priority announcement will be shown
   */
  const contentOptions: SpotlightContent[] = [
    // Critical: Monthly limit reached
    {
      component: hasReachedLimit ? (
        <LimitReachedSpotlight resetDate={resetDate} />
      ) : null,
      priority: 100,
    },
    // Warning: Approaching monthly limit (90%+)
    {
      component: isApproachingLimit ? (
        <ApproachingLimitSpotlight
          monthlyApiCalls={monthlyApiCalls}
          resetDate={resetDate}
        />
      ) : null,
      priority: 80,
    },
    // Important: Has business but no active subscription
    {
      component:
        hasBusinesses && !hasActiveSubscription ? (
          <NoSubscriptionSpotlight />
        ) : null,
      priority: 50,
    },
    // Onboarding: No businesses added yet
    {
      component: !hasBusinesses ? <NoBusinessesSpotlight /> : null,
      priority: 0,
    },
    // Default: Welcome message (when user has businesses and subscription)
    {
      component:
        hasBusinesses && hasActiveSubscription ? <WelcomeSpotlight /> : null,
      priority: 10,
    },
    // Example: Add urgent announcements here with priority 100+
    // {
    //   component: <MaintenanceSpotlight />,
    //   priority: 100,
    // },
  ];

  // Select the highest priority content that has a component
  const selectedContent = contentOptions
    .filter((option) => option.component !== null)
    .sort((a, b) => b.priority - a.priority)[0]?.component;

  return <div>{selectedContent}</div>;
}
