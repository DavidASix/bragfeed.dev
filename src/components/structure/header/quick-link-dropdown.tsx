"use client";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/custom/loading-spinner";
import Link from "next/link";
import Image from "next/image";
import { applications } from "./quick-links";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const HeaderLogoImage = () => {
  return (
    <div className="flex items-center justify-center">
      <Image
        src="/logo.webp"
        alt="Web Dev Tools"
        width={40}
        height={40}
        className="h-8 w-auto"
      />

      <span className="ml-2 mb-1 font-bold text-xl text-primary">Bragfeed</span>
    </div>
  );
};

const HeaderLogo = () => {
  return (
    <Link href="/">
      <HeaderLogoImage />
    </Link>
  );
};

export default function QuickLinkDropdown({ noAuth }: { noAuth?: boolean }) {
  const session = useSession();

  if (session.status === "unauthenticated" || noAuth) {
    return <HeaderLogo />;
  }

  if (session.status === "loading") {
    return (
      <div className="flex items-center gap-2">
        <HeaderLogo />
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2 px-2">
          <HeaderLogoImage />
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-48">
        <DropdownMenuLabel>Applications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {applications.map((app) => (
          <DropdownMenuItem key={app.id} asChild>
            <Link href={app.url}>
              <div className="flex items-center gap-2">
                <app.icon className="h-4 w-4" />
                <span>{app.name}</span>
              </div>
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
