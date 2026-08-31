"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle,
  ClipboardCopyIcon,
  Eye,
  EyeOff,
  Info,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import { useTRPC } from "@/trpc/client";

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
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/custom/loading-spinner";

interface RegenerateKeyDialogProps {
  children: React.ReactNode;
  onConfirm: () => void;
  isLoading?: boolean;
}

function RegenerateKeyDialog({
  children,
  onConfirm,
  isLoading = false,
}: RegenerateKeyDialogProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Regenerate API Key</AlertDialogTitle>
          <AlertDialogDescription>
            This action will invalidate your current API key and generate a new
            one. All existing implementations using the old key will immediately
            stop working.
            <br />
            <br />
            You should only do this if your current API key has been compromised
            or you suspect it has been exposed.
            <br />
            <br />
            Are you sure you want to continue?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700"
          >
            Yes, Regenerate Key
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

interface CreateNewApiKeyProps {
  showDetails?: boolean;
  className?: string;
  onKeyGenerated?: (key: string) => void;
}

export default function CreateNewApiKey({
  showDetails = true,
  className = "",
  onKeyGenerated,
}: CreateNewApiKeyProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [showApiKey, setShowApiKey] = useState(false);

  const subscriptionQuery = useQuery(
    trpc.purchases.getSubscriptionDetails.queryOptions(undefined, {
      meta: {
        errorMessage: "Failed to check subscription status",
      },
    }),
  );

  const apiKeyQuery = useQuery(
    trpc.security.getLatestActiveKey.queryOptions(undefined, {
      select: (data) => data.apiKey,
      meta: {
        errorMessage: "Failed to fetch API key",
      },
    }),
  );

  const generateKeyMutation = useMutation(
    trpc.security.createApiKey.mutationOptions({
      onSuccess: async ({ key }) => {
        toast.success("API key generated successfully");
        await queryClient.invalidateQueries(
          trpc.security.getLatestActiveKey.queryFilter(),
        );
        if (onKeyGenerated) {
          onKeyGenerated(key);
        }
      },
      onError: (error) => {
        console.log("Error generating API key:", error);
        toast.error("Error generating API key");
      },
    }),
  );

  const currentApiKey = apiKeyQuery.data;

  const generateApiKey = () => {
    generateKeyMutation.mutate();
  };

  const copyApiKey = () => {
    if (currentApiKey) {
      navigator.clipboard.writeText(currentApiKey);
      toast.success("API key copied to clipboard");
    }
  };

  const toggleApiKeyVisibility = () => {
    setShowApiKey(!showApiKey);
  };

  const hasApiKey = !apiKeyQuery.isLoading && currentApiKey;
  const hasActiveSubscription = subscriptionQuery.data?.hasActiveSubscription;

  if (subscriptionQuery.isLoading) {
    return (
      <div className={className}>
        <div className="flex items-center space-x-2 justify-center py-8">
          <LoadingSpinner size={32} />
        </div>
      </div>
    );
  }

  if (!hasActiveSubscription) {
    return (
      <div className={className}>
        {showDetails && (
          <div className="mb-6">
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">
              Your API Key
            </h3>
            <p className="text-base text-gray-600">
              This key allows your website to securely fetch reviews from our
              service.
            </p>
          </div>
        )}

        <div className="text-center py-12 space-y-6">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
            <Info className="w-8 h-8 text-gray-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Subscription Required
            </h3>
            <p className="text-gray-600 mb-4">
              You need an active subscription to generate and use API keys.
            </p>
            <Button asChild size="lg">
              <Link href="/subscription">Set Up Subscription</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {showDetails && (
        <div className="mb-6">
          <h3 className="text-2xl font-semibold text-gray-900 mb-2">
            Your API Key
          </h3>
          <p className="text-base text-gray-600">
            This key allows your website to securely fetch reviews from our
            service.
          </p>
        </div>
      )}

      {apiKeyQuery.isLoading ? (
        <div className="flex items-center space-x-2 justify-center py-8">
          <LoadingSpinner size={16} />
          <span>Checking API key status...</span>
        </div>
      ) : hasApiKey ? (
        <div className="space-y-4">
          <div className="flex items-center space-x-2 text-green-800 font-medium">
            <CheckCircle className="w-5 h-5" />
            <span>API key is active and ready to use</span>
          </div>

          <div className="bg-white border border-green-200 p-4 rounded-lg">
            <div className="font-mono text-sm break-all">
              {currentApiKey
                ? showApiKey
                  ? currentApiKey
                  : `${currentApiKey.slice(0, 12)}${"•".repeat(20)}`
                : ""}
            </div>
          </div>

          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleApiKeyVisibility}
              className="flex items-center space-x-1"
            >
              {showApiKey ? (
                <>
                  <EyeOff className="w-4 h-4" />
                  <span>Hide</span>
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4" />
                  <span>Show</span>
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={copyApiKey}
              className="flex items-center space-x-1"
            >
              <ClipboardCopyIcon className="w-4 h-4" />
              <span>Copy</span>
            </Button>
            <RegenerateKeyDialog
              onConfirm={generateApiKey}
              isLoading={generateKeyMutation.isPending}
            >
              <Button
                variant="outline"
                size="sm"
                disabled={generateKeyMutation.isPending}
                className="flex items-center space-x-1"
              >
                {generateKeyMutation.isPending ? (
                  <>
                    <LoadingSpinner size={16} />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    <span>Regenerate</span>
                  </>
                )}
              </Button>
            </RegenerateKeyDialog>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 space-y-4">
          <p className="text-gray-600">
            You need to create an API key to access your reviews
          </p>
          <Button
            onClick={generateApiKey}
            disabled={generateKeyMutation.isPending}
            size="lg"
          >
            {generateKeyMutation.isPending ? (
              <>
                <LoadingSpinner size={16} className="mr-2" />
                Generating API Key...
              </>
            ) : (
              "Create API Key"
            )}
          </Button>
        </div>
      )}

      {/* Warning message - always shown */}
      <div className="mt-6 flex items-start text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
        <Info className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
        <p>
          Generating a new key will invalidate any existing keys. Only use this
          if your current key has been compromised.
        </p>
      </div>
    </div>
  );
}
