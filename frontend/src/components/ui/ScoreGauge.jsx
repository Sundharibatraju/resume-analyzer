import { motion } from "framer-motion";

const SIZE_MAP = {
  sm: { box: 96, stroke: 8, font: "text-xl" },
  md: { box: 152, stroke: 10, font: "text-3xl" },
  lg: { box: 220, stroke: 12, font: "text-5xl" },
};

function getSignalColor(score) {
  if (score >= 75) return { stroke: "var(--color-signal-clear)", label: "Strong match" };
  if (score >= 50) return { stroke: "var(--color-signal-review)", label: "Needs review" };
  return { stroke: "var(--color-signal-gap)", label: "Significant gaps" };
}

/**
 * Circular "scan ring" score gauge — the app's signature visual element.
 * The ring fills like a radar sweep, evoking the act of an ATS scanning a document.
 */
export default function ScoreGauge({ score = 0, size = "lg", label, showLabel = true }) {
  const { box, stroke, font } = SIZE_MAP[size];
  const radius = (box - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, score));
  const offset = circumference - (clamped / 100) * circumference;
  const { stroke: color, label: signalLabel } = getSignalColor(clamped);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: box, height: box }}>
        <svg width={box} height={box} className="-rotate-90">
          <circle
            cx={box / 2}
            cy={box / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeOpacity="0.1"
            strokeWidth={stroke}
          />
          <motion.circle
            cx={box / 2}
            cy={box / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.1, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`font-mono-tabular font-bold ${font}`}>
            {Math.round(clamped)}
          </span>
          <span className="text-xs opacity-60 -mt-1">/ 100</span>
        </div>
      </div>
      {showLabel && (
        <div className="text-center">
          <p className="text-sm font-semibold">{label || "ATS Score"}</p>
          <p className="text-xs opacity-60" style={{ color }}>{signalLabel}</p>
        </div>
      )}
    </div>
  );
}
