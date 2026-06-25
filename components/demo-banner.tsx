import { isSupabaseConfigured } from "@/lib/supabase/config";

export function DemoBanner() {
  if (isSupabaseConfigured) return null;
  return <div className="bg-amber-50 px-4 py-2 text-center text-xs font-medium text-amber-800">현재 샘플 데이터를 보여주는 로컬 데모 모드입니다. Supabase 환경 변수를 연결하면 실제 인증과 데이터가 활성화됩니다.</div>;
}
