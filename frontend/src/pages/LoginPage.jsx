import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, ArrowRight, AlertCircle } from "lucide-react";
import AppLayout from "../components/layout/AppLayout";
import GlassCard from "../components/ui/GlassCard";
import Button from "../components/ui/Button";
import Logo from "../components/ui/Logo";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form);
      const redirectTo = location.state?.from?.pathname || "/dashboard";
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppLayout>
      <div className="min-h-[80vh] flex items-center justify-center px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="flex justify-center mb-8">
            <Logo />
          </div>

          <GlassCard className="p-8">
            <h1 className="font-display text-2xl font-semibold text-center mb-1">Welcome back</h1>
            <p className="text-sm opacity-60 text-center mb-7">
              Log in to see your resume analyses
            </p>

            {error && (
              <div className="flex items-start gap-2 rounded-xl bg-[var(--color-signal-gap)]/12 text-[var(--color-signal-gap-deep)] dark:text-[var(--color-signal-gap)] px-4 py-3 text-sm mb-5">
                <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium opacity-70 block mb-1.5">Email</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 opacity-40" />
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-current/15 bg-transparent pl-10 pr-4 py-2.5 text-sm outline-none focus:border-[var(--color-signal-clear)] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium opacity-70 block mb-1.5">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 opacity-40" />
                  <input
                    type="password"
                    required
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-current/15 bg-transparent pl-10 pr-4 py-2.5 text-sm outline-none focus:border-[var(--color-signal-clear)] transition-colors"
                  />
                </div>
              </div>

              <Button type="submit" variant="primary" className="w-full mt-2" icon={ArrowRight} loading={loading}>
                Log in
              </Button>
            </form>
          </GlassCard>

          <p className="text-center text-sm opacity-60 mt-6">
            Don't have an account?{" "}
            <Link to="/register" className="font-semibold text-[var(--color-signal-clear-deep)] dark:text-[var(--color-signal-clear)] hover:underline">
              Create one
            </Link>
          </p>
        </motion.div>
      </div>
    </AppLayout>
  );
}
