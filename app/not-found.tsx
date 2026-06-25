import { SearchX } from "lucide-react";
import { LinkButton } from "@/components/ui/link-button";

export default function NotFound() {
  return <div className="container-page py-24 text-center"><div className="mx-auto grid size-16 place-items-center rounded-2xl bg-blue-50 text-blue-700"><SearchX className="size-8" /></div><p className="mt-7 text-sm font-bold text-blue-600">404 NOT FOUND</p><h1 className="mt-3 text-3xl font-black sm:text-4xl">페이지를 찾을 수 없어요</h1><p className="mt-4 text-sm leading-6 text-slate-500">주소가 변경되었거나 삭제된 페이지일 수 있습니다.<br />수업 목록에서 새로운 수업을 찾아보세요.</p><div className="mt-8 flex justify-center gap-3"><LinkButton href="/">홈으로</LinkButton><LinkButton href="/courses" variant="outline">수업 찾기</LinkButton></div></div>;
}
