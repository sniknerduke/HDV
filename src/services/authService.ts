const API_BASE = import.meta.env.VITE_USER_SERVICE_URL ?? "http://localhost:9090";

interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  role: string;
}

interface LoginPayload {
  email: string;
  password: string;
}

interface UserResponse {
  id: number;
  email: string;
  username: string;
  role?: string;
}

interface DetailedUserResponse extends UserResponse {
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  bio?: string;
  avatar?: string;
  specialization?: string;
  education?: string;
  experience?: string;
}

export interface UpdateProfilePayload {
  username?: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  bio?: string;
  avatar?: string;
  specialization?: string;
  education?: string;
  experience?: string;
}

interface AuthResponse {
  token: string;
  user: UserResponse;
}

const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const payload = await response.json().catch(() => ({}));
      const detail = typeof payload?.message === "string" && payload.message.trim().length > 0
        ? payload.message
        : undefined;
      throw new Error(detail ?? `HTTP ${response.status}`);
    }
    throw new Error(`HTTP ${response.status}`);
  }
  if (response.status === 204) {
    return undefined as T;
  }
  return response.json() as Promise<T>;
};

export const registerUser = async (payload: RegisterPayload) => {
  const response = await fetch(`${API_BASE}/api/users/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return handleResponse<UserResponse>(response);
};

export const verifyOtp = async (email: string, code: string) => {
  const params = new URLSearchParams({ email, code });
  const response = await fetch(`${API_BASE}/api/users/verify-otp?${params.toString()}`, {
    method: "POST",
  });
  return handleResponse<AuthResponse>(response);
};

export const loginUser = async (payload: LoginPayload) => {
  const response = await fetch(`${API_BASE}/api/users/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return handleResponse<AuthResponse>(response);
};

export const getUserProfile = async (token: string) => {
  const response = await fetch(`${API_BASE}/api/users/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return handleResponse<DetailedUserResponse>(response);
};

export const updateUserProfile = async (token: string, payload: UpdateProfilePayload) => {
  const response = await fetch(`${API_BASE}/api/users/me/profile`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  return handleResponse<DetailedUserResponse>(response);
};
