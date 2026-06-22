import Navbar from "./Navbar";

export default function AppLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-paper)] dark:bg-[var(--color-ink)] text-[var(--color-text-primary)] dark:text-[var(--color-text-onink)] paper-grain transition-colors duration-300">
      <Navbar />
      <main className="flex-1">{children}</main>
    </div>
  );
}
