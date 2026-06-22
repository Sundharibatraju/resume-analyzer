import GlassCard from "../ui/GlassCard";
import { Mail, Phone, Link2, Code2, GraduationCap, Award, Languages as LanguagesIcon } from "lucide-react";

export default function ParsedResumeSummary({ resume }) {
  const data = resume?.parsed_data || {};

  return (
    <GlassCard className="p-6">
      <h3 className="font-semibold mb-1">What we extracted</h3>
      <p className="text-sm opacity-55 mb-5">From {resume?.original_filename}</p>

      <div className="space-y-4 text-sm">
        <div>
          <p className="font-semibold text-base mb-1">{data.name || "Name not detected"}</p>
          <div className="flex flex-col gap-1.5 opacity-70">
            {data.email && (
              <span className="flex items-center gap-2"><Mail size={13} /> {data.email}</span>
            )}
            {data.phone && (
              <span className="flex items-center gap-2"><Phone size={13} /> {data.phone}</span>
            )}
            {data.linkedin && (
              <span className="flex items-center gap-2"><Link2 size={13} /> LinkedIn linked</span>
            )}
            {data.github && (
              <span className="flex items-center gap-2"><Code2 size={13} /> GitHub linked</span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between py-3 border-t border-current/10">
          <span className="opacity-60">Years of experience</span>
          <span className="font-mono-tabular font-semibold">{data.years_experience ?? "—"}</span>
        </div>

        {data.education?.length > 0 && (
          <div className="py-3 border-t border-current/10">
            <p className="flex items-center gap-2 opacity-60 mb-2">
              <GraduationCap size={14} /> Education
            </p>
            {data.education.map((e, i) => (
              <p key={i} className="opacity-80 text-[13px] leading-snug mb-1">{e.text}</p>
            ))}
          </div>
        )}

        {data.certifications?.length > 0 && (
          <div className="py-3 border-t border-current/10">
            <p className="flex items-center gap-2 opacity-60 mb-2">
              <Award size={14} /> Certifications
            </p>
            {data.certifications.map((c, i) => (
              <p key={i} className="opacity-80 text-[13px] leading-snug mb-1">{c}</p>
            ))}
          </div>
        )}

        {data.languages?.length > 0 && (
          <div className="py-3 border-t border-current/10">
            <p className="flex items-center gap-2 opacity-60 mb-2">
              <LanguagesIcon size={14} /> Languages
            </p>
            <p className="opacity-80 text-[13px]">{data.languages.join(", ")}</p>
          </div>
        )}
      </div>
    </GlassCard>
  );
}
