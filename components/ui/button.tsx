import * as React from "react";
import { cn } from "@/lib/utils";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
};

export function Button({ className, variant = "primary", size = "md", ...props }: Props) {
  return <button className={cn(
    "focus-ring inline-flex items-center justify-center rounded-xl font-semibold transition disabled:pointer-events-none disabled:opacity-50",
    variant === "primary" && "bg-navy-900 text-white shadow-sm hover:bg-navy-800",
    variant === "secondary" && "bg-blue-600 text-white hover:bg-blue-700",
    variant === "outline" && "border border-slate-200 bg-white text-navy-900 hover:border-blue-300 hover:bg-blue-50",
    variant === "ghost" && "text-slate-600 hover:bg-slate-100 hover:text-navy-900",
    variant === "danger" && "bg-red-50 text-red-700 hover:bg-red-100",
    size === "sm" && "h-9 px-3 text-sm",
    size === "md" && "h-11 px-5 text-sm",
    size === "lg" && "h-13 px-6 text-base",
    className
  )} {...props} />;
}
