const API_BASE = import.meta.env.VITE_USER_SERVICE_URL ?? 'http://localhost:9090';

export interface UserCourseDto {
  userId: number;
  courseId: number;
  orderId?: string;
  status: string;
}

export interface EnrolledCourse {
  id: number;
  courseId: number;
  title: string;
  description?: string;
  instructor?: string;
  image?: string;
  progress?: number;
  status: string;
}

/**
 * Get all courses that current user is enrolled in
 */
export async function getMyCourses(): Promise<UserCourseDto[]> {
  const token = localStorage.getItem('auth_token');
  const userStr = localStorage.getItem('auth_user');
  
  if (!token || !userStr) {
    throw new Error('User not authenticated');
  }
  
  const user = JSON.parse(userStr);
  const userId = user.id;
  
  const response = await fetch(`${API_BASE}/api/user-courses/my-courses`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'X-User-Id': String(userId),
    },
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Failed to fetch enrolled courses');
  }
  
  return response.json();
}

/**
 * Check if user has access to a specific course
 */
export async function checkCourseAccess(courseId: number): Promise<UserCourseDto | null> {
  const token = localStorage.getItem('auth_token');
  const userStr = localStorage.getItem('auth_user');
  
  if (!token || !userStr) {
    return null;
  }
  
  const user = JSON.parse(userStr);
  const userId = user.id;
  
  const response = await fetch(`${API_BASE}/api/user-courses/check?userId=${userId}&courseId=${courseId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });
  
  if (response.status === 404) {
    return null;
  }
  
  if (!response.ok) {
    throw new Error('Failed to check course access');
  }
  
  return response.json();
}
