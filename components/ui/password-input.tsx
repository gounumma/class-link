"use client";

import { useState, type InputHTMLAttributes } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/field";
import { cn } from "@/lib/utils";

export function PasswordInput({ className, ...props }: Omit<InputHTMLAttributes<HTMLInputElement>, "type">) {
  const [visible, setVisible] = useState(false);
  const Icon = visible ? EyeOff : Eye;

  return (
    <div className="relative">
      <Input
        {...props}
        type={visible ? "text" : "password"}
        className={cn("pr-12", className)}
      />
      <button
        type="button"
        aria-label={visible ? "비밀번호 숨기기" : "비밀번호 보기"}
        title={visible ? "비밀번호 숨기기" : "비밀번호 보기"}
        onClick={() => setVisible((value) => !value)}
        className="focus-ring absolute right-2 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-navy-900"
      >
        <Icon className="size-4" />
      </button>
    </div>
  );
}
