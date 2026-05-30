export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000/api/v1';

export type ApiProduct = {
  id: number;
  sku: string;
  name: string;
  category: string;
  collection: string;
  price_vnd: number;
  image_url: string | null;
  stock_qty: number;
  rating: number;
  review_count: number;
};

export type ApiWorkshop = {
  id: number;
  name: string;
  full_date: string;
  start_date?: string | null;
  time: string;
  instructor: string;
  price_vnd: number;
  package: string;
  audience: string;
  workshop_type: string;
  available_slots: number;
  total_slots: number;
};

export type ApiReview = {
  review_id: number;
  target_type: 'product' | 'workshop';
  target_id: number | null;
  name: string;
  title: string;
  comment: string;
  rating: number;
  created_at?: string;
};

export type ApiTracking = {
  code: string;
  tracking_type: 'order' | 'workshop' | 'ceramic';
  status: string;
  title: string;
  message: string;
  manager_name?: string | null;
  participant_count?: number | null;
  checkin_status?: string | null;
  timeline: Array<{ stage: string; label: string; state: string }>;
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
    ...init,
  });

  if (!response.ok) {
    throw new Error(`API ${response.status}: ${path}`);
  }

  return response.json() as Promise<T>;
}

export const api = {
  products: () => request<ApiProduct[]>('/products'),
  product: (id: string | number) => request<ApiProduct>(`/products/${id}`),
  workshops: () => request<ApiWorkshop[]>('/workshops'),
  workshop: (id: string | number) => request<ApiWorkshop>(`/workshops/${id}`),
  reviews: () => request<ApiReview[]>('/reviews'),
  createReview: (payload: { name: string; title: string; comment: string; rating: number }) =>
    request<ApiReview>('/reviews', { method: 'POST', body: JSON.stringify(payload) }),
  tracking: (code: string) => request<ApiTracking>(`/tracking/${encodeURIComponent(code)}`),
};
