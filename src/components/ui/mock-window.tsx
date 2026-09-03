interface MockWindowProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  theme?: "light" | "dark" | "system";
}

export function MockWindow({
  title = "Terminal",
  children,
  className = "",
  theme = "dark",
}: MockWindowProps) {
  const isDark = theme === "dark";
  const isSystem = theme === "system";
  return (
    <div
      className={`${
        isDark
          ? "bg-gray-900"
          : isSystem
            ? "bg-card border"
            : "bg-white border border-gray-200"
      } rounded-lg overflow-hidden ${className}`}
    >
      <div
        className={`flex items-center gap-2 px-4 py-3 ${
          isDark
            ? "bg-gray-800 border-b border-gray-700"
            : isSystem
              ? "bg-muted border-b"
              : "bg-gray-50 border-b border-gray-200"
        }`}
      >
        <div className="w-3 h-3 bg-red-400 rounded-full"></div>
        <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
        <div className="w-3 h-3 bg-green-400 rounded-full"></div>
        <span
          className={`${
            isDark
              ? "text-gray-400"
              : isSystem
                ? "text-muted-foreground"
                : "text-gray-600"
          } text-sm ml-4`}
        >
          {title}
        </span>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}
