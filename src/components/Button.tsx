import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
  children: ReactNode;
}

export function Button({
  variant = "primary",
  children,
  className = "",
  ...props
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 h-10 font-mono text-base px-4 py-2 transition-all duration-150 ease-[cubic-bezier(0.4,0,0.2,1)] cursor-pointer";

  const variantStyles = {
    primary:
      "bg-white text-black border border-black shadow-[3px_3px_0_0_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:bg-white/90",
    secondary:
      "bg-background text-foreground border border-foreground shadow-[3px_3px_0_0_rgba(250,250,250,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:bg-background",
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
