import { Star } from "lucide-react";

interface StarRatingSelectorProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

export function StarRatingSelector({
  value,
  onChange,
  disabled = false,
}: StarRatingSelectorProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-gray-700">
        Minimum Review Score
      </label>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            disabled={disabled}
            className={`transition-all ${
              disabled
                ? "cursor-not-allowed opacity-50"
                : "cursor-pointer hover:scale-110"
            }`}
            aria-label={`Set minimum rating to ${star} star${star > 1 ? "s" : ""}`}
          >
            <Star
              className={`w-8 h-8 transition-colors ${
                star <= value
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300 hover:text-gray-400"
              }`}
            />
          </button>
        ))}
      </div>
      <p className="text-xs text-gray-500">
        Only reviews with {value} star{value > 1 ? "s" : ""} or higher will be
        returned by the API
      </p>
    </div>
  );
}
