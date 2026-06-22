import { motion } from "framer-motion";
import GlassCard from "../ui/GlassCard";

const TESTIMONIALS = [
  {
    quote:
      "I'd applied to 40 roles with no callbacks. The missing-skills list showed me I was leaving out tools I actually use daily — just not naming them the way job posts do.",
    name: "Priya R.",
    role: "Data Analyst",
  },
  {
    quote:
      "As someone screening 200+ applications a week, I started asking candidates to run this first. It saves both sides time before the first call.",
    name: "Marcus T.",
    role: "Technical Recruiter",
  },
  {
    quote:
      "The section scores caught that my projects section was basically empty. Adding three lines fixed more than any keyword stuffing would have.",
    name: "Ana M.",
    role: "Recent CS Graduate",
  },
];

export default function Testimonials() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-20">
      <div className="max-w-xl mb-14">
        <p className="text-sm font-semibold text-[var(--color-signal-clear-deep)] dark:text-[var(--color-signal-clear)] mb-3">
          From people who used it
        </p>
        <h2 className="font-display text-3xl md:text-4xl font-semibold tracking-tight">
          Both sides of the hiring desk.
        </h2>
      </div>

      <div className="grid md:grid-cols-3 gap-5">
        {TESTIMONIALS.map((t, i) => (
          <motion.div
            key={t.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
          >
            <GlassCard className="p-6 h-full flex flex-col">
              <p className="text-[15px] leading-relaxed opacity-80 flex-1">
                “{t.quote}”
              </p>
              <div className="mt-5 pt-5 border-t border-[var(--color-line)] dark:border-[var(--color-line-dark)]">
                <p className="font-semibold text-sm">{t.name}</p>
                <p className="text-xs opacity-55">{t.role}</p>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
