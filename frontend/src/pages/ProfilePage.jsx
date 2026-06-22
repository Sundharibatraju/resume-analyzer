import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Mail, Calendar, FileStack, Target, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout";
import GlassCard from "../components/ui/GlassCard";
import Button from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";
import { analysisService } from "../services/analysisService";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);

  useEffect(() => {
    analysisService.getHistory().then(setHistory).catch(() => {});
  }, []);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  const avgScore = history.length
    ? Math.round(history.reduce((sum, h) => sum + h.ats_score, 0) / history.length)
    : null;

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <GlassCard className="p-8 mb-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-16 w-16 rounded-full bg-[var(--color-signal-clear)]/20 text-[var(--color-signal-clear-deep)] dark:text-[var(--color-signal-clear)] flex items-center justify-center font-bold text-2xl flex-shrink-0">
                {user?.name?.[0]?.toUpperCase() || "U"}
              </div>
              <div>
                <h1 className="font-display text-2xl font-semibold">{user?.name}</h1>
                <p className="flex items-center gap-1.5 text-sm opacity-60 mt-0.5">
                  <Mail size={13} /> {user?.email}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm opacity-55 pt-4 border-t border-current/10">
              <Calendar size={14} />
              Member since{" "}
              {user?.created_at
                ? new Date(user.created_at).toLocaleDateString(undefined, { month: "long", year: "numeric" })
                : "—"}
            </div>
          </GlassCard>

          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            <GlassCard className="p-5">
              <FileStack size={18} className="opacity-50 mb-2" />
              <p className="font-mono-tabular text-2xl font-bold">{history.length}</p>
              <p className="text-sm opacity-55">Total analyses run</p>
            </GlassCard>
            <GlassCard className="p-5">
              <Target size={18} className="opacity-50 mb-2" />
              <p className="font-mono-tabular text-2xl font-bold">{avgScore ?? "—"}</p>
              <p className="text-sm opacity-55">Average ATS score</p>
            </GlassCard>
          </div>

          <Button variant="outline" icon={LogOut} onClick={handleLogout} className="w-full">
            Log out
          </Button>
        </motion.div>
      </div>
    </AppLayout>
  );
}
