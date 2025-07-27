import { Star } from "lucide-react";

interface ReviewCardProps {
  author: string;
  rating: number;
  text: string;
  date: Date | null;
}

export function ReviewCard({ author, rating, text, date }: ReviewCardProps) {
  return (
    <div className="flex items-start space-x-3 p-4 bg-white rounded-lg border">
      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
        <span className="text-blue-600 font-semibold text-sm">
          {author.charAt(0)}
        </span>
      </div>
      <div className="flex-1">
        <div className="flex items-center space-x-2 mb-1">
          <span className="font-medium text-sm">{author}</span>
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < rating
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300"
                }`}
              />
            ))}
          </div>
        </div>
        <p className="text-sm text-gray-600 mb-1">{text}</p>
        {date && (
          <p className="text-xs text-gray-400">
            {date.toISOString().slice(0, 10)}
          </p>
        )}
      </div>
    </div>
  );
}
