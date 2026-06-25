import { forwardRef, type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Field({ label, hint, required, children }: { label: string; hint?: string; required?: boolean; children: React.ReactNode }) {
  return <div className="block space-y-2 text-sm font-medium text-slate-700">
    <span>{label}{required && <span className="ml-1 text-coral">*</span>}</span>
    {children}
    {hint && <span className="block text-xs font-normal leading-5 text-slate-500">{hint}</span>}
  </div>;
}

const base = "focus-ring h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-[15px] text-slate-800 placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500";
export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) { return <input className={cn(base, className)} {...props} />; }
export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) { return <select className={cn(base, className)} {...props} />; }
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(function Textarea({ className, ...props }, ref) { return <textarea ref={ref} className={cn(base, "h-auto min-h-28 py-3 leading-6", className)} {...props} />; });
