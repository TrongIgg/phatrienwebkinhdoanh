export type SocialProvider = 'google' | 'facebook' | 'zalo';

export type CustomerSession = {
  display_name: string;
  email: string;
  avatar_url: string;
  phone: string;
  provider: SocialProvider;
  provider_user_id: string;
};

export type ReviewNotification = {
  id: string;
  customer: string;
  title: string;
  rating: number;
  targetType: 'product' | 'workshop';
  createdAt: string;
  status: 'new' | 'low_rating' | 'unanswered';
};

export type TrackingMedia = {
  id: string;
  tracking_code: string;
  booking_code?: string;
  media_type: 'image' | 'video';
  stage: string;
  title: string;
  description: string;
  url: string;
  uploaded_by: string;
  created_at: string;
  is_new?: boolean;
};

export type SavedMoment = TrackingMedia & {
  saved_at: string;
};

export type GiftOrder = {
  id: string;
  product_id: string;
  product_name: string;
  occasion: string;
  wrapping: string;
  card_message: string;
  recipient_name: string;
  recipient_phone: string;
  recipient_address: string;
  created_at: string;
};

const CUSTOMER_SESSION_KEY = 'tho-customer-session';
const REVIEW_NOTIFICATIONS_KEY = 'tho-review-notifications';
const TRACKING_MEDIA_KEY = 'tho-tracking-media';
const SAVED_MOMENTS_KEY = 'tho-saved-moments';
const GIFT_ORDERS_KEY = 'tho-gift-orders';
export const CUSTOMER_SESSION_EVENT = 'tho-customer-session-change';

function safeRead<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const stored = window.localStorage.getItem(key);
    return stored ? (JSON.parse(stored) as T) : fallback;
  } catch {
    return fallback;
  }
}

function safeWrite<T>(key: string, value: T) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

function avatarDataUrl(label: string, background: string) {
  const initials = label
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96"><rect width="96" height="96" rx="48" fill="${background}"/><text x="48" y="56" text-anchor="middle" font-size="30" font-family="Arial, sans-serif" font-weight="700" fill="#fff">${initials}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function createMockCustomerSession(provider: SocialProvider): CustomerSession {
  const presets: Record<SocialProvider, Omit<CustomerSession, 'provider' | 'provider_user_id'>> = {
    google: {
      display_name: 'Minh Anh',
      email: 'minhanh.demo@gmail.com',
      phone: '0912345678',
      avatar_url: avatarDataUrl('Minh Anh', '#C96B37'),
    },
    facebook: {
      display_name: 'Linh Nguyen',
      email: 'linh.nguyen.demo@facebook.com',
      phone: '0908123456',
      avatar_url: avatarDataUrl('Linh Nguyen', '#456582'),
    },
    zalo: {
      display_name: 'Quynh Chi',
      email: 'quynhchi.demo@zalo.vn',
      phone: '0987654321',
      avatar_url: avatarDataUrl('Quynh Chi', '#716942'),
    },
  };

  return {
    ...presets[provider],
    provider,
    provider_user_id: `${provider}-${Date.now().toString().slice(-6)}`,
  };
}

export function readCustomerSession(): CustomerSession | null {
  return safeRead<CustomerSession | null>(CUSTOMER_SESSION_KEY, null);
}

export function saveCustomerSession(session: CustomerSession | null) {
  if (typeof window === 'undefined') return;
  if (session) {
    safeWrite(CUSTOMER_SESSION_KEY, session);
  } else {
    window.localStorage.removeItem(CUSTOMER_SESSION_KEY);
  }
  window.dispatchEvent(new Event(CUSTOMER_SESSION_EVENT));
}

export function readReviewNotifications() {
  return safeRead<ReviewNotification[]>(REVIEW_NOTIFICATIONS_KEY, []);
}

export function saveReviewNotification(notification: ReviewNotification) {
  const next = [
    notification,
    ...readReviewNotifications().filter((item) => item.id !== notification.id),
  ].slice(0, 20);
  safeWrite(REVIEW_NOTIFICATIONS_KEY, next);
}

export function readTrackingMedia() {
  return safeRead<TrackingMedia[]>(TRACKING_MEDIA_KEY, []);
}

export function upsertTrackingMedia(media: TrackingMedia) {
  const next = [
    media,
    ...readTrackingMedia().filter((item) => item.id !== media.id),
  ].slice(0, 30);
  safeWrite(TRACKING_MEDIA_KEY, next);
}

export function readSavedMoments() {
  return safeRead<SavedMoment[]>(SAVED_MOMENTS_KEY, []);
}

export function saveMoment(media: TrackingMedia) {
  const saved: SavedMoment = { ...media, saved_at: new Date().toISOString() };
  const next = [
    saved,
    ...readSavedMoments().filter((item) => item.id !== media.id),
  ].slice(0, 12);
  safeWrite(SAVED_MOMENTS_KEY, next);
}

export function readGiftOrders() {
  return safeRead<GiftOrder[]>(GIFT_ORDERS_KEY, []);
}

export function saveGiftOrder(order: GiftOrder) {
  const next = [
    order,
    ...readGiftOrders().filter((item) => item.id !== order.id),
  ].slice(0, 20);
  safeWrite(GIFT_ORDERS_KEY, next);
}
