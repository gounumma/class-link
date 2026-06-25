import type { ChatMessage, ChatThread, Course, Profile, TutorApplication } from "@/lib/types";

export const demoCourses: Course[] = [
  {
    id: "11111111-1111-4111-8111-111111111111",
    title: "중등 수학, 개념부터 자신감까지",
    subject: "수학",
    grade_level: "중1–중3",
    short_description: "빈틈을 진단하고 개념과 문제 해결력을 차근차근 쌓는 1:1 수업",
    full_description: "학생의 현재 학습 수준과 오답 패턴을 먼저 진단합니다. 핵심 개념을 학생의 언어로 다시 설명하고, 유형별 문제와 주간 복습을 통해 흔들리지 않는 수학 기본기를 만듭니다.\n\n매 수업 후 학습 리포트와 다음 주 과제를 안내해 보호자와도 학습 과정을 투명하게 공유합니다.",
    schedule_text: "주 2회 · 회당 90분 · 시간 협의",
    price_text: "월 480,000원",
    image_url: null,
    is_published: true,
    is_featured: true,
    sort_order: 1
  },
  {
    id: "22222222-2222-4222-8222-222222222222",
    title: "초등 영어 리딩 & 스피킹",
    subject: "영어",
    grade_level: "초3–초6",
    short_description: "즐겁게 읽고 자연스럽게 말하며 영어 감각을 키우는 맞춤 수업",
    full_description: "레벨에 맞는 원서 리딩과 일상 주제 스피킹을 함께 진행합니다. 단어 암기에 머물지 않고 문맥 속에서 이해하고 자신의 문장으로 표현하는 힘을 기릅니다.",
    schedule_text: "주 2회 · 회당 60분 · 평일 오후",
    price_text: "월 360,000원",
    image_url: null,
    is_published: true,
    is_featured: true,
    sort_order: 2
  },
  {
    id: "33333333-3333-4333-8333-333333333333",
    title: "고등 국어 내신 집중반",
    subject: "국어",
    grade_level: "고1–고2",
    short_description: "학교별 출제 경향과 작품 분석을 연결하는 꼼꼼한 내신 대비",
    full_description: "학교별 교과서와 부교재를 바탕으로 문학 작품의 핵심 맥락, 비문학 독해 전략, 서술형 답안 작성법을 훈련합니다.",
    schedule_text: "주 1회 · 회당 120분 · 토요일",
    price_text: "월 420,000원",
    image_url: null,
    is_published: true,
    is_featured: true,
    sort_order: 3
  }
];

export const demoProfiles: Profile[] = [
  { id: "admin-demo", email: "admin@classlink.kr", name: "관리자", phone: "02-1234-5678", role: "ADMIN", tutor_status: null, created_at: "2026-06-01T09:00:00Z" },
  { id: "55555555-5555-4555-8555-555555555555", email: "teacher@example.com", name: "김서윤", phone: "010-1234-5678", role: "TUTOR", tutor_status: "PENDING", created_at: "2026-06-20T09:00:00Z" },
  { id: "student-demo", email: "student@example.com", name: "박민준", phone: "010-2222-3333", role: "STUDENT", tutor_status: null, created_at: "2026-06-21T09:00:00Z" }
];

export const demoTutors: TutorApplication[] = [{
  id: "44444444-4444-4444-8444-444444444444",
  user_id: "55555555-5555-4555-8555-555555555555",
  school_name: "한국대학교",
  major: "수학교육과",
  education_status: "GRADUATED",
  career: "중·고등 수학 개인지도 4년, 학원 강의 2년",
  bio: "학생이 스스로 설명할 수 있을 때까지 기다리고 질문하는 선생님입니다.",
  certificate_file_path: "demo/certificate.pdf",
  status: "PENDING",
  rejection_reason: null,
  reviewed_at: null,
  created_at: "2026-06-20T09:00:00Z",
  users_profile: demoProfiles[1]
}];

export const demoThreads: ChatThread[] = [{
  id: "thread-demo",
  user_id: "student-demo",
  course_id: demoCourses[0].id,
  status: "OPEN",
  created_at: "2026-06-22T03:30:00Z",
  courses: { id: demoCourses[0].id, title: demoCourses[0].title },
  users_profile: { id: "student-demo", name: "박민준", email: "student@example.com", role: "STUDENT" }
}];

export const demoMessages: ChatMessage[] = [
  { id: "m1", thread_id: "thread-demo", sender_id: "student-demo", body: "중학교 2학년인데 진도와 선행을 함께 진행할 수 있을까요?", created_at: "2026-06-22T03:30:00Z", read_at: "2026-06-22T04:00:00Z", users_profile: { id: "student-demo", name: "박민준", role: "STUDENT" } },
  { id: "m2", thread_id: "thread-demo", sender_id: "admin-demo", body: "네, 가능합니다. 현재 진도와 목표를 확인한 뒤 복습 60%, 선행 40%로 시작해 조정해 드려요.", created_at: "2026-06-22T04:10:00Z", read_at: null, users_profile: { id: "admin-demo", name: "관리자", role: "ADMIN" } }
];
