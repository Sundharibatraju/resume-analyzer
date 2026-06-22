import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, FileCheck } from "lucide-react";
import Button from "../ui/Button";
import ScoreGauge from "../ui/ScoreGauge";
import GlassCard from "../ui/GlassCard";
import ProgressBar from "../ui/ProgressBar";

export default function Hero() {
  return (
    <section className="max-w-7xl mx-auto px-6 pt-16 pb-24 grid md:grid-cols-2 gap-12 items-center">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="inline-flex items-center gap-2 rounded-full bg-[var(--color-signal-clear)]/15 text-[var(--color-signal-clear-deep)] dark:text-[var(--color-signal-clear)] px-4 py-1.5 text-sm font-medium mb-6">
          <FileCheck size={14} />
          Built for how applicant tracking systems actually read resumes
        </div>

        <h1 className="font-display text-5xl md:text-6xl font-semibold leading-[1.05] tracking-tight mb-6">
          Know what the
          <br />
          <span className="italic">screening desk</span>
          <br />
          sees first.
        </h1>

        <p className="text-lg opacity-70 max-w-md mb-8 leading-relaxed">
          Upload your resume, paste the job description, and get the exact skill
          gaps, keyword mismatches, and section weaknesses standing between you
          and an interview — before a recruiter ever opens it.
        </p>

        <div className="flex flex-wrap items-center gap-4">
          <Link to="/register">
            <Button variant="accent" size="lg" icon={ArrowRight}>
              Analyze your resume
            </Button>
          </Link>
          <Link to="/login">
            <Button variant="outline" size="lg">I already have an account</Button>
          </Link>
        </div>

        <div className="flex items-center gap-6 mt-10 text-sm opacity-60">
          <span>No credit card</span>
          <span className="h-1 w-1 rounded-full bg-current" />
          <span>PDF &amp; DOCX supported</span>
          <span className="h-1 w-1 rounded-full bg-current" />
          <span>Results in seconds</span>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: "easeOut", delay: 0.15 }}
        className="relative"
      >
        <GlassCard className="p-7 relative">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs uppercase tracking-wide opacity-50 font-semibold">Analysis result</p>
              <p className="font-display text-xl font-semibold mt-0.5">Senior Backend Engineer</p>
            </div>
            <ScoreGauge score={82} size="sm" showLabel={false} />
          </div>

          <div className="space-y-4">
            <ProgressBar value={88} label="Skill Match" />
            <ProgressBar value={74} label="Keyword Optimization" />
            <ProgressBar value={90} label="Experience Match" />
          </div>

          <div className="mt-6 pt-6 border-t border-[var(--color-line)] dark:border-[var(--color-line-dark)] flex flex-wrap gap-2">
            <span className="text-xs px-2.5 py-1 rounded-full bg-[var(--color-signal-gap)]/15 text-[var(--color-signal-gap-deep)] dark:text-[var(--color-signal-gap)] font-medium">
              Missing: Kubernetes
            </span>
            <span className="text-xs px-2.5 py-1 rounded-full bg-[var(--color-signal-gap)]/15 text-[var(--color-signal-gap-deep)] dark:text-[var(--color-signal-gap)] font-medium">
              Missing: Terraform
            </span>
          </div>
        </GlassCard>

        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-6 -right-6 hidden md:block"
        >
          <GlassCard className="px-4 py-3 text-sm font-medium">
            ⚡ Scanned in 1.8s
          </GlassCard>
        </motion.div>
      </motion.div>
    </section>
  );
}
