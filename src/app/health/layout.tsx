import type { ReactNode } from "react";

import Footer from "@/components/structure/footer";
import Navigation from "@/components/structure/header/navigation";
import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata({
  title: "Service Health",
  description: "Current availability of BragFeed services.",
});

/** Provides shared navigation and footer chrome without applying an authentication redirect. */
export default function HealthLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Navigation />
      <main className="grow flex flex-col">{children}</main>
      <Footer />
    </>
  );
}
