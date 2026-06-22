import clsx from "clsx";

export default function GlassCard({ children, className, as: Component = "div", ...props }) {
  return (
    <Component
      className={clsx(
        "glass rounded-2xl shadow-[0_8px_30px_rgba(30,27,22,0.06)]",
        "dark:shadow-[0_8px_30px_rgba(0,0,0,0.3)]",
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}
