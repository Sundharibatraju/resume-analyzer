import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Download, Plus, AlertCircle, ArrowLeft } from "lucide-react";
import AppLayout from "../components/layout/AppLayout";
import Button from "../components/ui/Button";
import GlassCard from "../components/ui/GlassCard";
import ScoreGauge from "../components/ui/ScoreGauge";
import ProgressBar from "../components/ui/ProgressBar";
import ScoreBreakdownChart from "../components/analysis/ScoreBreakdownChart";
import SectionBreakdown from "../components/analysis/SectionBreakdown";
import SkillsPanel from "../components/analysis/SkillsPanel";
import RecommendationsList from "../components/analysis/RecommendationsList";
import ParsedResumeSummary from "../components/analysis/ParsedResumeSummary";
import { analysisService } from "../services/analysisService";

export default function ResultsPage() {
  const { analysisId } = useParams();
  const [analysis, setAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      setError("");
      try {
        const data = await analysisService.getResult(analysisId);
        setAnalysis(data);
      } catch (err) {
        setError(err.message || "Could not load this analysis.");
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [analysisId]);

  function handleExport() {
    window.print();
  }

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex justify-center py-24">
          <div className="h-8 w-8 rounded-full border-2 border-current/20 border-t-[var(--color-signal-clear)] animate-spin" />
        </div>
      </AppLayout>
    );
  }

  if (error || !analysis) {
    return (
      <AppLayout>
        <div className="max-w-md mx-auto px-6 py-24 text-center">
          <AlertCircle size={32} className="mx-auto mb-4 text-[var(--color-signal-gap)]" />
          <p className="font-semibold mb-2">Couldn't load this analysis</p>
          <p className="text-sm opacity-60 mb-6">{error}</p>
          <Link to="/dashboard">
            <Button variant="primary">Back to dashboard</Button>
          </Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto px-6 py-10 print:py-0">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 print:hidden">
          <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-sm opacity-60 hover:opacity-100 transition-opacity">
            <ArrowLeft size={15} /> Dashboard
          </Link>
          <div className="flex gap-3">
            <Button variant="outline" icon={Download} onClick={handleExport}>
              Export report
            </Button>
            <Link to="/upload">
              <Button variant="accent" icon={Plus}>New analysis</Button>
            </Link>
          </div>
        </div>

        {/* Header / Hero score card */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <GlassCard className="p-8 mb-6">
            <div className="flex flex-wrap items-center gap-8">
              <ScoreGauge score={analysis.ats_score} size="lg" label="Overall ATS Score" />
              <div className="flex-1 min-w-[220px]">
                <p className="text-xs uppercase tracking-wide opacity-50 font-semibold mb-1">
                  {analysis.job_title || "Analysis"}
                </p>
                <h1 className="font-display text-2xl font-semibold mb-4">
                  {analysis.resume?.original_filename}
                </h1>
                <div className="grid sm:grid-cols-2 gap-3">
                  <ProgressBar value={analysis.skill_score} label="Skill Match (40%)" />
                  <ProgressBar value={analysis.keyword_score} label="Keyword Match (30%)" />
                  <ProgressBar value={analysis.experience_score} label="Experience Match (20%)" />
                  <ProgressBar value={analysis.education_score} label="Education Match (10%)" />
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <ScoreBreakdownChart scores={analysis} />
            <SkillsPanel
              matchedSkills={analysis.matched_skills}
              missingSkills={analysis.missing_skills}
              recommendedSkills={analysis.recommended_skills}
            />
            <RecommendationsList recommendations={analysis.recommendations} />
            <SectionBreakdown sectionScores={analysis.section_scores} />
          </div>

          <div className="space-y-6">
            <ParsedResumeSummary resume={analysis.resume} />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
