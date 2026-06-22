import { motion } from "framer-motion";

function getSignalColor(score) {
  if (score >= 75) return "var(--color-signal-clear)";
  if (score >= 50) return "var(--color-signal-review)";
  return "var(--color-signal-gap)";
}

export default function ProgressBar({ value = 0, label, showValue = true, height = 8 }) {
  const clamped = Math.max(0, Math.min(100, value));
  const color = getSignalColor(clamped);

  return (
    <div className="w-full">
      {(label || showValue) && (
        <div className="flex items-center justify-between mb-1.5">
          {label && <span className="text-sm font-medium opacity-80">{label}</span>}
          {showValue && (
            <span className="text-sm font-mono-tabular font-semibold" style={{ color }}>
              {Math.round(clamped)}%
            </span>
          )}
        </div>
      )}
      <div
        className="w-full rounded-full overflow-hidden bg-current opacity-10"
        style={{ height }}
      >
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${clamped}%` }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
