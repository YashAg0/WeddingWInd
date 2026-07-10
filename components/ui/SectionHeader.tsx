import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  id?: string;
  label?: string;
  title: string;
  highlightedWord?: string;
  description?: string;
  align?: "left" | "center" | "right";
  className?: string;
  titleClassName?: string;
  theme?: "light" | "dark";
}

export function SectionHeader({
  id,
  label,
  title,
  highlightedWord,
  description,
  align = "center",
  className,
  titleClassName,
  theme = "light",
}: SectionHeaderProps) {
  const isDark = theme === "dark";

  const renderTitle = () => {
    if (!highlightedWord) return <>{title}</>;

    const parts = title.split(highlightedWord);
    return (
      <>
        {parts[0]}
        <span className="text-gradient-brand">{highlightedWord}</span>
        {parts[1]}
      </>
    );
  };

  return (
    <div
      className={cn(
        "max-w-3xl",
        align === "center" && "mx-auto text-center",
        align === "right" && "ml-auto text-right",
        className
      )}
    >
      {label && (
        <div
          className={cn(
            "section-label mb-5",
            align === "center" && "justify-center",
            align === "right" && "justify-end"
          )}
          aria-hidden="true"
        >
          {label}
        </div>
      )}

      <h2
        id={id}
        className={cn(
          "font-display font-bold leading-[1.12] tracking-tight mb-5",
          "text-3xl sm:text-4xl lg:text-[2.875rem]",
          isDark ? "text-white" : "text-[var(--color-charcoal-900)]",
          titleClassName
        )}
      >
        {renderTitle()}
      </h2>

      {description && (
        <p
          className={cn(
            "text-base sm:text-lg leading-relaxed",
            isDark ? "text-charcoal-300" : "text-charcoal-500"
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
}
