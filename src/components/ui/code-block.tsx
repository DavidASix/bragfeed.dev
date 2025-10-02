import {
  CodeBlock as ReactCodeBlock,
  atomOneDark,
  atomOneLight,
} from "react-code-blocks";
import { ClipboardCopy } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { MockWindow } from "@/components/ui/mock-window";

interface CodeBlockProps {
  code: string;
  language?: string;
  title?: string;
  showLineNumbers?: boolean;
  showCopy?: boolean;
  fontSize?: number;
  onCopy?: () => void;
  className?: string;
  theme?: "light" | "dark";
}

export function CodeBlock({
  code,
  language = "javascript",
  title = "Code",
  showLineNumbers = false,
  showCopy = true,
  fontSize = 14,
  onCopy,
  className = "",
  theme = "dark",
}: CodeBlockProps) {
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    toast.success("Code copied to clipboard");
    onCopy?.();
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <MockWindow
        title={title}
        className="overflow-hidden relative"
        theme={theme}
      >
        {showCopy && (
          <div className="flex justify-end absolute right-4">
            <Button
              onClick={handleCopy}
              variant={theme === "dark" ? "outline" : "ghost"}
              className="flex items-center opacity-60"
            >
              <ClipboardCopy className="w-4 h-4" />
            </Button>
          </div>
        )}
        <ReactCodeBlock
          text={code}
          language={language}
          showLineNumbers={showLineNumbers}
          theme={{
            ...(theme === "dark" ? atomOneDark : atomOneLight),
            backgroundColor: "transparent",
          }}
          customStyle={{
            fontFamily: "ui-monospace, SFMono-Regular, 'SF Mono', monospace",
            fontSize: `${fontSize}px`,
            lineHeight: "1.5",
            overflow: "hidden",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        />
      </MockWindow>
    </div>
  );
}
