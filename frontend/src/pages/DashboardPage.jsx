import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Target, TrendingUp, ListX, FileStack, Plus, AlertCircle } from "lucide-react";
import AppLayout from "../components/layout/AppLayout";
import Button from "../components/ui/Button";
import StatCard from "../components/dashboard/StatCard";
import HistoryList from "../components/dashboard/HistoryList";
import { analysisService } from "../services/analysisService";
import { useAuth } from "../context/AuthContext";

export default function DashboardPage() {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadHistory() {
      try {
        const data = await analysisService.getHistory();
        setHistory(data);
      } catch (err) {
        setError(err.message || "Could not load your analysis history.");
      } finally {
        setIsLoading(false);
      }
    }
    loadHistory();
  }, []);

  const latest = history[0];
  const avgScore = history.length
    ? Math.round(history.reduce((sum, h) => sum + h.ats_score, 0) / history.length)
    : 0;
  const totalMissingSkills = latest ? latest.missing_skills.length : 0;
  const totalImprovements = latest ? latest.recommendations.length : 0;

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl font-semibold tracking-tight">
              Welcome back{user?.name ? `, ${user.name.split(" ")[0]}` : ""}
            </h1>
            <p className="opacity-60 mt-1">Here's how your resume is performing.</p>
          </div>
          <Link to="/upload">
            <Button variant="accent" icon={Plus}>New analysis</Button>
          </Link>
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-xl bg-[var(--color-signal-gap)]/12 text-[var(--color-signal-gap-deep)] dark:text-[var(--color-signal-gap)] px-4 py-3 text-sm mb-6">
            <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {!isLoading && history.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border-2 border-dashed border-current/15 p-16 text-center"
          >
            <div className="h-14 w-14 rounded-2xl bg-[var(--color-signal-clear)]/15 mx-auto mb-5 flex items-center justify-center">
              <FileStack size={26} className="text-[var(--color-signal-clear-deep)] dark:text-[var(--color-signal-clear)]" />
            </div>
            <h2 className="font-display text-xl font-semibold mb-2">Run your first analysis</h2>
            <p className="opacity-60 max-w-sm mx-auto mb-6">
              Upload a resume and a job description to see your ATS score, missing skills, and tailored recommendations.
            </p>
            <Link to="/upload">
              <Button variant="primary" icon={Plus}>Upload a resume</Button>
            </Link>
          </motion.div>
        ) : (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
              <StatCard
                icon={Target}
                label="Latest ATS Score"
                value={latest ? Math.round(latest.ats_score) : "—"}
                accent="clear"
                delay={0}
              />
              <StatCard
                icon={TrendingUp}
                label="Average score across all analyses"
                value={avgScore}
                accent="review"
                delay={0.05}
              />
              <StatCard
                icon={ListX}
                label="Missing skills (latest)"
                value={totalMissingSkills}
                accent="gap"
                delay={0.1}
              />
              <StatCard
                icon={FileStack}
                label="Total analyses run"
                value={history.length}
                accent="clear"
                delay={0.15}
              />
            </div>

            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-lg">Analysis history</h2>
            </div>
            <HistoryList history={history} />
          </>
        )}

        {isLoading && (
          <div className="flex justify-center py-16">
            <div className="h-8 w-8 rounded-full border-2 border-current/20 border-t-[var(--color-signal-clear)] animate-spin" />
          </div>
        )}
      </div>
    </AppLayout>
  );
}
