import { CheckCircle, Info } from "lucide-react";

type StepStatus = "completed" | "active" | "inactive";

interface StepIndicatorProps {
  step: number;
  title: string;
  description: string;
  status: StepStatus;
  size?: "sm" | "md" | "lg";
  layout?: "horizontal" | "vertical";
  className?: string;
  informationalStep?: boolean;
}

export function StepIndicator({
  step,
  title,
  description,
  status,
  size = "md",
  layout = "vertical",
  className = "",
  informationalStep = false,
}: StepIndicatorProps) {
  const sizeClasses = {
    sm: "w-8 h-8 text-sm",
    md: "w-10 h-10 text-base",
    lg: "w-16 h-16 text-2xl",
  };

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  const getStatusClasses = () => {
    switch (status) {
      case "completed":
        return "bg-green-500 text-white";
      case "active":
        return "bg-primary text-primary-foreground";
      case "inactive":
        return "bg-muted text-muted-foreground";
    }
  };

  const getTextClasses = () => {
    return status === "inactive"
      ? "text-muted-foreground/60"
      : "text-foreground";
  };

  const getDescClasses = () => {
    return status === "inactive"
      ? "text-muted-foreground/60"
      : "text-muted-foreground";
  };

  //TODO: Why claude did it this a mystery; couldn't just use responsive styles? insane.
  if (layout === "horizontal") {
    return (
      <div className={`flex items-center space-x-4 ${className}`}>
        <div
          className={`${sizeClasses[size]} rounded-full flex items-center justify-center font-bold transition-all ${getStatusClasses()}`}
        >
          {status === "completed" ? (
            <CheckCircle className={iconSizes[size]} />
          ) : informationalStep ? (
            <Info className={iconSizes[size]} />
          ) : (
            step
          )}
        </div>
        <div>
          <h3 className={`text-2xl font-semibold ${getTextClasses()}`}>
            {title}
          </h3>
          <p className={`text-base mt-1 ${getDescClasses()}`}>{description}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`text-center ${className}`}>
      <div
        className={`${sizeClasses[size]} rounded-full flex items-center justify-center font-bold mx-auto mb-4 transition-all ${getStatusClasses()}`}
      >
        {status === "completed" ? (
          <CheckCircle className={iconSizes[size]} />
        ) : informationalStep ? (
          <Info className={iconSizes[size]} />
        ) : (
          step
        )}
      </div>
      <h3 className={`text-lg font-semibold mb-2 ${getTextClasses()}`}>
        {title}
      </h3>
      <p className={`text-sm ${getDescClasses()}`}>{description}</p>
    </div>
  );
}
