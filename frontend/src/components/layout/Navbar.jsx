import { Link, useNavigate } from "react-router-dom";
import { Moon, Sun, LogOut, LayoutDashboard } from "lucide-react";
import Logo from "../ui/Logo";
import Button from "../ui/Button";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-[var(--color-paper)]/80 dark:bg-[var(--color-ink)]/80 border-b border-[var(--color-line)] dark:border-[var(--color-line-dark)]">
      <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to={isAuthenticated ? "/dashboard" : "/"}>
          <Logo />
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
            className="h-9 w-9 flex items-center justify-center rounded-full hover:bg-current/8 transition-colors"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-full hover:bg-current/8 transition-colors"
              >
                <LayoutDashboard size={16} />
                Dashboard
              </Link>
              <Link to="/profile" className="hidden sm:block">
                <div className="h-9 w-9 rounded-full bg-[var(--color-signal-clear)]/20 text-[var(--color-signal-clear-deep)] dark:text-[var(--color-signal-clear)] flex items-center justify-center font-semibold text-sm">
                  {user?.name?.[0]?.toUpperCase() || "U"}
                </div>
              </Link>
              <Button variant="ghost" size="sm" icon={LogOut} onClick={handleLogout}>
                <span className="hidden sm:inline">Log out</span>
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">Log in</Button>
              </Link>
              <Link to="/register">
                <Button variant="primary" size="sm">Get started</Button>
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
