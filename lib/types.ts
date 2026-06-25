export type Role = "STUDENT" | "TUTOR" | "ADMIN";
export type TutorStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface Profile {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  role: Role;
  tutor_status: TutorStatus | null;
  created_at: string;
}

export interface Course {
  id: string;
  title: string;
  subject: string | null;
  grade_level: string | null;
  short_description: string | null;
  full_description: string | null;
  schedule_text: string | null;
  price_text: string | null;
  image_url: string | null;
  is_published: boolean;
  is_featured: boolean;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface TutorApplication {
  id: string;
  user_id: string;
  school_name: string;
  major: string | null;
  education_status: "ENROLLED" | "GRADUATED";
  career: string | null;
  bio: string | null;
  certificate_file_path: string | null;
  status: TutorStatus;
  rejection_reason: string | null;
  reviewed_at: string | null;
  created_at: string;
  users_profile?: Profile;
}

export interface ChatThread {
  id: string;
  user_id: string;
  course_id: string | null;
  status: "OPEN" | "CLOSED";
  created_at: string;
  courses?: Pick<Course, "id" | "title"> | null;
  users_profile?: Pick<Profile, "id" | "name" | "email" | "role">;
}

export interface ChatMessage {
  id: string;
  thread_id: string;
  sender_id: string;
  body: string;
  created_at: string;
  read_at: string | null;
  users_profile?: Pick<Profile, "id" | "name" | "role">;
}
