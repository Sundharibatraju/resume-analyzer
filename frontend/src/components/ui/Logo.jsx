import clsx from "clsx";

export default function Logo({ className, iconOnly = false }) {
  return (
    <div className={clsx("flex items-center gap-2.5 select-none", className)}>
      <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
        <rect x="1" y="1" width="28" height="28" rx="8" className="fill-[var(--color-signal-clear)]" />
        <path
          d="M9 15.5L13 19.5L21 10.5"
          stroke="var(--color-ink)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {!iconOnly && (
        <span className="font-display text-lg font-semibold tracking-tight">
          Clearscore<span className="opacity-50">ATS</span>
        </span>
      )}
    </div>
  );
}
