import { QueryProvider } from "@/lib/tan-stack/query-provider";
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
    console.log("Session does not exist, redirecting to login");
    redirect("/login");
  }

  return (
    <QueryProvider>
      <Navigation />
      <main>{children}</main>
    </QueryProvider>
  );
}
