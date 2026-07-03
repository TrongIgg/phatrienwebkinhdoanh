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

export const MOCK_COMPLETED_RECORDS: Record<string, ApiTracking> = {
  'ORD-DELIVERED': {
    code: 'ORD-DELIVERED',
    tracking_type: 'order',
    status: 'delivered',
    title: 'Đơn hàng bộ ấm chén gốm mộc THỔ',
    message: 'Đơn hàng đã được giao thành công đến bạn vào ngày 28/06/2026. Cảm ơn bạn đã lựa chọn THỔ!',
    customer_name: 'Nguyễn Thu Hà',
    manager_name: 'Trần Minh Hoàng',
    timeline: [
      { stage: 'paid', label: 'Đã thanh toán', state: 'done' },
      { stage: 'packing', label: 'Chờ đóng gói', state: 'done' },
      { stage: 'shipping', label: 'Đang vận chuyển', state: 'done' },
      { stage: 'delivered', label: 'Đã giao thành công', state: 'done' }
    ],
    items: [
      { id: 'item-d1', name: 'Bộ ấm chén gốm mộc sơn trà', type: 'product', price: 850000, quantity: 1, image: '' }
    ]
  },
  'WS-COMPLETED': {
    code: 'WS-COMPLETED',
    tracking_type: 'workshop',
    status: 'completed',
    title: 'Vé Workshop Nặn Gốm Căn Bản',
    message: 'Bạn đã hoàn tất tham gia lớp học làm gốm ngày 25/06/2026. Hy vọng bạn đã có khoảng thời gian ý nghĩa chạm đất!',
    customer_name: 'Trần Minh Tuấn',
    manager_name: 'Nguyễn Thanh Linh',
    participant_count: 2,
    checkin_status: 'checked_in',
    timeline: [
      { stage: 'paid', label: 'Đã thanh toán', state: 'done' },
      { stage: 'qr_sent', label: 'Đã gửi mã check-in', state: 'done' },
      { stage: 'checked_in', label: 'Đã check-in & hoàn thành', state: 'done' }
    ],
    items: [
      { id: 'item-d2', name: 'Vé Workshop Nặn Gốm Căn Bản', type: 'workshop', date: '25/06/2026', time: '14:00', tickets: 2, price: 450000, image: '' }
    ]
  },
  'CER-READY': {
    code: 'CER-READY',
    tracking_type: 'ceramic',
    status: 'ready',
    title: 'Cốc gốm men hỏa biến & Bình hoa nhỏ',
    message: 'Thành phẩm gốm của bạn đã hoàn thành tráng men và nung xong. Bạn có thể ghé Studio để nhận hoặc đăng ký giao hàng tận nhà.',
    customer_name: 'Phạm Quốc Anh',
    manager_name: 'Phạm Quốc Anh',
    timeline: [
      { stage: 'forming', label: 'Tạo hình', state: 'done' },
      { stage: 'drying', label: 'Phơi khô', state: 'done' },
      { stage: 'bisque_firing', label: 'Nung sơ', state: 'done' },
      { stage: 'glazing', label: 'Tráng men', state: 'done' },
      { stage: 'final_firing', label: 'Nung hoàn thiện', state: 'done' },
      { stage: 'ready', label: 'Sẵn sàng nhận', state: 'done' }
    ],
    items: []
  },
  'WS-67157855': {
    code: 'WS-67157855',
    tracking_type: 'workshop',
    status: 'completed',
    title: 'Vé Workshop Xoay Gốm Trải Nghiệm',
    message: 'Bạn đã hoàn tất tham gia lớp học làm gốm ngày 28/06/2026. Cảm ơn bạn đã ghé thăm THỔ Studio!',
    customer_name: 'Anh Quân',
    manager_name: 'Anh Quân',
    participant_count: 1,
    checkin_status: 'checked_in',
    timeline: [
      { stage: 'paid', label: 'Đã thanh toán', state: 'done' },
      { stage: 'qr_sent', label: 'Đã gửi mã check-in', state: 'done' },
      { stage: 'checked_in', label: 'Đã check-in & hoàn thành', state: 'done' }
    ],
    items: [
      { id: 'item-ws1', name: 'Vé Workshop Xoay Gốm Trải Nghiệm', type: 'workshop', date: '28/06/2026', time: '09:00', tickets: 1, price: 450000, image: '' }
    ]
  },
  'ORD-66470040': {
    code: 'ORD-66470040',
    tracking_type: 'order',
    status: 'delivered',
    title: 'Đơn hàng Ly gốm mộc & Đĩa lót gốm',
    message: 'Đơn hàng đã giao thành công vào ngày 27/06/2026.',
    customer_name: 'Chị Linh',
    manager_name: 'Chị Linh',
    timeline: [
      { stage: 'paid', label: 'Đã thanh toán', state: 'done' },
      { stage: 'packing', label: 'Chờ đóng gói', state: 'done' },
      { stage: 'shipping', label: 'Đang vận chuyển', state: 'done' },
      { stage: 'delivered', label: 'Đã giao thành công', state: 'done' }
    ],
    items: [
      { id: 'item-p1', name: 'Ly gốm mộc THỔ', type: 'product', price: 180000, quantity: 1, image: '' }
    ]
  },
  'ORD-42710995': {
    code: 'ORD-42710995',
    tracking_type: 'order',
    status: 'delivered',
    title: 'Đơn hàng Chậu cây cảnh mini',
    message: 'Đơn hàng đã giao thành công vào ngày 26/06/2026.',
    customer_name: 'Chị Linh',
    manager_name: 'Chị Linh',
    timeline: [
      { stage: 'paid', label: 'Đã thanh toán', state: 'done' },
      { stage: 'packing', label: 'Chờ đóng gói', state: 'done' },
      { stage: 'shipping', label: 'Đang vận chuyển', state: 'done' },
      { stage: 'delivered', label: 'Đã giao thành công', state: 'done' }
    ],
    items: [
      { id: 'item-p2', name: 'Chậu cây cảnh mini gốm nung', type: 'product', price: 120000, quantity: 1, image: '' }
    ]
  }
};

export function findLocalTrackingRecord(code: string): ApiTracking | null {
  const normalized = code.trim().toUpperCase();
  if (normalized in MOCK_COMPLETED_RECORDS) {
    return MOCK_COMPLETED_RECORDS[normalized];
  }
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
