import type { ApiTracking } from './api';

const PERSISTENT_TRACKING_KEY = 'tho-persistent-tracking-records';

type StoredTrackingRecords = {
  savedAt: number;
  records: ApiTracking[];
};

export function readLocalTrackingRecords(): ApiTracking[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = window.localStorage.getItem(PERSISTENT_TRACKING_KEY);
    if (!stored) return [];

    const parsed = JSON.parse(stored) as StoredTrackingRecords | ApiTracking[];
    const records = Array.isArray(parsed) ? parsed : parsed.records;

    if (!Array.isArray(records)) {
      return [];
    }

    return records;
  } catch {
    return [];
  }
}

export function saveLocalTrackingRecords(records: ApiTracking[]) {
  if (typeof window === 'undefined') return;
  try {
    const existing = readLocalTrackingRecords();
    const next = [...records, ...existing.filter((item) => !records.some((record) => record.code === item.code))].slice(0, 100);
    window.localStorage.setItem(PERSISTENT_TRACKING_KEY, JSON.stringify({ savedAt: Date.now(), records: next }));
    // Dispatch custom event to notify components
    window.dispatchEvent(new Event('tho-tracking-records-changed'));
  } catch (err) {
    console.error('Failed to save tracking records locally:', err);
  }
}

export function findLocalTrackingRecord(code: string) {
  const normalized = code.trim().toUpperCase();
  return readLocalTrackingRecords().find((record) => record.code.toUpperCase() === normalized) ?? null;
}

export function cancelLocalTrackingRecord(code: string): ApiTracking | null {
  if (typeof window === 'undefined') return null;
  try {
    const records = readLocalTrackingRecords();
    const index = records.findIndex((r) => r.code.toUpperCase() === code.trim().toUpperCase());
    if (index === -1) return null;

    const target = records[index];
    const updated: ApiTracking = {
      ...target,
      status: 'cancelled',
      message: 'Đơn hàng/Vé đã được hủy bởi khách hàng. Số tiền hoàn đang được xử lý theo chính sách.',
      timeline: target.timeline.map((step) => {
        if (step.stage === 'paid' || step.stage === 'booking_paid') {
          return { ...step, state: 'done' };
        }
        return { ...step, state: 'waiting' };
      }),
    };

    const hasCancelledStep = updated.timeline.some((s) => s.stage === 'cancelled');
    if (!hasCancelledStep) {
      updated.timeline.push({ stage: 'cancelled', label: 'Đã hủy đơn', state: 'done' });
    } else {
      updated.timeline = updated.timeline.map((s) => s.stage === 'cancelled' ? { ...s, state: 'done' } : s);
    }

    records[index] = updated;
    window.localStorage.setItem(PERSISTENT_TRACKING_KEY, JSON.stringify({ savedAt: Date.now(), records }));
    window.dispatchEvent(new Event('tho-tracking-records-changed'));
    return updated;
  } catch {
    return null;
  }
}
