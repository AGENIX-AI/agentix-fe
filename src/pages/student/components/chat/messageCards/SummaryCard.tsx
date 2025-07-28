import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import type { SummaryMessageCard } from "./types";
import { Separator } from "@/components/ui/separator";
import { ExtraSmall, Small } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface SummaryCardProps {
  card: SummaryMessageCard;
  className?: string;
}

export function SummaryCard({ card, className }: SummaryCardProps) {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger fade-in animation on mount
    setIsVisible(true);
  }, []);

  return (
    <div
      className={cn(
        "w-full mb-3 border border-primary/20 rounded-xl bg-card shadow-sm transition-all duration-300 ease-in-out font-sans",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
        className
      )}
      style={{ boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}
    >
      {/* Header */}
      <div className="p-3 rounded-t-xl">
        <div className="text-primary">
          <div className="flex flex-col gap-1">
            <Small className="font-bold">{t("chat.summaryCard.sessionSummary", "Session Summary")}</Small>
            {card.language && (
              <ExtraSmall className="text-primary">
                {t("chat.summaryCard.language", "Language")}: {card.language}
              </ExtraSmall>
            )}
          </div>
          <Separator className="mt-3" />
        </div>
      </div>

      {/* Content */}
      <div className="px-3 pb-3">
        <div className="prose prose-sm max-w-none">
          <ReactMarkdown
            components={{
              h1: ({ children }) => (
                <h1 className="text-sm font-bold text-primary mb-2 mt-4 first:mt-0">
                  {children}
                </h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-sm font-bold text-primary mb-2 mt-4 first:mt-0">
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-xs font-bold text-primary mb-2 mt-3 first:mt-0">
                  {children}
                </h3>
              ),
              p: ({ children }) => (
                <p className="text-xs text-foreground mb-2 leading-relaxed">
                  {children}
                </p>
              ),
              ul: ({ children }) => (
                <ul className="text-xs text-foreground mb-2 ml-4 space-y-1">
                  {children}
                </ul>
              ),
              ol: ({ children }) => (
                <ol className="text-xs text-foreground mb-2 ml-4 space-y-1">
                  {children}
                </ol>
              ),
              li: ({ children }) => (
                <li className="text-xs text-foreground leading-relaxed">
                  {children}
                </li>
              ),
              strong: ({ children }) => (
                <strong className="font-bold text-primary">{children}</strong>
              ),
              em: ({ children }) => (
                <em className="italic text-foreground">{children}</em>
              ),
              code: ({ children }) => (
                <code className="bg-muted px-1 py-0.5 rounded text-xs">
                  {children}
                </code>
              ),
            }}
          >
            {card.content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
