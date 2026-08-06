import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
};

export function buttonClasses(
  variant: "primary" | "secondary" = "primary",
  extra = ""
): string {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50";
  const styles =
    variant === "primary"
      ? "bg-primary text-white hover:bg-primary-hover"
      : "border border-line bg-white text-ink hover:border-line-hover";
  return `${base} ${styles} ${extra}`.trim();
}

export function Button({ variant = "primary", className, ...props }: ButtonProps) {
  return (
    <button className={buttonClasses(variant, className)} {...props} />
  );
}
