import { cn } from "@/lib/utils";
import { House, Building2, CreditCard } from "lucide-react";
import React from "react";

function IconBase({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-center w-8 h-8 rounded-full",
        className ? className : "bg-gray-300",
      )}
    >
      {children}
    </div>
  );
}

function DashboardIcon({ className }: { className?: string }) {
  return (
    <IconBase className={"bg-primary"}>
      <House className={cn("text-primary-foreground", className)} />
    </IconBase>
  );
}

function AddBusinessIcon({ className }: { className?: string }) {
  return (
    <IconBase className={"bg-secondary"}>
      <Building2 className={cn("text-secondary-foreground", className)} />
    </IconBase>
  );
}

function SubscriptionIcon({ className }: { className?: string }) {
  return (
    <IconBase className={"bg-blue-500"}>
      <CreditCard className={cn("text-white", className)} />
    </IconBase>
  );
}

export const applications = [
  {
    id: "dashboard",
    name: "Dashboard",
    url: "/dashboard",
    icon: DashboardIcon,
  },
  {
    id: "add-business",
    name: "Add Business",
    url: "/google-reviews/add-business",
    icon: AddBusinessIcon,
  },
  {
    id: "subscription",
    name: "Subscription",
    url: "/subscription",
    icon: SubscriptionIcon,
  },
];
