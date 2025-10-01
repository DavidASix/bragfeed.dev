"use client";
import { type User } from "next-auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { LoadingSpinner } from "@/components/ui/custom/loading-spinner";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";

export default function UserNav({ noAuth }: { noAuth?: boolean }) {
  const session = useSession();
  const user = session?.data?.user ?? null;

  if (session.status === "unauthenticated" || noAuth) {
    return (
      <Button asChild>
        <Link href="/login" className="flex items-center gap-2">
          <LogIn className="h-4 w-4" />
          <span className="font-bold">Login</span>
        </Link>
      </Button>
    );
  }

  const getUserInitials = (user: User | null) => {
    if (user?.name) {
      return user.name
        .split(" ")
        .map((name) => name[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    } else if (user?.email) {
      return user.email.split("@")[0].toUpperCase().slice(0, 2);
    } else {
      return "GR";
    }
  };

  const initials = getUserInitials(user);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={!user}>
        <button className="flex justify-center items-center h-9 w-9 rounded-full bg-primary">
          {session.status === "loading" ? (
            <LoadingSpinner className="text-primary-foreground" />
          ) : (
            <span className="text-md font-bold text-primary-foreground">
              {initials}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-40">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/subscription">Subscription</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={async () => {
            await signOut();
          }}
        >
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
