import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AlertCircle, Sparkles, Briefcase } from "lucide-react";
import AppLayout from "../components/layout/AppLayout";
import GlassCard from "../components/ui/GlassCard";
import Button from "../components/ui/Button";
import ResumeDropzone from "../components/upload/ResumeDropzone";
import { resumeService } from "../services/resumeService";
import { analysisService } from "../services/analysisService";

const STEPS = ["Upload resume", "Add job description", "Review"];

export default function UploadPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedResume, setUploadedResume] = useState(null);

  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");

  const [error, setError] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  async function handleFileSelected(selectedFile) {
    setFile(selectedFile);
    setError("");
    setIsUploading(true);
    setUploadProgress(0);
    try {
      const result = await resumeService.upload(selectedFile, setUploadProgress);
      setUploadedResume(result.resume);
      setTimeout(() => setStep(2), 500);
    } catch (err) {
      setError(err.message || "Upload failed. Please try a different file.");
      setFile(null);
    } finally {
      setIsUploading(false);
    }
  }

  function handleClearFile() {
    setFile(null);
    setUploadedResume(null);
    setUploadProgress(0);
  }

  async function handleAnalyze() {
    if (jobDescription.trim().split(/\s+/).length < 10) {
      setError("Please paste a fuller job description (at least a couple of sentences).");
      return;
    }
    setError("");
    setIsAnalyzing(true);
    try {
      const analysis = await analysisService.analyze({
        resumeId: uploadedResume.id,
        jobTitle,
        jobDescription,
      });
      navigate(`/results/${analysis.id}`);
    } catch (err) {
      setError(err.message || "Analysis failed. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  }

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="mb-10">
          <h1 className="font-display text-3xl font-semibold tracking-tight mb-2">
            Run a new analysis
          </h1>
          <p className="opacity-60">Upload a resume and the job you're targeting.</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((label, i) => {
            const stepNum = i + 1;
            const active = stepNum === step;
            const done = stepNum < step;
            return (
              <div key={label} className="flex items-center gap-2 flex-1">
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 transition-colors ${
                    done
                      ? "bg-[var(--color-signal-clear)] text-[var(--color-ink)]"
                      : active
                      ? "bg-[var(--color-ink)] text-white dark:bg-[var(--color-signal-clear)] dark:text-[var(--color-ink)]"
                      : "bg-current/10 opacity-50"
                  }`}
                >
                  {stepNum}
                </div>
                <span className={`text-sm hidden sm:inline ${active ? "font-semibold" : "opacity-50"}`}>
                  {label}
                </span>
                {stepNum < STEPS.length && <div className="flex-1 h-px bg-current/10 mx-1" />}
              </div>
            );
          })}
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-xl bg-[var(--color-signal-gap)]/12 text-[var(--color-signal-gap-deep)] dark:text-[var(--color-signal-gap)] px-4 py-3 text-sm mb-6">
            <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {step === 1 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <GlassCard className="p-7">
              <h2 className="font-semibold mb-1">Your resume</h2>
              <p className="text-sm opacity-55 mb-5">PDF or DOCX, up to 10MB.</p>
              <ResumeDropzone
                onFileSelected={handleFileSelected}
                selectedFile={file}
                onClear={handleClearFile}
                uploadProgress={uploadProgress}
                isUploading={isUploading}
              />
            </GlassCard>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <GlassCard className="p-7">
              <div className="flex items-center gap-2 mb-1">
                <Briefcase size={17} className="opacity-60" />
                <h2 className="font-semibold">Target job</h2>
              </div>
              <p className="text-sm opacity-55 mb-5">
                Paste the full job posting — the more detail, the more accurate your score.
              </p>

              <label className="text-sm font-medium opacity-70 block mb-1.5">
                Job title <span className="opacity-40 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g. Senior Backend Engineer"
                className="w-full rounded-xl border border-current/15 bg-transparent px-4 py-2.5 text-sm outline-none focus:border-[var(--color-signal-clear)] transition-colors mb-4"
              />

              <label className="text-sm font-medium opacity-70 block mb-1.5">Job description</label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the full job description here, including required and preferred qualifications..."
                rows={10}
                className="w-full rounded-xl border border-current/15 bg-transparent px-4 py-3 text-sm outline-none focus:border-[var(--color-signal-clear)] transition-colors resize-none"
              />
              <p className="text-xs opacity-45 mt-1.5">
                {jobDescription.trim().split(/\s+/).filter(Boolean).length} words
              </p>

              <div className="flex items-center justify-between mt-6">
                <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
                <Button
                  variant="accent"
                  icon={Sparkles}
                  onClick={handleAnalyze}
                  loading={isAnalyzing}
                  disabled={!jobDescription.trim()}
                >
                  Analyze resume
                </Button>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </div>
    </AppLayout>
  );
}
