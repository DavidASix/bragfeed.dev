import { QueryProvider } from "@/trpc/client";
import { api, HydrateClient } from "@/trpc/server";
import { redirect } from "next/navigation";

import Navigation from "@/components/structure/header/navigation";
import { auth } from "~/auth";

export default async function ProductLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  await api.purchases.getSubscriptionDetails.prefetch(undefined);

  return (
    <QueryProvider>
      <HydrateClient>
        <Navigation />
        <main>{children}</main>
      </HydrateClient>
    </QueryProvider>
  );
}
