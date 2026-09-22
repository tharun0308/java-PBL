export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface ApiError {
  status: number;
  error: string;
  message: string;
  path: string;
  timestamp: string;
  fieldErrors?: Record<string, string>;
}

export class ApiException extends Error {
  status: number;
  errorData?: ApiError;

  constructor(message: string, status: number, errorData?: ApiError) {
    super(message);
    this.name = 'ApiException';
    this.status = status;
    this.errorData = errorData;
  }
}

interface RequestOptions extends RequestInit {
  token?: string;
  params?: Record<string, string | number | boolean | undefined>;
}

export async function apiClient<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { token, params, headers = {}, ...rest } = options;

  let url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes('?') ? '&' : '?') + queryString;
    }
  }

  const reqHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(headers as Record<string, string>),
  };

  if (token) {
    reqHeaders['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(url, {
      ...rest,
      headers: reqHeaders,
    });

    if (res.status === 204) {
      return null as unknown as T;
    }

    const json = await res.json().catch(() => null);

    if (!res.ok) {
      const errorMessage = json?.message || `Request failed with status ${res.status}`;
      throw new ApiException(errorMessage, res.status, json);
    }

    // Java backend wraps responses in ApiResponse { success, message, data }
    if (json && typeof json === 'object' && 'data' in json && 'success' in json) {
      return json.data as T;
    }

    return json as T;
  } catch (err: any) {
    if (err instanceof ApiException) {
      throw err;
    }
    throw new ApiException(err.message || 'Network error occurred', 500);
  }
}
