"use client";

import Image from "next/image";

const frameworks = [
  { name: "Gatsby", logo: "/logos/gatsby.webp" },
  { name: "Hugo", logo: "/logos/hugo.webp" },
  { name: "Jekyll", logo: "/logos/jekyll.webp" },
  { name: "11ty", logo: "/logos/11ty.webp" },
];

export function FrameworkMarquee() {
  return (
    <>
      <h2 className="text-2xl font-bold text-gray-900 mb-8">Used in</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 items-center">
        {frameworks.map((fw) => (
          <div
            key={fw.name}
            className="flex flex-col items-center justify-center gap-4 group cursor-pointer p-6 rounded-lg hover:scale-[0.98] transition-all duration-200"
          >
            <Image
              src={fw.logo}
              alt={`${fw.name} logo`}
              width={110}
              height={110}
              className="object-contain grayscale brightness-150 group-hover:grayscale-0 group-hover:brightness-100 group-hover:scale-[1.05] transition-all duration-300"
            />
            <span className="font-bold text-lg text-gray-800">{fw.name}</span>
          </div>
        ))}
      </div>
    </>
  );
}
