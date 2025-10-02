"use client";

import UserNav from "./user-nav";
import QuickLinkDropdown from "./quick-link-dropdown";

export default function Navigation({ noAuth }: { noAuth?: boolean }) {
  return (
    <nav className="w-full bg-muted/40 border-b border-border py-3 px-4 md:px-6 flex justify-between items-center">
      <QuickLinkDropdown noAuth={noAuth} />
      <UserNav noAuth={noAuth} />
    </nav>
  );
}
