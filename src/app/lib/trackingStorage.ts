import type { ApiTracking } from './api';

const TRACKING_STORAGE_KEY = 'tho-tracking-records';

export function readLocalTrackingRecords(): ApiTracking[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = window.localStorage.getItem(TRACKING_STORAGE_KEY);
    return stored ? (JSON.parse(stored) as ApiTracking[]) : [];
  } catch {
    return [];
  }
}

export function saveLocalTrackingRecords(records: ApiTracking[]) {
  if (typeof window === 'undefined') return;
  const existing = readLocalTrackingRecords();
  const next = [...records, ...existing.filter((item) => !records.some((record) => record.code === item.code))].slice(0, 12);
  window.localStorage.setItem(TRACKING_STORAGE_KEY, JSON.stringify(next));
}

export function findLocalTrackingRecord(code: string) {
  const normalized = code.trim().toUpperCase();
  return readLocalTrackingRecords().find((record) => record.code.toUpperCase() === normalized) ?? null;
}
