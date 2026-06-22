import { motion } from "framer-motion";
import ProgressBar from "../ui/ProgressBar";
import GlassCard from "../ui/GlassCard";

const SECTION_LABELS = {
  contact_information: "Contact Information",
  summary: "Summary",
  skills: "Skills",
  experience: "Experience",
  education: "Education",
  projects: "Projects",
};

export default function SectionBreakdown({ sectionScores = {} }) {
  const entries = Object.entries(sectionScores);

  return (
    <GlassCard className="p-6">
      <h3 className="font-semibold mb-1">Section-by-section analysis</h3>
      <p className="text-sm opacity-55 mb-5">How each part of your resume scores individually.</p>
      <div className="space-y-4">
        {entries.map(([key, value], i) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, delay: i * 0.05 }}
          >
            <ProgressBar value={value} label={SECTION_LABELS[key] || key} />
          </motion.div>
        ))}
      </div>
    </GlassCard>
  );
}
