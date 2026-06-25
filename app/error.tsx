"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LinkButton } from "@/components/ui/link-button";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <div className="container-page py-24 text-center"><div className="mx-auto grid size-16 place-items-center rounded-2xl bg-red-50 text-red-600"><AlertTriangle className="size-8" /></div><p className="mt-7 text-sm font-bold text-red-600">잠시 문제가 생겼어요</p><h1 className="mt-3 text-3xl font-black sm:text-4xl">페이지를 불러오지 못했습니다</h1><p className="mt-4 text-sm leading-6 text-slate-500">잠시 후 다시 시도해 주세요. 문제가 계속되면 고객센터로 문의해 주세요.</p><div className="mt-8 flex justify-center gap-3"><Button onClick={reset}>다시 시도</Button><LinkButton href="/" variant="outline">홈으로</LinkButton></div></div>;
}
