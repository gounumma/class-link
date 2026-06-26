import fs from "node:fs";
import path from "node:path";
import { demoCourses } from "@/lib/demo-data";
import type { Course } from "@/lib/types";

type DemoCourseInput = Omit<Course, "id" | "created_at" | "updated_at">;
const demoGlobal = globalThis as typeof globalThis & { classmoaDemoCourses?: Course[] };
const demoStorePath = path.join(process.cwd(), ".demo", "courses.json");

function readCourses() {
  try {
    const raw = fs.readFileSync(demoStorePath, "utf8");
    const parsed = JSON.parse(raw) as Course[];
    if (Array.isArray(parsed)) return parsed;
  } catch {
    // Demo mode starts from the seeded sample courses until a local change is made.
  }
  return demoCourses.map((course) => ({ ...course }));
}

function writeCourses(courses: Course[]) {
  fs.mkdirSync(path.dirname(demoStorePath), { recursive: true });
  fs.writeFileSync(demoStorePath, JSON.stringify(courses, null, 2), "utf8");
  demoGlobal.classmoaDemoCourses = courses;
}

function store() {
  demoGlobal.classmoaDemoCourses = readCourses();
  return demoGlobal.classmoaDemoCourses;
}

export function getDemoCourses() {
  return store().map((course) => ({ ...course }));
}

export function saveDemoCourse(id: string | null, input: DemoCourseInput) {
  const courses = store();
  const now = new Date().toISOString();
  if (id) {
    const index = courses.findIndex((course) => course.id === id);
    if (index >= 0) courses[index] = { ...courses[index], ...input, updated_at: now };
    writeCourses(courses);
    return id;
  }
  const newId = crypto.randomUUID();
  courses.push({ id: newId, ...input, created_at: now, updated_at: now });
  writeCourses(courses);
  return newId;
}

export function deleteDemoCourse(id: string) {
  writeCourses(store().filter((course) => course.id !== id));
}

export function setDemoCoursePublished(id: string, isPublished: boolean) {
  const courses = store();
  const index = courses.findIndex((course) => course.id === id);
  if (index >= 0) courses[index] = { ...courses[index], is_published: isPublished, updated_at: new Date().toISOString() };
  writeCourses(courses);
}
