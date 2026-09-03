import { AlertCircle, CheckCircle2, Clock3 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { api } from "@/trpc/server";

export const dynamic = "force-dynamic";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
  timeZoneName: "short",
});

/** Renders the public status page from the health router's current service results. */
export default async function HealthPage() {
  const status = await api.health.getStatus();

  return (
    <section className="section section-padding grow">
      <div className="content max-w-3xl">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold tracking-tight">Service health</h1>
          <p className="mt-3 text-muted-foreground">
            Current availability of BragFeed and its dependencies.
          </p>
        </div>

        <div
          className={`mb-6 flex items-center gap-3 rounded-xl border p-4 ${
            status.healthy
              ? "border-green-200 bg-green-50 text-green-900"
              : "border-destructive/30 bg-destructive/10 text-destructive"
          }`}
        >
          {status.healthy ? (
            <CheckCircle2 className="size-6 shrink-0" aria-hidden="true" />
          ) : (
            <AlertCircle className="size-6 shrink-0" aria-hidden="true" />
          )}
          <div>
            <p className="font-semibold">
              {status.healthy
                ? "All services are operational"
                : "Some services are experiencing issues"}
            </p>
            <p className="text-sm opacity-80">
              Status checks refresh automatically when their cache expires.
            </p>
          </div>
        </div>

        <div className="grid gap-4">
          {status.services.map((service) => (
            <Card key={service.service}>
              <CardHeader className="flex-row items-start justify-between gap-4 space-y-0">
                <div>
                  <CardTitle>{service.name}</CardTitle>
                  <CardDescription className="mt-1.5">
                    {service.description}
                  </CardDescription>
                </div>
                <Badge
                  variant={service.healthy ? "outline" : "destructive"}
                  className={
                    service.healthy
                      ? "border-green-300 bg-green-50 text-green-800"
                      : undefined
                  }
                >
                  {service.healthy ? "Operational" : "Unavailable"}
                </Badge>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{service.message}</p>
                <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <Clock3 className="size-3.5" aria-hidden="true" />
                    Last checked {dateFormatter.format(service.checkedAt)}
                  </span>
                  <span>{service.cadence}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
