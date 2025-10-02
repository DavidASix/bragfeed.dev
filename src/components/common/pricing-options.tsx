import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function PricingOptions() {
  return (
    <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
      {/* Individual Tool Pricing */}
      {/* Pro Subscription */}
      <Card className="border-primary relative">
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground border-secondary-foreground border px-4 py-1 rounded-full text-sm font-medium">
          Most Popular
        </div>
        <CardHeader>
          <CardTitle>All Access</CardTitle>
          <CardDescription>Access to all tools</CardDescription>
          <div className="mt-4">
            <span className="text-3xl font-bold">$8.99</span>
            <span className="text-muted-foreground ml-2">per month</span>
          </div>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            <li className="flex items-center">
              <CheckCircle2 className="w-5 h-5 text-primary mr-2" />
              <span>Access to all tools</span>
            </li>
            <li className="flex items-center">
              <CheckCircle2 className="w-5 h-5 text-primary mr-2" />
              <span>30,000 API requests</span>
            </li>
            <li className="flex items-center">
              <CheckCircle2 className="w-5 h-5 text-primary mr-2" />
              <span>50 AI Credits per month</span>
            </li>
            <li className="flex items-center">
              <CheckCircle2 className="w-5 h-5 text-primary mr-2" />
              <span>Email support</span>
            </li>
            <li className="flex items-center">
              <CheckCircle2 className="w-5 h-5 text-primary mr-2" />
              <span>Instant access to new tools</span>
            </li>
          </ul>
        </CardContent>
        <CardFooter>
          <Button className="w-full" asChild>
            <Link href="/login">Sign Up</Link>
          </Button>
        </CardFooter>
      </Card>

      {/* Enterprise */}
      <Card>
        <CardHeader>
          <CardTitle>Enterprise</CardTitle>
          <CardDescription>Custom solutions for larger teams</CardDescription>
          <div className="mt-4">
            <span className="text-3xl font-bold">Custom</span>
            <span className="text-muted-foreground ml-2">pricing</span>
          </div>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            <li className="flex items-center">
              <CheckCircle2 className="w-5 h-5 text-primary mr-2" />
              <span>All Pro features</span>
            </li>
            <li className="flex items-center">
              <CheckCircle2 className="w-5 h-5 text-primary mr-2" />
              <span>30,000+ API requests</span>
            </li>
            <li className="flex items-center">
              <CheckCircle2 className="w-5 h-5 text-primary mr-2" />
              <span>Dedicated support manager</span>
            </li>
            <li className="flex items-center">
              <CheckCircle2 className="w-5 h-5 text-primary mr-2" />
              <span>Custom integrations</span>
            </li>
            <li className="flex items-center">
              <CheckCircle2 className="w-5 h-5 text-primary mr-2" />
              <span>Service level agreement</span>
            </li>
          </ul>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full" asChild>
            <Link href="mailto:david@redoxfordonline.com?subject=Enterprise Level ssg.tools&body=Hello, I'm interested in getting more information about an enterprise level agreement to ssg.tools">
              Contact Sales
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
