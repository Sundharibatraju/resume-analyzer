import Logo from "../ui/Logo";

export default function Footer() {
  return (
    <footer className="border-t border-[var(--color-line)] dark:border-[var(--color-line-dark)] mt-24">
      <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <Logo />
        <p className="text-sm opacity-60">
          © {new Date().getFullYear()} ClearscoreATS. Built to help good resumes get seen.
        </p>
      </div>
    </footer>
  );
}
