import { getToken, clearToken } from './auth';

const isCapacitor = typeof (window as any).Capacitor !== 'undefined';

const API_BASE = isCapacitor ? 'https://myjyot.xyz' : '';

const TIMEOUT_MS = 55000;

async function request<T>(method: string, endpoint: string, body?: any): Promise<T> {
  const url = `${API_BASE}/api${endpoint}`;
  console.log(`[API] ${method} ${url}`, body ? `body keys: ${Object.keys(body).join(', ')}` : '');

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };

  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const opts: RequestInit = {
    method,
    headers,
    signal: controller.signal,
  };
  if (body) opts.body = JSON.stringify(body);

  try {
    const response = await fetch(url, opts);
    clearTimeout(timeoutId);

    console.log(`[API] response status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      if (response.status === 401) {
        clearToken();
        const currentPath = window.location.pathname;
        if (currentPath !== '/' && !currentPath.includes('/login') && !currentPath.includes('/onboarding') && !currentPath.includes('/privacy-policy') && !currentPath.includes('/admin')) {
          window.location.href = '/';
        }
      }

      let errorData: any = {};
      try {
        errorData = await response.json();
        console.log(`[API] error body:`, errorData);
      } catch {
        const text = await response.text().catch(() => '');
        console.log(`[API] non-json error body (first 200 chars):`, text.slice(0, 200));
        errorData = { error: text || `HTTP error ${response.status}` };
      }
      throw new Error(errorData.error || `HTTP error ${response.status}`);
    }

    const data: T = await response.json();
    console.log(`[API] success, response type:`, typeof data);
    return data;
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('Request timed out. The server took too long to respond.');
    }
    throw err;
  }
}

export const api = {
  async get<T>(endpoint: string): Promise<T> {
    return request<T>('GET', endpoint);
  },

  async post<T>(endpoint: string, body: any): Promise<T> {
    return request<T>('POST', endpoint, body);
  },

  async put<T>(endpoint: string, body: any): Promise<T> {
    return request<T>('PUT', endpoint, body);
  },

  async del<T = any>(endpoint: string): Promise<T> {
    return request<T>('DELETE', endpoint);
  }
};
