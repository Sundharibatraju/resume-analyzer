import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight, FileText, Clock } from "lucide-react";
import GlassCard from "../ui/GlassCard";

function getSignalColor(score) {
  if (score >= 75) return "var(--color-signal-clear)";
  if (score >= 50) return "var(--color-signal-review)";
  return "var(--color-signal-gap)";
}

function formatDate(isoString) {
  if (!isoString) return "";
  const date = new Date(isoString);
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export default function HistoryList({ history = [] }) {
  if (history.length === 0) {
    return (
      <GlassCard className="p-10 text-center">
        <div className="h-12 w-12 rounded-2xl bg-current/8 mx-auto mb-4 flex items-center justify-center">
          <Clock size={22} className="opacity-50" />
        </div>
        <p className="font-semibold mb-1">No analyses yet</p>
        <p className="text-sm opacity-55 max-w-sm mx-auto">
          Run your first resume analysis to see your ATS score history here.
        </p>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-3">
      {history.map((item, i) => {
        const color = getSignalColor(item.ats_score);
        return (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.04 }}
          >
            <Link to={`/results/${item.id}`}>
              <GlassCard className="p-4 sm:p-5 flex items-center gap-4 hover:shadow-lg transition-shadow group">
                <div className="h-11 w-11 rounded-xl bg-current/8 flex items-center justify-center flex-shrink-0">
                  <FileText size={19} className="opacity-60" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">
                    {item.job_title || "Untitled analysis"}
                  </p>
                  <p className="text-xs opacity-50 truncate">
                    {item.resume_filename} · {formatDate(item.created_at)}
                  </p>
                </div>

                <div className="text-right flex-shrink-0">
                  <p className="font-mono-tabular font-bold text-lg" style={{ color }}>
                    {Math.round(item.ats_score)}
                  </p>
                  <p className="text-[11px] opacity-45">ATS score</p>
                </div>

                <ChevronRight size={18} className="opacity-30 group-hover:opacity-60 transition-opacity flex-shrink-0" />
              </GlassCard>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}
