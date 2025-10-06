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
          <CardTitle>Bragfeed</CardTitle>
          <CardDescription>Access reviews with ease</CardDescription>
          <div className="mt-4">
            <span className="text-3xl font-bold">$8.99</span>
            <span className="text-muted-foreground ml-2">per month</span>
          </div>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            <li className="flex items-center">
              <CheckCircle2 className="w-5 h-5 text-primary mr-2" />
              <span>Unlimited Businesses</span>
            </li>
            <li className="flex items-center">
              <CheckCircle2 className="w-5 h-5 text-primary mr-2" />
              <span>10,000 API requests</span>
            </li>
            <li className="flex items-center">
              <CheckCircle2 className="w-5 h-5 text-primary mr-2" />
              <span>Google review API access</span>
            </li>
            <li className="flex items-center">
              <CheckCircle2 className="w-5 h-5 text-primary mr-2" />
              <span>New reviews fetched on request</span>
            </li>
            <li className="flex items-center">
              <CheckCircle2 className="w-5 h-5 text-primary mr-2" />
              <span>Tool email support</span>
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
          <CardDescription>
            Custom solutions for (very) large teams
          </CardDescription>
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
              <span>10,000+ API requests</span>
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
            <Link
              href={`mailto:david@redoxfordonline.com?subject=${encodeURIComponent("Enterprise Level bragfeed.dev")}&body=${encodeURIComponent("Hello, I'm interested in getting more information about an enterprise level agreement to bragfeed.dev")}`}
            >
              Contact Sales
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
