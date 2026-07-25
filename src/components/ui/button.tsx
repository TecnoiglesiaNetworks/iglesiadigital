import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "accent" | "ghost" | "brand";
type Size = "md" | "lg";

const variants: Record<Variant, string> = {
  accent: "bg-accent text-[#ffffff] shadow-[0_14px_34px_-12px_rgba(255,80,1,0.6)] hover:-translate-y-0.5 hover:bg-accent-soft",
  brand: "bg-brand text-white shadow-[0_14px_34px_-12px_rgba(106,61,232,0.5)] hover:-translate-y-0.5 hover:bg-brand2",
  ghost: "bg-transparent text-ink border border-line2 hover:bg-white/[0.06]",
};
const sizes: Record<Size, string> = {
  md: "px-6 py-[15px] text-[16px]",
  lg: "px-8 py-[18px] text-[17px]",
};

export interface ButtonProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: Variant;
  size?: Size;
}

export function Button({ variant = "accent", size = "md", className, children, ...props }: ButtonProps) {
  return (
    <a
      className={cn(
        "inline-flex items-center justify-center gap-2.5 rounded-[13px] font-semibold cursor-pointer transition-all duration-200 whitespace-nowrap",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </a>
  );
}
