"use client";

import React, { useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { z } from "zod";
import { Star, CheckCircle, XCircle, Mail } from "lucide-react";

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
import { Alert, AlertDescription } from "@/components/ui/alert";

type FormState = null | "loading" | "success" | "error";

export default function Home() {
  const { data: session, status } = useSession();
  const user = session?.user;
  const [formState, setFormState] = useState<FormState>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [submittedEmail, setSubmittedEmail] = useState<string>("");

  const handleSignIn = async (formData: FormData) => {
    setFormState("loading");
    setErrorMessage("");

    try {
      const email = z.string().parse(formData.get("email"));
      if (!email) {
        throw new Error("Email is required");
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error("Invalid email format");
      }

      setSubmittedEmail(email);

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

      setFormState("success");
      setFailedAttempts(0);
    } catch (error) {
      console.error("Sign-in error:", error);
      setErrorMessage("Sign-in failed. Please try again.");
      setFormState("error");
      setFailedAttempts((prev) => prev + 1);
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
            {formState === "success"
              ? "Check your inbox"
              : "Enter your email to continue"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {formState === "success" ? (
            <div className="space-y-4">
              <Alert className="bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-900">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                <AlertDescription className="text-green-800 dark:text-green-200">
                  <p className="font-semibold mb-1">Magic link sent!</p>
                  <p className="text-sm">
                    We&apos;ve sent a secure sign-in link to{" "}
                    <span className="font-medium">{submittedEmail}</span>. Click
                    the link in your email to access your account.
                  </p>
                </AlertDescription>
              </Alert>
              <p className="text-xs text-muted-foreground text-center">
                Didn&apos;t receive it? Check your spam folder or try again in a
                few minutes.
              </p>
            </div>
          ) : (
            <form
              action={(e) => handleSignIn(e)}
              className="flex flex-col gap-4"
            >
              {formState === "error" && (
                <Alert className="bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-900">
                  <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                  <AlertDescription className="text-red-800 dark:text-red-200">
                    <p className="font-semibold mb-1">Sign-in failed</p>
                    <p className="text-sm">{errorMessage}</p>
                  </AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  className="h-11"
                  required
                  disabled={formState === "loading"}
                />
              </div>
              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={formState === "loading"}
              >
                {formState === "loading" ? (
                  <span className="flex items-center gap-2">
                    <LoadingSpinner className="h-4 w-4" />
                    Sending magic link...
                  </span>
                ) : (
                  "Continue with Email"
                )}
              </Button>
              {failedAttempts >= 2 && (
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="w-full"
                  asChild
                >
                  <a
                    href={`mailto:dev@redoxfordonline.com?subject=${encodeURIComponent("Bug Report: Login Issue")}&body=${encodeURIComponent(`I am experiencing issues logging in to Bragfeed.\n\nEmail attempted: ${submittedEmail}\nError message: ${errorMessage}\n\nPlease help!`)}`}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Report Login Issue
                  </a>
                </Button>
              )}
              <p className="text-xs text-muted-foreground text-center">
                We&apos;ll send you a secure link to access your account
              </p>
            </form>
          )}
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
