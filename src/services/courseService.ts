

export interface Lesson {
  id: number;
  title: string;
  duration?: string; 
  type?: 'video' | 'text' | 'quiz';
  description?: string;
  videoUrl?: string; 
  fileName?: string; 
  mimeType?: string;
  size?: number; 
}

export interface Section {
  id: number;
  title: string;
  description?: string;
  lessons: Lesson[];
}

export interface Course {
  id: number;
  code?: string;
  title: string;
  description: string;
  category: string;
  level: string;
  price: number;
  duration: string;
  students: number;
  status: 'published' | 'draft';
  sections?: Section[];
  createdBy?: string;
}

// Use dedicated course service URL; fall back to gateway (9090)
const COURSE_API_BASE = import.meta.env.VITE_COURSE_SERVICE_URL
  ?? import.meta.env.VITE_LESSON_SERVICE_URL // backward compatibility
  ?? 'http://localhost:9090';

interface BackendCourse {
  id: number;
  code: string;
  title: string;
  description?: string;
  price?: number;
  duration?: number;
  createdBy?: string;
}

export interface CreateCoursePayload {
  code: string;
  title: string;
  description?: string;
  price: number;
  duration: number;
  category?: string;
  level?: string;
  status?: 'published' | 'draft';
}

export interface UpdateCoursePayload {
  code: string;
  title: string;
  description?: string;
  price: number;
  duration: number;
}

const STORAGE_KEY = 'courses';

function readStorage(): Course[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeStorage(courses: Course[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(courses));
}

export function getCachedCourses(): Course[] {
  try {
    return readStorage();
  } catch {
    return [];
  }
}

export function persistCoursesSnapshot(courses: Course[]): void {
  writeStorage(courses);
}

const DEFAULT_CATEGORY = 'General';
const DEFAULT_LEVEL = 'Intermediate';
const DEFAULT_STATUS: 'draft' = 'draft';

const formatDuration = (hours: number): string => {
  if (!Number.isFinite(hours) || hours <= 0) return '';
  return `${hours} giờ`;
};

const mapBackendCourse = (input: BackendCourse, existing?: Course, extras?: Partial<Course>): Course => {
  const priceValueRaw = typeof input.price === 'number' ? input.price : Number(input.price ?? 0);
  const priceValue = Number.isFinite(priceValueRaw) ? priceValueRaw : 0;
  const durationRaw = typeof input.duration === 'number' ? input.duration : Number(input.duration ?? 0);
//   const durationFormatted = extras?.duration ?? existing?.duration ?? (Number.isFinite(durationRaw) && durationRaw > 0 ? formatDuration(durationRaw) : '');
  const durationFormatted = (Number.isFinite(durationRaw) && durationRaw > 0 ? formatDuration(durationRaw) : '');

  return {
    id: input.id,
    code: input.code,
    title: input.title,
    description: extras?.description ?? input.description ?? existing?.description ?? '',
    category: extras?.category ?? existing?.category ?? DEFAULT_CATEGORY,
    level: extras?.level ?? existing?.level ?? DEFAULT_LEVEL,
//     price: extras?.price ?? existing?.price ?? priceValue,
    price: extras?.price ?? priceValue,            // luôn ưu tiên API
    duration: extras?.duration ?? durationFormatted, // luôn ưu tiên API
//     duration: durationFormatted,
    students: extras?.students ?? existing?.students ?? 0,
    status: extras?.status ?? existing?.status ?? DEFAULT_STATUS,
    sections: existing?.sections,
    createdBy: input.createdBy ?? existing?.createdBy,
  };
};

const mergeCourses = (current: Course[], incoming: Course[]): Course[] => {
  const map = new Map<number, Course>();
  incoming.forEach((course) => {
    const existing = current.find((c) => c.id === course.id);
    map.set(course.id, {
      ...course,
      sections: existing?.sections ?? course.sections ?? [],
    });
  });
  current.forEach((course) => {
    if (!map.has(course.id)) {
      map.set(course.id, course);
    }
  });
  return Array.from(map.values());
};

const handleApiResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    let detail: string | undefined;
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      try {
        const payload = await response.json();
        if (typeof payload?.message === 'string' && payload.message.trim().length > 0) {
          detail = payload.message;
        }
      } catch {
        // ignored
      }
    } else {
      try {
        const text = await response.text();
        if (text.trim().length > 0) detail = text;
      } catch {
        // ignored
      }
    }
    throw new Error(detail ?? `HTTP ${response.status}`);
  }
  if (response.status === 204) {
    return undefined as T;
  }
  return response.json() as Promise<T>;
};

export async function getCourses(token: string): Promise<Course[]> {
  const response = await fetch(`${COURSE_API_BASE}/api/courses/list`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const payload = await handleApiResponse<BackendCourse[]>(response);
  const stored = readStorage();
  const mapped = payload.map((item) => {
    const existing = stored.find((course) => course.id === item.id);
    return mapBackendCourse(item, existing);
  });
  writeStorage(mergeCourses(stored, mapped));
  return mapped;
}

export async function fetchPublicCourses(): Promise<Course[]> {
  const response = await fetch(`${COURSE_API_BASE}/api/courses/public/list`);
  const payload = await handleApiResponse<BackendCourse[]>(response);
  const stored = readStorage();
  const mapped = payload.map((item, idx) => {
    const existing = stored.find((course) => course.id === item.id);
    return mapBackendCourse(item, existing);
  });
  writeStorage(mergeCourses(stored, mapped));
  return mapped;
}

export async function fetchCoursesForCatalog(token?: string): Promise<Course[]> {
  if (token) {
    try {
      return await getCourses(token);
    } catch (error) {
      console.warn('Không thể tải khóa học (có token), thử endpoint public.', error);
    }
  }
  try {
    return await fetchPublicCourses();
  } catch (error) {
    console.warn('Không thể tải khóa học public, sử dụng cache.', error);
  }
  const cached = getCachedCourses();
  if (cached.length > 0) {
    return cached;
  }
  ensureSeedData();
  return getCachedCourses();
}

export async function createCourse(payload: CreateCoursePayload, token: string): Promise<Course> {
  const body = {
    code: payload.code,
    title: payload.title,
    description: payload.description,
    price: payload.price,
    duration: payload.duration,
  };
  const response = await fetch(`${COURSE_API_BASE}/api/courses/public/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  const created = await handleApiResponse<BackendCourse>(response);
  const stored = readStorage();
  const mapped = mapBackendCourse(created, stored.find((c) => c.id === created.id), {
    description: payload.description ?? '',
    category: payload.category,
    level: payload.level,
    price: payload.price,
    duration: formatDuration(payload.duration),
    status: payload.status,
    students: 0,
  });
  writeStorage(mergeCourses(stored, [mapped]));
  return mapped;
}

export async function deleteCourseRemote(courseId: number, token: string): Promise<void> {
  const response = await fetch(`${COURSE_API_BASE}/api/courses/${courseId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  await handleApiResponse<void>(response);
  const stored = readStorage().filter((course) => course.id !== courseId);
  writeStorage(stored);
}

export async function updateCourseRemote(
  courseId: number,
  payload: UpdateCoursePayload,
  token: string,
  extras?: Partial<Course>
): Promise<Course> {
  const body = {
    code: payload.code,
    title: payload.title,
    description: payload.description,
    price: payload.price,
    duration: payload.duration,
  };
  const response = await fetch(`${COURSE_API_BASE}/api/courses/${courseId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  const updated = await handleApiResponse<BackendCourse>(response);
  const stored = readStorage();
  const existing = stored.find((course) => course.id === courseId);
  const mapped = mapBackendCourse(updated, existing, {
    description: payload.description ?? existing?.description ?? '',
    category: extras?.category ?? existing?.category ?? DEFAULT_CATEGORY,
    level: extras?.level ?? existing?.level ?? DEFAULT_LEVEL,
    status: extras?.status ?? existing?.status ?? DEFAULT_STATUS,
    students: extras?.students ?? existing?.students ?? 0,
    price: payload.price,
    duration: extras?.duration ?? formatDuration(payload.duration),
  });
  const merged = mergeCourses(stored, [mapped]);
  writeStorage(merged);
  return mapped;
}

// data demo nếu không có dữ liệu trong db
export function ensureSeedData() {
  const existing = readStorage();
  if (existing.length === 0) {
    const seed: Course[] = [
      {
        id: 1,
        code: 'COURSE-001',
        title: 'React từ cơ bản đến nâng cao',
        description: 'Khóa React toàn diện với dự án thực tế',
        category: 'Programming',
        level: 'Intermediate',
        price: 1500000,
        duration: '40 giờ',
        students: 245,
        status: 'published',
        sections: [
          {
            id: 101,
            title: 'Chương 1: Bắt đầu với React',
            lessons: [
              { id: 11, title: 'Giới thiệu React', duration: '12:30', type: 'video' },
              { id: 12, title: 'Component & Props', duration: '20:10', type: 'video' }
            ]
          },
          {
            id: 102,
            title: 'Chương 2: Trạng thái & Vòng đời',
            lessons: [
              { id: 13, title: 'State & Lifecycle', duration: '18:05', type: 'video' }
            ]
          }
        ]
      },
      {
        id: 2,
        code: 'COURSE-002',
        title: 'TypeScript cho người mới',
        description: 'Học TypeScript từ đầu qua ví dụ',
        category: 'Programming',
        level: 'Beginner',
        price: 1200000,
        duration: '30 giờ',
        students: 180,
        status: 'published',
        sections: [
          {
            id: 201,
            title: 'Chương 1: Cơ bản',
            lessons: [
              { id: 21, title: 'Giới thiệu TypeScript', duration: '15:00', type: 'video' },
              { id: 22, title: 'Kiểu cơ bản', duration: '24:40', type: 'video' }
            ]
          }
        ]
      },
      {
        id: 3,
        code: 'COURSE-003',
        title: 'Node.js Backend Development',
        description: 'Xây dựng RESTful API với Node.js',
        category: 'Programming',
        level: 'Advanced',
        price: 2000000,
        duration: '50 giờ',
        students: 156,
        status: 'draft',
        sections: [
          {
            id: 301,
            title: 'Chương 1: Cài đặt',
            lessons: [
              { id: 31, title: 'Setup môi trường', duration: '08:20', type: 'video' }
            ]
          },
          {
            id: 302,
            title: 'Chương 2: Express',
            lessons: [
              { id: 32, title: 'Express cơ bản', duration: '22:15', type: 'video' },
              { id: 33, title: 'RESTful API', duration: '30:05', type: 'video' }
            ]
          }
        ]
      }
    ];
    writeStorage(seed);
  }
}

export async function getCourseById(courseId: number): Promise<Course | null> {
  return readStorage().find(c => c.id === courseId) || null;
}

// Thêm các thể loại , section cho khóa học , chưa hoàn thiện
export async function addSection(courseId: number, section: Omit<Section, 'id' | 'lessons'> & { lessons?: Lesson[] }): Promise<Section | null> {
  const courses = readStorage();
  const course = courses.find(c => c.id === courseId);
  if (!course) return null;
  const newSection: Section = { id: Date.now(), title: section.title, description: section.description, lessons: section.lessons || [] };
  course.sections = [...(course.sections || []), newSection];
  writeStorage(courses);
  return newSection;
}

export async function updateSection(courseId: number, sectionId: number, patch: Partial<Section>): Promise<Section | null> {
  const courses = readStorage();
  const course = courses.find(c => c.id === courseId);
  if (!course || !course.sections) return null;
  course.sections = course.sections.map(s => s.id === sectionId ? { ...s, ...patch } : s);
  writeStorage(courses);
  return course.sections.find(s => s.id === sectionId) || null;
}

export async function deleteSection(courseId: number, sectionId: number): Promise<boolean> {
  const courses = readStorage();
  const course = courses.find(c => c.id === courseId);
  if (!course || !course.sections) return false;
  course.sections = course.sections.filter(s => s.id !== sectionId);
  writeStorage(courses);
  return true;
}

export async function reorderSections(courseId: number, fromIndex: number, toIndex: number): Promise<void> {
  const courses = readStorage();
  const course = courses.find(c => c.id === courseId);
  if (!course || !course.sections) return;
  const arr = [...course.sections];
  const [moved] = arr.splice(fromIndex, 1);
  arr.splice(toIndex, 0, moved);
  course.sections = arr;
  writeStorage(courses);
}

// thêm bài học các thứ , chưa hoàn thiện
export async function addLesson(courseId: number, sectionId: number, lesson: Omit<Lesson, 'id'>): Promise<Lesson | null> {
  const courses = readStorage();
  const course = courses.find(c => c.id === courseId);
  if (!course || !course.sections) return null;
  const section = course.sections.find(s => s.id === sectionId);
  if (!section) return null;
  const newLesson: Lesson = { id: Date.now(), ...lesson };
  section.lessons = [...(section.lessons || []), newLesson];
  writeStorage(courses);
  return newLesson;
}

export async function updateLesson(courseId: number, sectionId: number, lessonId: number, patch: Partial<Lesson>): Promise<Lesson | null> {
  const courses = readStorage();
  const course = courses.find(c => c.id === courseId);
  if (!course || !course.sections) return null;
  const section = course.sections.find(s => s.id === sectionId);
  if (!section) return null;
  section.lessons = section.lessons.map(l => l.id === lessonId ? { ...l, ...patch } : l);
  writeStorage(courses);
  return section.lessons.find(l => l.id === lessonId) || null;
}

export async function deleteLesson(courseId: number, sectionId: number, lessonId: number): Promise<boolean> {
  const courses = readStorage();
  const course = courses.find(c => c.id === courseId);
  if (!course || !course.sections) return false;
  const section = course.sections.find(s => s.id === sectionId);
  if (!section) return false;
  section.lessons = section.lessons.filter(l => l.id !== lessonId);
  writeStorage(courses);
  return true;
}

export async function reorderLessons(courseId: number, sectionId: number, fromIndex: number, toIndex: number): Promise<void> {
  const courses = readStorage();
  const course = courses.find(c => c.id === courseId);
  if (!course || !course.sections) return;
  const section = course.sections.find(s => s.id === sectionId);
  if (!section) return;
  const arr = [...section.lessons];
  const [moved] = arr.splice(fromIndex, 1);
  arr.splice(toIndex, 0, moved);
  section.lessons = arr;
  writeStorage(courses);
}