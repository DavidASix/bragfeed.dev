"use client";

import React from "react";
import Image from "next/image";
import { Star } from "lucide-react";

import { Avatar, AvatarImage } from "@/components/ui/avatar";
import PricingOptions from "@/components/common/pricing-options";
import { CodeBlock } from "@/components/ui/code-block";

import { MockReviewsWindow } from "./_components/mock-reviews";
import { FrameworkMarquee } from "./_components/framework-marquee";

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
          <MockReviewsWindow />
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="section section-padding-b bg-white">
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
          <FrameworkMarquee />
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
          <div className="mt-16 max-w-3xl mx-auto">
            <CodeBlock
              code={`// Works with any static site generator
const reviews = await fetch(
  'https://bragfeed.dev/reviews/your-business-id'
).then(res => res.json())

// Fresh Google Reviews in your static build! ✨`}
              language="javascript"
              title="Integration Example"
              theme="dark"
              showCopy={false}
              fontSize={17}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section section-padding bg-secondary">
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
                  something that makes people&apos;s lives better. Bragfeed.dev
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
