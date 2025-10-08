import { clsx } from "clsx";
import React from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary"|"outline"|"ghost", size?: "sm"|"md"|"lg" };
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant="primary", size="md", ...props }, ref) => {
    const base = "inline-flex items-center justify-center rounded-2xl font-medium transition focus:outline-none focus:ring-2 focus:ring-brand/40 disabled:opacity-50 disabled:cursor-not-allowed";
    const variants = {
      primary: "bg-brand text-white hover:bg-indigo-500",
      outline: "border border-slate-300 hover:bg-slate-50",
      ghost: "hover:bg-slate-100",
    }[variant];
    const sizes = { sm:"px-3 py-1.5 text-sm", md:"px-4 py-2", lg:"px-5 py-2.5 text-base" }[size];
    return <button ref={ref} className={clsx(base, variants, sizes, className)} {...props} />;
  }
);
Button.displayName = "Button";
