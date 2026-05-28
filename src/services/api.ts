const isCapacitor = typeof (window as any).Capacitor !== 'undefined';

const API_BASE = isCapacitor ? 'https://myjyot.xyz' : '';

async function request<T>(method: string, endpoint: string, body?: any): Promise<T> {
  const url = `${API_BASE}/api${endpoint}`;
  console.log(`[API] ${method} ${url}`, body ? `body keys: ${Object.keys(body).join(', ')}` : '');

  const opts: RequestInit = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body) opts.body = JSON.stringify(body);

  const response = await fetch(url, opts);

  console.log(`[API] response status: ${response.status} ${response.statusText}`);

  if (!response.ok) {
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
  }
};
