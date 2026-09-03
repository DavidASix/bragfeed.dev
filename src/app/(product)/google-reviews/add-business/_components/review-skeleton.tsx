import { Skeleton } from "@/components/ui/skeleton";

export function ReviewSkeleton() {
  return (
    <div className="flex items-start space-x-3 p-4 bg-card rounded-lg border">
      <Skeleton className="w-10 h-10 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  );
}
