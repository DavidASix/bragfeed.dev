"use client";

import { useState } from "react";
import { Star, RefreshCw } from "lucide-react";

import { MockWindow } from "@/components/ui/mock-window";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const mockReviews = [
  "Amazing service! They were quick, professional, and went above expectations. Highly recommend to anyone looking for quality work.",
  "Best experience I've had in years. The attention to detail and customer care was outstanding. Will definitely be coming back!",
  "Exceeded all my expectations. From start to finish, everything was handled perfectly. Five stars all the way!",
  "Absolutely fantastic! The team was friendly, efficient, and delivered exactly what they promised. Couldn't be happier with the results.",
  "Outstanding quality and service. They really know what they're doing and it shows in every detail. I'm impressed!",
  "Super impressed with their work. Fast turnaround, great communication, and the final product was better than I imagined.",
  "Incredible experience from beginning to end. Professional, courteous, and delivered beyond my expectations. Highly recommended!",
  "Top-notch service all around. The staff was knowledgeable and helpful, making the whole process smooth and easy.",
  "Brilliant work! They took the time to understand my needs and delivered a solution that was perfect. Will use again!",
  "Very satisfied customer here. Great value, excellent quality, and wonderful customer service throughout. Thank you!",
  "Fantastic job on everything. The attention to detail was impressive and they really went the extra mile for us.",
  "Wonderful experience! They were patient, understanding, and delivered exactly what we needed. Couldn't ask for more!",
  "Highly professional and skilled team. The results speak for themselves - absolutely beautiful work. Five stars deserved!",
  "Exceptional service that truly stands out. They were responsive, creative, and delivered on time. Very happy customer!",
  "Perfect from start to finish. Great communication, quality work, and fair pricing. What more could you want?",
  "Really impressed with the level of care and expertise. They made everything so easy and the results are amazing!",
  "Outstanding professionals who deliver what they promise. The quality exceeded my expectations and I'm thrilled with everything.",
  "Absolutely love what they did! Creative, efficient, and professional throughout the entire process. Highly recommend!",
  "Great experience working with them. They listened to my concerns and provided solutions that worked perfectly. Thank you!",
  "Superb quality and attention to detail. The team was friendly and made sure everything was exactly right. Very pleased!",
];

const initialReviews = [
  "Amazing service! They were quick, professional, and went above expectations. Highly recommend to anyone looking for quality work.",
  "Best experience I've had in years. The attention to detail and customer care was outstanding. Will definitely be coming back!",
  "Exceeded all my expectations. From start to finish, everything was handled perfectly. Five stars all the way!",
];

export function MockReviewsWindow() {
  const [displayedReviews, setDisplayedReviews] = useState(initialReviews);
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
              variant="secondary"
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
  );
}
