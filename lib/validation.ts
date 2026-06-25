import { z } from "zod";

const email = z.string().trim().email("올바른 이메일을 입력해 주세요.");
const password = z.string().min(8, "비밀번호는 8자 이상이어야 합니다.").max(72);
const phone = z.string().trim().regex(/^01[016789]-?\d{3,4}-?\d{4}$/, "올바른 휴대전화 번호를 입력해 주세요.");

export const loginSchema = z.object({ email, password: z.string().min(1, "비밀번호를 입력해 주세요.") });

export const studentSignupSchema = z.object({
  name: z.string().trim().min(2, "이름을 입력해 주세요.").max(30),
  email,
  phone,
  password,
  terms: z.literal("on", { errorMap: () => ({ message: "필수 약관에 동의해 주세요." }) }),
  privacy: z.literal("on", { errorMap: () => ({ message: "개인정보 처리방침에 동의해 주세요." }) }),
  marketing: z.string().optional()
});

export const tutorSignupSchema = studentSignupSchema.extend({
  school_name: z.string().trim().min(2, "학교명을 입력해 주세요.").max(80),
  major: z.string().trim().max(80).optional(),
  education_status: z.enum(["ENROLLED", "GRADUATED"]),
  career: z.string().trim().max(2000).optional(),
  bio: z.string().trim().min(20, "자기소개를 20자 이상 작성해 주세요.").max(3000)
});

export const courseSchema = z.object({
  title: z.string().trim().min(2).max(100),
  subject: z.string().trim().max(30).optional(),
  grade_level: z.string().trim().max(50).optional(),
  short_description: z.string().trim().max(200).optional(),
  full_description: z.string().trim().max(10000).optional(),
  schedule_text: z.string().trim().max(200).optional(),
  price_text: z.string().trim().max(100).optional(),
  image_url: z.union([z.string().trim().url(), z.literal("")]).optional(),
  sort_order: z.coerce.number().int().min(0).max(9999),
  is_published: z.string().optional().transform((value) => value === "on"),
  is_featured: z.string().optional().transform((value) => value === "on")
});

export const chatSchema = z.object({
  thread_id: z.string().uuid().optional(),
  course_id: z.string().uuid().optional(),
  body: z.string().trim().min(1, "메시지를 입력해 주세요.").max(1000, "메시지는 1,000자까지 입력할 수 있어요.")
});

export const reviewTutorSchema = z.object({
  application_id: z.string().uuid(),
  decision: z.enum(["APPROVED", "REJECTED"]),
  rejection_reason: z.string().trim().max(500).optional()
}).refine((data) => data.decision !== "REJECTED" || Boolean(data.rejection_reason), {
  message: "반려 사유를 입력해 주세요.", path: ["rejection_reason"]
});

export async function validateCertificate(file: File) {
  const allowed = ["application/pdf", "image/jpeg", "image/png"];
  if (!allowed.includes(file.type)) return "PDF, JPG, JPEG, PNG 파일만 업로드할 수 있어요.";
  if (file.size > 10 * 1024 * 1024) return "파일 크기는 10MB 이하여야 해요.";
  const bytes = new Uint8Array(await file.slice(0, 8).arrayBuffer());
  const isPdf = bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46 && bytes[4] === 0x2d;
  const isJpeg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  const isPng = bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47 && bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a;
  if ((file.type === "application/pdf" && !isPdf) || (file.type === "image/jpeg" && !isJpeg) || (file.type === "image/png" && !isPng)) {
    return "파일 내용과 확장자가 일치하지 않아요. 원본 PDF 또는 이미지 파일을 선택해 주세요.";
  }
  return null;
}
