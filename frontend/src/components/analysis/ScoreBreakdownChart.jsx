import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from "recharts";
import GlassCard from "../ui/GlassCard";

function getColor(score) {
  if (score >= 75) return "#2DD4BF";
  if (score >= 50) return "#F5A524";
  return "#FB6F6F";
}

export default function ScoreBreakdownChart({ scores }) {
  const data = [
    { name: "Skill Match", value: scores.skill_score, weight: "40%" },
    { name: "Keyword Match", value: scores.keyword_score, weight: "30%" },
    { name: "Experience", value: scores.experience_score, weight: "20%" },
    { name: "Education", value: scores.education_score, weight: "10%" },
  ];

  return (
    <GlassCard className="p-6">
      <h3 className="font-semibold mb-1">Score breakdown</h3>
      <p className="text-sm opacity-55 mb-5">
        Each component's contribution to your overall ATS score, weighted by importance.
      </p>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} layout="vertical" margin={{ left: 10, right: 24, top: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="currentColor" strokeOpacity={0.08} />
          <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12, opacity: 0.5 }} axisLine={false} tickLine={false} />
          <YAxis
            type="category"
            dataKey="name"
            width={110}
            tick={{ fontSize: 13 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            formatter={(value, _name, props) => [`${Math.round(value)} / 100`, `Weight: ${props.payload.weight}`]}
            contentStyle={{
              borderRadius: 12,
              border: "none",
              fontSize: 13,
              boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
            }}
          />
          <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={22}>
            {data.map((entry, i) => (
              <Cell key={i} fill={getColor(entry.value)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </GlassCard>
  );
}
