"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Star, Code, Users, Globe, RefreshCw } from "lucide-react";

import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { MockWindow } from "@/components/ui/mock-window";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import { ShimmerButton } from "@/components/magicui/shimmer-button";
import PricingOptions from "@/components/common/pricing-options";

import { mockReviews } from "./_components/mock-reviews";

const devCount = 24;
const reviews = {
  count: 16,
  avatars: [
    {
      src: "https://www.shadcnblocks.com/images/block/avatar-1.webp",
      alt: "Frontend developer from Austin",
    },
    {
      src: "https://www.shadcnblocks.com/images/block/avatar-2.webp",
      alt: "Agency owner from Seattle",
    },
    {
      src: "https://www.shadcnblocks.com/images/block/avatar-3.webp",
      alt: "Freelance web developer from NYC",
    },
    {
      src: "https://www.shadcnblocks.com/images/block/avatar-4.webp",
      alt: "JAMstack developer from SF",
    },
    {
      src: "https://www.shadcnblocks.com/images/block/avatar-5.webp",
      alt: "Static site specialist from Portland",
    },
  ],
};

const frameworks = [
  { name: "Gatsby" },
  { name: "Hugo" },
  { name: "Jekyll" },
  { name: "11ty" },
];

const exampleReviews = [
  "Amazing service! They were quick, professional, and went above expectations. Highly recommend to anyone looking for quality work.",
  "Best experience I've had in years. The attention to detail and customer care was outstanding. Will definitely be coming back!",
  "Exceeded all my expectations. From start to finish, everything was handled perfectly. Five stars all the way!",
];

const steps = [
  {
    step: "01",
    title: "Connect Your Business",
    description: "Add your Google Business Profile in 30 seconds",
  },
  {
    step: "02",
    title: "Get Your API Endpoint",
    description: "Copy your unique endpoint URL for your static site",
  },
  {
    step: "03",
    title: "Fetch in Your Build",
    description:
      "Use the endpoint in your build process - fresh reviews every time",
  },
];

export default function Home() {
  const router = useRouter();
  const [displayedReviews, setDisplayedReviews] = useState(exampleReviews);
  const [isLoading, setIsLoading] = useState(false);

  const fetchRandomReviews = () => {
    setIsLoading(true);

    setTimeout(() => {
      const shuffled = [...mockReviews].sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, 3);
      setDisplayedReviews(selected);
      setIsLoading(false);
    }, 800);
  };

  return (
    <>
      {/* Hero Section */}
      <section className="section section-padding">
        <div className="content text-center">
          <div className="mx-auto max-w-full pt-12 pb-20 flex justify-center items-center flex-col gap-6">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 lg:text-6xl">
              Fetch your <span className="text-primary">Google Reviews</span> at
              build time
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl leading-relaxed">
              Embed fresh Google Reviews in Gatsby, Eleventy, Hugo, or any
              static site. <br />
              Purely static—<b>no JavaScript required</b>.
            </p>
          </div>

          {/* Product Screenshot */}
          <MockWindow
            title="ssg.tools - Google Reviews API"
            theme="light"
            className="shadow-2xl max-w-5xl mx-auto"
          >
            <div className="grid lg:grid-cols-2 gap-8 items-center p-2">
              <div className="text-left">
                <h3 className="text-lg font-semibold mb-4">API Endpoint</h3>
                <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm">
                  <span className="text-green-400">GET</span>{" "}
                  <span className="text-secondary">
                    https://api.ssg.tools/reviews/
                  </span>
                  <span className="text-yellow-400">{"{business-id}"}</span>
                </div>
                <div className="flex content-end justify-end">
                  <Button
                    onClick={fetchRandomReviews}
                    disabled={isLoading}
                    className="mt-4 rounded-full"
                    variant="default"
                    size="sm"
                  >
                    Fetch
                    <RefreshCw
                      className={`w-3 h-3 ml-1 ${isLoading ? "animate-spin" : ""}`}
                    />
                  </Button>
                </div>
              </div>
              <div className="text-left">
                <h3 className="text-lg font-semibold mb-4">Fresh Reviews</h3>
                <div className="space-y-3">
                  {isLoading
                    ? Array.from({ length: 3 }).map((_, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg h-[72px]"
                        >
                          <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-3 w-full" />
                            <Skeleton className="h-3 w-4/5" />
                          </div>
                        </div>
                      ))
                    : displayedReviews.map((review, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg h-[72px]"
                        >
                          <div className="w-10 h-10 bg-secondary/20 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-secondary font-semibold">
                              {i + 1}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1 mb-1">
                              {[...Array(5)].map((_, j) => (
                                <Star
                                  key={j}
                                  className="w-4 h-4 fill-yellow-400 text-yellow-400"
                                />
                              ))}
                            </div>
                            <div className="text-sm text-gray-600 line-clamp-2">
                              &quot;{review}&quot;
                            </div>
                          </div>
                        </div>
                      ))}
                </div>
              </div>
            </div>
          </MockWindow>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="section section-padding bg-white">
        <div className="content text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            Loved by Over {devCount} Developers Worldwide
          </h2>
          <div className="mx-auto my-10 flex w-fit flex-col items-center gap-4 sm:flex-row">
            <span className="mx-4 inline-flex items-center -space-x-4">
              {reviews.avatars.map((avatar, index) => (
                <Avatar key={index} className="size-14 border">
                  <AvatarImage src={avatar.src} alt={avatar.alt} />
                </Avatar>
              ))}
            </span>
            <div>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, index) => (
                  <Star
                    key={index}
                    className="size-5 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>
              <p className="text-left font-medium text-muted-foreground">
                from {reviews.count}+ reviews
              </p>
            </div>
          </div>

          {/* Company/Framework Logos */}
          <div className="flex flex-wrap gap-8 items-center justify-around opacity-60">
            {frameworks.map((fw) => (
              <div
                key={fw.name}
                className="font-bold text-lg text-gray-800 flex-1 min-w-40 md:min-w-80"
              >
                {fw.name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* User Personas Section */}
      <section className="section section-padding bg-secondary">
        <div className="content">
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 text-center bg-white">
              <div className="w-16 h-16 bg-secondary/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Code className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Developers</h3>
              <p className="text-gray-600 leading-relaxed">
                SSG.tools enables developers to integrate Google Reviews into
                any static site generator, eliminating API complexity and rate
                limiting issues for faster client delivery.
              </p>
            </Card>

            <Card className="p-8 text-center bg-white">
              <div className="w-16 h-16 bg-secondary/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Agencies</h3>
              <p className="text-gray-600 leading-relaxed">
                SSG.tools helps agencies streamline client projects by providing
                reliable review data, reducing development time and ensuring
                consistent review updates across all client sites.
              </p>
            </Card>

            <Card className="p-8 text-center bg-white">
              <div className="w-16 h-16 bg-secondary/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Globe className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Freelancers</h3>
              <p className="text-gray-600 leading-relaxed">
                SSG.tools empowers freelancers to offer professional review
                integration services, impressing clients with automated,
                always-fresh Google Reviews on their websites.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="section section-padding bg-white">
        <div className="content">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Setup takes 5 minutes. Then your reviews update automatically
              forever.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {steps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                  {step.step}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>

          {/* Code Example */}
          <div className="mt-16 text-center overflow-hidden">
            <div className="bg-gray-900 rounded-2xl p-8 max-w-3xl mx-auto">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                <span className="text-gray-400 text-sm ml-4">
                  Integration Example
                </span>
              </div>
              <div className="text-left font-mono text-base text-gray-100 leading-relaxed">
                <span className="text-gray-500">
                  {"// Works with any static site generator"}
                </span>
                <br />
                <span className="text-secondary">const</span>{" "}
                <span className="text-yellow-300">reviews</span> ={" "}
                <span className="text-secondary">await</span>{" "}
                <span className="text-secondary">fetch</span>(<br />
                &nbsp;&nbsp;
                <span className="text-green-400">
                  &apos;https://api.ssg.tools/reviews/your-business-id&apos;
                </span>
                <br />
                ).<span className="text-secondary">then</span>(
                <span className="text-orange-300">res</span> =&gt;{" "}
                <span className="text-orange-300">res</span>.
                <span className="text-secondary">json</span>())
                <br />
                <br />
                <span className="text-gray-500">
                  {"// Fresh Google Reviews in your static build! ✨"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section section-padding bg-primary">
        <div className="content text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Stop Fighting Google&apos;s API?
            </h2>
            <p className="text-xl text-white/90 mb-8 leading-relaxed">
              Join the developers who&apos;ve already simplified their review
              integration process. Start building faster with fresh Google
              Reviews in your static sites.
            </p>
            <div className="py-10">
              <PricingOptions />
            </div>
            <div className="flex flex-col gap-4 justify-center items-center">
              <ShimmerButton
                className="h-14 px-10 text-lg"
                shimmerSize="0.15em"
                onClick={() => router.push("/login")}
              >
                ✨ Get Started Today
              </ShimmerButton>
              <p className="text-white/70 text-sm">
                Credit card required, billed through Stripe
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About The Developer Section */}
      <section className="section section-padding bg-gray-50">
        <div className="content">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              About the Developer
            </h2>
            <p className="text-xl text-gray-600">
              Created by RedOxfordOnline in Waterloo Ontario
            </p>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="text-center md:text-left min-w-fit space-y-4">
              <Image
                src="/headshot_small.webp"
                alt="David Anderson Six, Founder of Red Oxford Online"
                width={192}
                height={192}
                className="w-48 h-48 rounded-full mx-auto md:mx-0  shadow-lg"
              />
              <div className="text-center md:text-left space-y-2">
                <h3 className="text-2xl font-bold text-gray-900">
                  David Anderson Six
                </h3>
                <p className="text-lg text-primary font-semibold">
                  Founder & Lead Developer
                </p>
                <p className="text-gray-600">
                  Red Oxford Online • Waterloo, Ontario
                </p>
              </div>
            </div>

            <div className="space-y-6 col-span-2">
              <div>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Run by its founder David Anderson,{" "}
                  <strong>Red Oxford Online</strong> is a small but powerful
                  company, passionate about bringing your business to the next
                  level with easy to use tools.
                </p>
                <p className="text-gray-700 leading-relaxed mb-4">
                  David is a full-stack developer with nearly a decade of
                  programming & server management experience, specializing in
                  creating websites, mobile & web applications, data pipelines,
                  and server infrastructure.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  I think that one of the greatest joys in life is building
                  something that makes people&apos;s lives better. SSG.tools
                  represents exactly that - solving a real problem that
                  developers face every day.
                </p>
              </div>

              <div className="border-l-4 border-primary pl-6">
                <p className="text-gray-600 italic">
                  Proudly developing in Waterloo, Ontario 🇨🇦
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
