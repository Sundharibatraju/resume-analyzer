import { motion } from "framer-motion";
import GlassCard from "../ui/GlassCard";

export default function StatCard({ icon: Icon, label, value, suffix, accent = "clear", delay = 0 }) {
  const accentColor = `var(--color-signal-${accent})`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <GlassCard className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div
            className="h-9 w-9 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `color-mix(in srgb, ${accentColor} 18%, transparent)` }}
          >
            <Icon size={17} style={{ color: accentColor }} />
          </div>
        </div>
        <p className="font-mono-tabular text-2xl font-bold">
          {value}
          {suffix && <span className="text-base opacity-50 ml-0.5">{suffix}</span>}
        </p>
        <p className="text-sm opacity-55 mt-0.5">{label}</p>
      </GlassCard>
    </motion.div>
  );
}
