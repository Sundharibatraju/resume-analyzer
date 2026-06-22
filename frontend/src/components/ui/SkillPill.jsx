import clsx from "clsx";
import { Check, X, Sparkles } from "lucide-react";

const VARIANT_CONFIG = {
  matched: {
    icon: Check,
    classes: "bg-[var(--color-signal-clear)]/15 text-[var(--color-signal-clear-deep)] dark:text-[var(--color-signal-clear)]",
  },
  missing: {
    icon: X,
    classes: "bg-[var(--color-signal-gap)]/15 text-[var(--color-signal-gap-deep)] dark:text-[var(--color-signal-gap)]",
  },
  recommended: {
    icon: Sparkles,
    classes: "bg-[var(--color-signal-review)]/15 text-[var(--color-signal-review-deep)] dark:text-[var(--color-signal-review)]",
  },
  neutral: {
    icon: null,
    classes: "bg-current/8",
  },
};

export default function SkillPill({ skill, variant = "neutral", className }) {
  const config = VARIANT_CONFIG[variant];
  const Icon = config.icon;

  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium",
        config.classes,
        className
      )}
    >
      {Icon && <Icon size={13} strokeWidth={2.5} />}
      {skill}
    </span>
  );
}
