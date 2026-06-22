import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import Button from "../ui/Button";

export default function CTA() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-20">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="rounded-3xl bg-[var(--color-ink)] dark:bg-[var(--color-signal-clear)] px-8 md:px-16 py-16 text-center relative overflow-hidden"
      >
        <div className="absolute inset-0 opacity-[0.07]" style={{
          backgroundImage: "radial-gradient(circle at 30% 20%, white 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }} />
        <h2 className="font-display text-3xl md:text-5xl font-semibold text-[var(--color-text-onink)] dark:text-[var(--color-ink)] tracking-tight max-w-2xl mx-auto relative z-10">
          Stop guessing why the callback isn't coming.
        </h2>
        <p className="mt-5 text-[var(--color-text-onink-secondary)] dark:text-[var(--color-ink)]/70 max-w-lg mx-auto relative z-10">
          Three minutes to find out exactly what's missing — and what to fix first.
        </p>
        <Link to="/register" className="inline-block mt-8 relative z-10">
          <Button variant="accent" size="lg" icon={ArrowRight} className="dark:bg-[var(--color-ink)] dark:text-[var(--color-signal-clear)] dark:hover:bg-[var(--color-ink-soft)]">
            Get your score, free
          </Button>
        </Link>
      </motion.div>
    </section>
  );
}
