"use client";

import UserNav from "./user-nav";
import QuickLinkDropdown from "./quick-link-dropdown";
import ThemeSwitcher from "./theme-switcher";

export default function Navigation({ noAuth }: { noAuth?: boolean }) {
  return (
    <nav className="w-full bg-muted/40 border-b border-border py-3 px-4 md:px-6 flex justify-between items-center">
      <QuickLinkDropdown noAuth={noAuth} />
      <div className="flex items-center gap-2">
        <ThemeSwitcher />
        <UserNav noAuth={noAuth} />
      </div>
    </nav>
  );
}
