"use client";

import React from "react";
import { signIn, useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { z } from "zod";
import { toast } from "sonner";
import { Star } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/custom/loading-spinner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  const { data: session, status } = useSession();
  const user = session?.user;

  const handleSignIn = async (formData: FormData) => {
    try {
      const email = z.string().parse(formData.get("email"));
      if (!email) {
        throw new Error("Email is required");
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error("Invalid email");
      }
      const method =
        process.env.NODE_ENV === "development" ? "email" : "resend";
      const signInAttempt = await signIn(method, {
        email,
        redirect: false,
        redirectTo: "/",
      });

      if (!signInAttempt?.ok || !signInAttempt || signInAttempt.error) {
        throw new Error(signInAttempt?.error || "Failed to sign in");
      }

      toast.success("Check your email for a sign in link");
    } catch {
      //console.error("Error signing in:", error);
      toast.error("Error signing in, please try again.");
    }
  };

  if (user) {
    redirect("/");
  }

  // Login Card - reused in both mobile and desktop layouts
  const loginCard =
    status === "loading" ? (
      <div className="flex justify-center">
        <LoadingSpinner />
      </div>
    ) : (
      <Card className="border-border shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl md:text-3xl font-bold">
            Get Started
          </CardTitle>
          <CardDescription className="text-base">
            Enter your email to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={(e) => handleSignIn(e)} className="flex flex-col gap-4">
            <div className="space-y-2">
              <Input
                type="email"
                name="email"
                placeholder="you@example.com"
                className="h-11"
                required
              />
            </div>
            <Button type="submit" size="lg" className="w-full">
              Continue with Email
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              We&apos;ll send you a secure link to access your account
            </p>
          </form>
        </CardContent>
      </Card>
    );

  return (
    <div className="flex flex-col md:flex-row flex-1">
      {/* Left Side - Brand Section */}
      <div className="relative flex-1 bg-gradient-to-br from-primary via-primary/90 to-secondary overflow-hidden flex flex-col">
        <div className="relative z-10 flex flex-col flex-1 justify-between p-8 md:p-12 lg:p-16 text-white border">
          {/* Center Section */}
          <div className="flex-1 flex flex-col justify-center py-8 md:py-12">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 md:mb-6 leading-tight">
              Welcome to Bragfeed
            </h2>
            <p className="text-lg md:text-xl text-white/90 mb-8 md:mb-12 max-w-md leading-relaxed">
              Start integrating fresh Google Reviews into your static sites
              today
            </p>

            {/* Mobile: Show Login Card */}
            <div className="md:hidden w-full max-w-md">{loginCard}</div>

            {/* Desktop: Show Dummy Image Placeholder */}
            <div className="hidden md:flex relative w-full max-w-md aspect-video bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 items-center justify-center">
              <div className="text-center p-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
                  <Star className="w-8 h-8 text-white" />
                </div>
                <p className="text-sm text-white/70">
                  Dashboard preview showing Google Reviews integration with
                  static site generators
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Section - Social Proof */}
          <div className="hidden md:block">
            <Badge
              variant="secondary"
              className="inline-flex items-center gap-3 px-4 py-2 text-sm"
            >
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, index) => (
                  <Star
                    key={index}
                    className="size-4 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>
              <span>Trusted by 24+ developers</span>
            </Badge>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form Section (Desktop Only) */}
      <div className="hidden md:flex flex-1 items-center justify-center p-8 md:p-12 bg-background">
        <div className="w-full max-w-md">{loginCard}</div>
      </div>
    </div>
  );
}
