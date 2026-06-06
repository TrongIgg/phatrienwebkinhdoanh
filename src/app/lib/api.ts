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
  tracking_type: 'order' | 'workshop' | 'ceramic' | 'custom';
  status: string;
  title: string;
  message: string;
  manager_name?: string | null;
  participant_count?: number | null;
  checkin_status?: string | null;
  timeline: Array<{ stage: string; label: string; state: string }>;
  custom_request?: {
    shape: string;
    glaze: string;
    features: string[];
    engraving: string;
    brief: string;
    multiplier: number;
    basePrice: number;
    estimatedPrice: number;
    artisanLeadDays: number;
    artisanName: string;
    artisanFeedback: string;
    paymentReady: boolean;
  };
};

export type ApiStaffBooking = {
  id: string;
  customer: string;
  phone: string;
  email: string;
  workshop: string;
  product: string;
  date: string;
  time: string;
  people: number;
  price: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  payment: 'paid' | 'waiting' | 'refund';
  staff: string;
  note: string;
  checkin_status: string;
  tracking_code?: string | null;
  workshop_id?: number | null;
  chatbot_note?: string | null;
  chatbot_style?: string | null;
  chatbot_experience?: string | null;
  chatbot_purpose?: string | null;
  chatbot_custom_request?: string | null;
};

export type ApiChatbotSessionPayload = {
  session_id?: string;
  user_id?: number | null;
  style_preference?: string;
  experience_level?: string;
  purpose?: string;
  custom_request?: string;
  recommended_workshop_id?: number;
  behavior_tags?: string[];
};

export type ApiChatbotSession = {
  session_id: string;
  user_id?: number | null;
  style_preference?: string | null;
  experience_level?: string | null;
  purpose?: string | null;
  custom_request?: string | null;
  recommended_workshop_id?: number | null;
  behavior_tags: string[];
  created_at?: string;
};

export type ApiChatbotRecommendation = {
  session_id: string;
  recommended_workshop_id: number;
  reason: string;
  behavior_tags: string[];
};

export type ApiStaffTracker = {
  id: string;
  booking_id: string;
  customer: string;
  product: string;
  workshop: string;
  stage: string;
  qc: string;
  updated_at: string;
  owner: string;
  kiln: string;
  tracking_code?: string | null;
};

export type ApiStaffProductJob = {
  id: string;
  booking_id: string;
  customer: string;
  product: string;
  stage: string;
  status: string;
  image: string;
  owner: string;
  due: string;
};

export type ApiStaffDashboard = {
  today: number;
  week: number;
  customers: number;
  revenue_million: number;
  pending_checkin: number;
  checked_in: number;
  trackers_need_update: number;
  qc_issues: number;
  confirmed: number;
  paid: number;
  cancelled: number;
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
  createTrackingRecords: (records: ApiTracking[]) =>
    request<ApiTracking[]>('/tracking', { method: 'POST', body: JSON.stringify({ records }) }),
  staffDashboard: () => request<ApiStaffDashboard>('/staff/dashboard'),
  staffBookings: () => request<ApiStaffBooking[]>('/staff/bookings'),
  staffTrackers: () => request<ApiStaffTracker[]>('/staff/trackers'),
  staffProductJobs: () => request<ApiStaffProductJob[]>('/staff/product-jobs'),
  updateStaffTrackerStage: (trackerId: string, payload: { stage: string; qc?: string }) =>
    request<ApiStaffTracker>(`/staff/trackers/${encodeURIComponent(trackerId)}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
  createChatbotSession: (payload: ApiChatbotSessionPayload) =>
    request<ApiChatbotSession>('/chatbot/session', { method: 'POST', body: JSON.stringify(payload) }),
  updateChatbotSession: (sessionId: string, payload: ApiChatbotSessionPayload) =>
    request<ApiChatbotSession>(`/chatbot/session/${encodeURIComponent(sessionId)}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
  chatbotRecommendation: (sessionId: string) =>
    request<ApiChatbotRecommendation>(`/chatbot/recommend?session_id=${encodeURIComponent(sessionId)}`),
  staffChatbotNotes: (bookingId: string) =>
    request<ApiChatbotSession | null>(`/staff/chatbot-notes/${encodeURIComponent(bookingId)}`),
};
