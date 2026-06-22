import { motion } from "framer-motion";
import { AlertTriangle, Info, Lightbulb } from "lucide-react";
import GlassCard from "../ui/GlassCard";

const PRIORITY_CONFIG = {
  high: { icon: AlertTriangle, color: "var(--color-signal-gap)", label: "High priority" },
  medium: { icon: Info, color: "var(--color-signal-review)", label: "Medium priority" },
  low: { icon: Lightbulb, color: "var(--color-signal-clear)", label: "Worth considering" },
};

export default function RecommendationsList({ recommendations = [] }) {
  const sorted = [...recommendations].sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return order[a.priority] - order[b.priority];
  });

  return (
    <GlassCard className="p-6">
      <h3 className="font-semibold mb-1">Recommendations</h3>
      <p className="text-sm opacity-55 mb-5">
        Specific, prioritized changes to improve your score for this role.
      </p>

      {sorted.length === 0 ? (
        <p className="text-sm opacity-50">No major issues found — your resume looks well aligned.</p>
      ) : (
        <div className="space-y-3">
          {sorted.map((rec, i) => {
            const config = PRIORITY_CONFIG[rec.priority] || PRIORITY_CONFIG.medium;
            const Icon = config.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="flex gap-3 p-4 rounded-xl bg-current/[0.03]"
              >
                <div
                  className="h-7 w-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ backgroundColor: `color-mix(in srgb, ${config.color} 18%, transparent)` }}
                >
                  <Icon size={14} style={{ color: config.color }} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-semibold opacity-50">{rec.category}</span>
                    <span className="text-[10px] uppercase tracking-wide font-bold" style={{ color: config.color }}>
                      {config.label}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed opacity-85">{rec.message}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </GlassCard>
  );
}
