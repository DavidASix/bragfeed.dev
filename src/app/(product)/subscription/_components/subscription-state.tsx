"use client";

import {
  Loader2,
  CheckCircle,
  XCircle,
  Calendar,
  CreditCard,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type SubscriptionStateProps = {
  dataIsLoading: boolean;
  cancelIsLoading: boolean;
  hasActiveSubscription: boolean;
  endDate?: Date;
  onClickCheckout: () => void;
  onClickCancel: () => void;
};

const calculateDaysRemaining = (subscriptionEnd: Date) => {
  const now = new Date();
  const diffTime = subscriptionEnd.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
};

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
};

export function SubscriptionState({
  dataIsLoading,
  cancelIsLoading,
  hasActiveSubscription,
  endDate,
  onClickCheckout,
  onClickCancel,
}: SubscriptionStateProps) {
  if (dataIsLoading) {
    return (
      <Card className="max-w-3xl mx-auto">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-10 w-48" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const daysRemaining = endDate ? calculateDaysRemaining(endDate) : 0;

  return (
    <div className="max-w-3xl mx-auto">
      {hasActiveSubscription ? (
        <Card className="border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/20">
          <CardContent className="pt-6">
            <div className="space-y-6">
              {/* Status Header */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-12 h-12 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-green-900 dark:text-green-100">
                      Active Subscription
                    </h2>
                    <p className="text-green-700 dark:text-green-300 text-sm">
                      All features unlocked
                    </p>
                  </div>
                </div>
                <Badge className="bg-green-600 hover:bg-green-700 text-white w-fit">
                  Active
                </Badge>
              </div>

              {/* Subscription Details */}
              <div className="grid md:grid-cols-2 gap-4">
                {endDate && (
                  <>
                    <div className="flex items-start gap-3 p-4 bg-white dark:bg-gray-900 rounded-lg border border-green-200 dark:border-green-900">
                      <Calendar className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Renewal Date
                        </p>
                        <p className="font-semibold text-foreground">
                          {formatDate(endDate)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 bg-white dark:bg-gray-900 rounded-lg border border-green-200 dark:border-green-900">
                      <CreditCard className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Days Remaining
                        </p>
                        <p className="font-semibold text-foreground">
                          {daysRemaining} days
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Action */}
              <div className="pt-2">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
                      disabled={cancelIsLoading}
                    >
                      {cancelIsLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Cancelling...
                        </>
                      ) : (
                        "Cancel Subscription"
                      )}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Cancel Your Subscription?
                      </AlertDialogTitle>
                      <AlertDialogDescription asChild>
                        <div className="space-y-2">
                          <div>
                            Your subscription will be cancelled effective{" "}
                            <strong>{endDate && formatDate(endDate)}</strong>.
                          </div>
                          <div>
                            You will not be charged again, but your review
                            integrations will no longer work after that date.
                          </div>
                          <div className="text-muted-foreground">
                            You may re-subscribe at any time.
                          </div>
                        </div>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={onClickCancel}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Yes, Cancel Subscription
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-orange-200 bg-orange-50/50 dark:border-orange-900 dark:bg-orange-950/20">
          <CardContent className="pt-6">
            <div className="space-y-6">
              {/* Status Header */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-12 h-12 bg-orange-100 dark:bg-orange-900/50 rounded-full flex items-center justify-center">
                    <XCircle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                      No Active Subscription
                    </h2>
                    <p className="text-orange-700 dark:text-orange-300 text-sm">
                      Subscribe to unlock all features
                    </p>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className="border-orange-600 text-orange-600 dark:border-orange-400 dark:text-orange-400 w-fit"
                >
                  Inactive
                </Badge>
              </div>

              {/* Info Alert */}
              <Alert className="bg-orange-100/50 border-orange-300 dark:bg-orange-950/30 dark:border-orange-800">
                <AlertDescription className="text-orange-900 dark:text-orange-100">
                  <div className="font-medium mb-2">
                    Start your subscription to access:
                  </div>
                  <ul className="text-sm space-y-1 ml-4 list-disc">
                    <li>Unlimited Google Reviews integration</li>
                    <li>Full API access for your projects</li>
                    <li>Priority customer support</li>
                  </ul>
                </AlertDescription>
              </Alert>

              {/* Action */}
              <div>
                <Button
                  size="lg"
                  onClick={onClickCheckout}
                  className="w-full md:w-auto"
                >
                  Subscribe Now - $8.99/month
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
