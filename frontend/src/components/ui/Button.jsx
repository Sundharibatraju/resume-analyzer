import clsx from "clsx";
import { motion } from "framer-motion";

const VARIANTS = {
  primary:
    "bg-[var(--color-ink)] text-[var(--color-text-onink)] hover:bg-[var(--color-ink-soft)] dark:bg-[var(--color-signal-clear)] dark:text-[var(--color-ink)] dark:hover:bg-[var(--color-signal-clear-deep)]",
  accent:
    "bg-[var(--color-signal-clear)] text-[var(--color-ink)] hover:bg-[var(--color-signal-clear-deep)] hover:text-white",
  outline:
    "border border-current/20 hover:border-current/40 bg-transparent",
  ghost:
    "bg-transparent hover:bg-current/5",
  danger:
    "bg-[var(--color-signal-gap)] text-white hover:bg-[var(--color-signal-gap-deep)]",
};

const SIZES = {
  sm: "px-3.5 py-1.5 text-sm",
  md: "px-5 py-2.5 text-sm",
  lg: "px-7 py-3.5 text-base",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  className,
  disabled,
  loading,
  icon: Icon,
  type = "button",
  ...props
}) {
  return (
    <motion.button
      type={type}
      whileTap={{ scale: disabled || loading ? 1 : 0.97 }}
      disabled={disabled || loading}
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-colors",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        VARIANTS[variant],
        SIZES[size],
        className
      )}
      {...props}
    >
      {loading ? (
        <span className="h-4 w-4 rounded-full border-2 border-current/30 border-t-current animate-spin" />
      ) : Icon ? (
        <Icon size={16} strokeWidth={2.25} />
      ) : null}
      {children}
    </motion.button>
  );
}
