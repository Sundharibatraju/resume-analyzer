import { motion } from "framer-motion";
import { ScanSearch, Target, ListChecks, FileBarChart, GitCompare, Download } from "lucide-react";
import GlassCard from "../ui/GlassCard";

const FEATURES = [
  {
    icon: ScanSearch,
    title: "Real parsing, not guesswork",
    desc: "Extracts your contact info, skills, education, and experience the same way an ATS does — so you see exactly what gets indexed.",
  },
  {
    icon: Target,
    title: "Weighted ATS scoring",
    desc: "Skill match, keyword overlap, experience fit, and education fit — combined into one transparent 0–100 score.",
  },
  {
    icon: ListChecks,
    title: "Missing skills, named",
    desc: "See precisely which required and preferred skills from the job post are absent from your resume — not a vague summary.",
  },
  {
    icon: FileBarChart,
    title: "Section-by-section scoring",
    desc: "Contact info, summary, skills, experience, education, and projects each get their own score and fix list.",
  },
  {
    icon: GitCompare,
    title: "Compare multiple resumes",
    desc: "Rank different resume versions against the same job description to see which one screens best.",
  },
  {
    icon: Download,
    title: "Take it with you",
    desc: "Export a clean report of your score breakdown and recommendations to reference while you edit.",
  },
];

export default function Features() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-20">
      <div className="max-w-xl mb-14">
        <p className="text-sm font-semibold text-[var(--color-signal-clear-deep)] dark:text-[var(--color-signal-clear)] mb-3">
          What you get
        </p>
        <h2 className="font-display text-3xl md:text-4xl font-semibold tracking-tight">
          Everything a hiring filter checks, laid out plainly.
        </h2>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {FEATURES.map((feature, i) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: i * 0.06 }}
          >
            <GlassCard className="p-6 h-full">
              <div className="h-10 w-10 rounded-xl bg-[var(--color-signal-clear)]/15 flex items-center justify-center mb-4">
                <feature.icon size={19} className="text-[var(--color-signal-clear-deep)] dark:text-[var(--color-signal-clear)]" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-sm opacity-65 leading-relaxed">{feature.desc}</p>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
