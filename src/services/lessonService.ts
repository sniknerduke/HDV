const LESSON_API_BASE = import.meta.env.VITE_LESSON_SERVICE_URL ?? 'http://localhost:9090';

export type LessonType = 'video' | 'text' | 'quiz' | string;

export interface LessonPayload {
  title: string;
  type?: LessonType;
  fileName?: string;
  mimeType?: string;
  size?: number;
  videoUrl?: string;
}

export interface SectionPayload {
  title: string;
  description?: string;
}

export interface ReorderPayload {
  fromIndex: number;
  toIndex: number;
}

export interface LessonDto {
  id: number;
  section?: SectionDto;
  title: string;
  type?: LessonType;
  fileName?: string;
  mimeType?: string;
  size?: number;
  videoUrl?: string;
  position?: number;
}

export interface SectionDto {
  id: number;
  courseId: number;
  title: string;
  description?: string;
  position?: number;
  lessons: LessonDto[];
}

const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    let detail: string | undefined;
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      try {
        const payload = await response.json();
        if (typeof payload?.message === 'string' && payload.message.trim().length > 0) {
          detail = payload.message;
        }
      } catch {/* ignore */}
    } else {
      try {
        const text = await response.text();
        if (text.trim().length > 0) detail = text;
      } catch {/* ignore */}
    }
    throw new Error(detail ?? `HTTP ${response.status}`);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
};

const authHeaders = (token: string) => ({
  Authorization: `Bearer ${token}`,
  'Content-Type': 'application/json',
});

/* -------- Sections -------- */
export async function fetchCourseStructure(courseId: number, token: string): Promise<SectionDto[]> {
  const res = await fetch(`${LESSON_API_BASE}/api/lessons/course/${courseId}/structure`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse<SectionDto[]>(res);
}

export async function createSection(courseId: number, payload: SectionPayload, token: string): Promise<SectionDto> {
  const res = await fetch(`${LESSON_API_BASE}/api/lessons/course/${courseId}/sections`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
  return handleResponse<SectionDto>(res);
}

export async function updateSection(courseId: number, sectionId: number, payload: SectionPayload, token: string): Promise<SectionDto> {
  const res = await fetch(`${LESSON_API_BASE}/api/lessons/course/${courseId}/sections/${sectionId}`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
  return handleResponse<SectionDto>(res);
}

export async function deleteSection(courseId: number, sectionId: number, token: string): Promise<void> {
  const res = await fetch(`${LESSON_API_BASE}/api/lessons/course/${courseId}/sections/${sectionId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse<void>(res);
}

export async function reorderSections(courseId: number, payload: ReorderPayload, token: string): Promise<SectionDto[]> {
  const res = await fetch(`${LESSON_API_BASE}/api/lessons/course/${courseId}/sections/reorder`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
  return handleResponse<SectionDto[]>(res);
}

/* -------- Lessons -------- */
export async function createLesson(courseId: number, sectionId: number, payload: LessonPayload, token: string): Promise<LessonDto> {
  const res = await fetch(`${LESSON_API_BASE}/api/lessons/course/${courseId}/sections/${sectionId}/lessons`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
  return handleResponse<LessonDto>(res);
}

export async function updateLesson(courseId: number, sectionId: number, lessonId: number, payload: LessonPayload, token: string): Promise<LessonDto> {
  const res = await fetch(`${LESSON_API_BASE}/api/lessons/course/${courseId}/sections/${sectionId}/lessons/${lessonId}`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
  return handleResponse<LessonDto>(res);
}

export async function deleteLesson(courseId: number, sectionId: number, lessonId: number, token: string): Promise<void> {
  const res = await fetch(`${LESSON_API_BASE}/api/lessons/course/${courseId}/sections/${sectionId}/lessons/${lessonId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse<void>(res);
}

export async function reorderLessons(courseId: number, sectionId: number, payload: ReorderPayload, token: string): Promise<LessonDto[]> {
  const res = await fetch(`${LESSON_API_BASE}/api/lessons/course/${courseId}/sections/${sectionId}/lessons/reorder`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
  return handleResponse<LessonDto[]>(res);
}
