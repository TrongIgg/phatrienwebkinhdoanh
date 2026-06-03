import type { ApiTracking } from './api';

const TRACKING_STORAGE_KEY = 'tho-tracking-records';
const TRACKING_SESSION_MS = 30 * 60 * 1000;

type StoredTrackingRecords = {
  savedAt: number;
  records: ApiTracking[];
};

function clearLegacyTrackingRecords() {
  try {
    window.localStorage.removeItem(TRACKING_STORAGE_KEY);
  } catch {
    // Ignore blocked storage; tracking can still fall back to API lookup.
  }
}

export function readLocalTrackingRecords(): ApiTracking[] {
  if (typeof window === 'undefined') return [];
  try {
    clearLegacyTrackingRecords();
    const stored = window.sessionStorage.getItem(TRACKING_STORAGE_KEY);
    if (!stored) return [];

    const parsed = JSON.parse(stored) as StoredTrackingRecords | ApiTracking[];
    const savedAt = Array.isArray(parsed) ? Date.now() : parsed.savedAt;
    const records = Array.isArray(parsed) ? parsed : parsed.records;

    if (!Array.isArray(records) || Date.now() - savedAt > TRACKING_SESSION_MS) {
      window.sessionStorage.removeItem(TRACKING_STORAGE_KEY);
      return [];
    }

    return records;
  } catch {
    return [];
  }
}

export function saveLocalTrackingRecords(records: ApiTracking[]) {
  if (typeof window === 'undefined') return;
  const existing = readLocalTrackingRecords();
  const next = [...records, ...existing.filter((item) => !records.some((record) => record.code === item.code))].slice(0, 12);
  window.sessionStorage.setItem(TRACKING_STORAGE_KEY, JSON.stringify({ savedAt: Date.now(), records: next }));
}

export function findLocalTrackingRecord(code: string) {
  const normalized = code.trim().toUpperCase();
  return readLocalTrackingRecords().find((record) => record.code.toUpperCase() === normalized) ?? null;
}
