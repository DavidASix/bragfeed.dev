"use client";

import Image from "next/image";

const frameworks = [
  { name: "Gatsby", logo: "/logos/gatsby.webp" },
  { name: "Hugo", logo: "/logos/hugo.webp" },
  { name: "Jekyll", logo: "/logos/jekyll.webp" },
  { name: "11ty", logo: "/logos/11ty.webp" },
  { name: "Astro", logo: "/logos/astro.webp" },
  { name: "Next.js", logo: "/logos/nextjs.webp" },
  { name: "Nuxt", logo: "/logos/nuxt.webp" },
  { name: "SvelteKit", logo: "/logos/svelte.webp" },
];

function MarqueeRow({ items }: { items: typeof frameworks }) {
  // Duplicate items multiple times for seamless loop
  const duplicatedItems = [...items, ...items, ...items];

  return (
    <div className="relative overflow-hidden w-full">
      <div className="flex gap-8 animate-marquee-infinite whitespace-nowrap">
        {duplicatedItems.map((fw, idx) => (
          <div
            key={`${fw.name}-${idx}`}
            className="flex flex-col items-center justify-center gap-3 group cursor-pointer p-6 rounded-lg transition-all duration-200 flex-shrink-0 w-[160px]"
          >
            <Image
              src={fw.logo}
              alt={`${fw.name} logo`}
              width={80}
              height={80}
              className="object-contain grayscale brightness-150 group-hover:grayscale-0 group-hover:brightness-100 group-hover:scale-[1.05] transition-all duration-300"
            />
            <span className="font-bold text-base text-gray-800 whitespace-normal">
              {fw.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function FrameworkMarquee() {
  const halfLength = Math.ceil(frameworks.length / 2);
  const firstRow = frameworks.slice(0, halfLength);
  const secondRow = frameworks.slice(halfLength);

  return (
    <div className="space-y-4">
      <div className="flex justify-start">
        <h2 className="text-2xl font-bold text-gray-900">Works with</h2>
      </div>

      <div className="space-y-4">
        {/* Single row on large screens */}
        <div className="hidden lg:block">
          <MarqueeRow items={frameworks} />
        </div>
        {/* Two rows on small screens */}
        <div className="lg:hidden space-y-4">
          <MarqueeRow items={firstRow} />
          <MarqueeRow items={secondRow} />
        </div>
      </div>

      <div className="flex justify-end">
        <span className="text-xl font-semibold text-gray-600">and more</span>
      </div>
    </div>
  );
}
