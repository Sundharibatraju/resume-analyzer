import GlassCard from "../ui/GlassCard";
import SkillPill from "../ui/SkillPill";

export default function SkillsPanel({ matchedSkills = [], missingSkills = [], recommendedSkills = [] }) {
  return (
    <GlassCard className="p-6">
      <h3 className="font-semibold mb-1">Skill match breakdown</h3>
      <p className="text-sm opacity-55 mb-5">
        What's already on your resume versus what this job is asking for.
      </p>

      <div className="space-y-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide opacity-50 mb-2.5">
            Matched skills ({matchedSkills.length})
          </p>
          {matchedSkills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {matchedSkills.map((skill) => (
                <SkillPill key={skill} skill={skill} variant="matched" />
              ))}
            </div>
          ) : (
            <p className="text-sm opacity-45">No direct skill matches found.</p>
          )}
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide opacity-50 mb-2.5">
            Missing required skills ({missingSkills.length})
          </p>
          {missingSkills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {missingSkills.map((skill) => (
                <SkillPill key={skill} skill={skill} variant="missing" />
              ))}
            </div>
          ) : (
            <p className="text-sm opacity-45">No required skills are missing — nice work.</p>
          )}
        </div>

        {recommendedSkills.length > 0 && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide opacity-50 mb-2.5">
              Worth learning ({recommendedSkills.length})
            </p>
            <div className="flex flex-wrap gap-2">
              {recommendedSkills.map((skill) => (
                <SkillPill key={skill} skill={skill} variant="recommended" />
              ))}
            </div>
          </div>
        )}
      </div>
    </GlassCard>
  );
}
