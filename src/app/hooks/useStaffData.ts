import { useCallback } from 'react';
import type { ApiStaffBooking, ApiStaffDashboard, ApiStaffProductJob, ApiStaffTracker } from '../lib/api';

export type StaffData = {
  bookings: ApiStaffBooking[];
  trackers: ApiStaffTracker[];
  productJobs: ApiStaffProductJob[];
  dashboard: ApiStaffDashboard | null;
  loading: boolean;
  error: string | null;
  reload: () => void;
};

const demoBookings: ApiStaffBooking[] = [
  {
    id: 'BK-DEMO-1',
    customer: 'Minh Anh',
    phone: '0912345678',
    email: 'minhanh@demo.vn',
    workshop: 'Nặn gốm cơ bản',
    product: 'Ly men rêu',
    date: '05/06/2026',
    time: '19:00',
    people: 2,
    price: '980.000đ',
    status: 'confirmed',
    payment: 'paid',
    staff: 'Chị Linh',
    note: 'Quận 1 - khách muốn tông men trầm, cần gửi ảnh tiến độ.',
    checkin_status: 'checked_in',
    tracking_code: 'THO-DEMO-001',
    workshop_id: 1,
    chatbot_note: 'Khách thích trải nghiệm nhẹ nhàng, đi cùng bạn thân.',
    chatbot_style: 'Mộc, men rêu, ít họa tiết',
    chatbot_experience: 'first_timer',
    chatbot_purpose: 'Quà sinh nhật',
    chatbot_custom_request: 'Chụp vài ảnh quá trình để gửi lại sau workshop.',
  },
  {
    id: 'BK-DEMO-2',
    customer: 'Linh Nguyễn',
    phone: '0908123456',
    email: 'linhnguyen@demo.vn',
    workshop: 'Workshop cặp đôi',
    product: 'Bình celadon',
    date: '07/06/2026',
    time: '18:30',
    people: 2,
    price: '1.180.000đ',
    status: 'completed',
    payment: 'paid',
    staff: 'Anh Quân',
    note: 'Quận 3 - nhận tại studio.',
    checkin_status: 'checked_in',
    tracking_code: 'THO-DEMO-002',
    workshop_id: 3,
    chatbot_note: 'Muốn làm một cặp đồ gốm để kỷ niệm.',
    chatbot_style: 'Celadon sáng, dáng tối giản',
    chatbot_experience: 'returning',
    chatbot_purpose: 'Kỷ niệm cặp đôi',
    chatbot_custom_request: null,
  },
  {
    id: 'BK-DEMO-3',
    customer: 'Quỳnh Chi',
    phone: '0987654321',
    email: 'quynhchi@demo.vn',
    workshop: 'Tô men thư giãn',
    product: 'DIY kit',
    date: '09/06/2026',
    time: '09:00',
    people: 1,
    price: '490.000đ',
    status: 'pending',
    payment: 'waiting',
    staff: 'Chị Hạnh',
    note: 'Bình Thạnh - cần gọi nhắc trước 1 ngày.',
    checkin_status: 'pending',
    tracking_code: 'THO-DEMO-003',
    workshop_id: 2,
    chatbot_note: 'Khách mới, thích hoạt động chậm và ít áp lực.',
    chatbot_style: 'Màu pastel, hoa nhỏ',
    chatbot_experience: 'first_timer',
    chatbot_purpose: 'Thư giãn cuối tuần',
    chatbot_custom_request: 'Có thể đổi sang ca chiều nếu còn slot.',
  },
];

const demoTrackers: ApiStaffTracker[] = [
  {
    id: 'TR-DEMO-1',
    booking_id: 'BK-DEMO-1',
    customer: 'Minh Anh',
    product: 'Ly men rêu',
    workshop: 'Nặn gốm cơ bản',
    stage: 'glazing',
    qc: 'need_photo',
    updated_at: '04/06/2026 15:20',
    owner: 'Chị Linh',
    kiln: 'Lò A2',
    tracking_code: 'THO-DEMO-001',
  },
  {
    id: 'TR-DEMO-2',
    booking_id: 'BK-DEMO-2',
    customer: 'Linh Nguyễn',
    product: 'Bình celadon',
    workshop: 'Workshop cặp đôi',
    stage: 'ready',
    qc: 'normal',
    updated_at: '04/06/2026 10:45',
    owner: 'Anh Quân',
    kiln: 'Lò B1',
    tracking_code: 'THO-DEMO-002',
  },
  {
    id: 'TR-DEMO-3',
    booking_id: 'BK-DEMO-3',
    customer: 'Quỳnh Chi',
    product: 'DIY kit',
    workshop: 'Tô men thư giãn',
    stage: 'drying',
    qc: 'normal',
    updated_at: '03/06/2026 17:05',
    owner: 'Chị Hạnh',
    kiln: 'Kệ phơi C',
    tracking_code: 'THO-DEMO-003',
  },
];

const demoProductJobs: ApiStaffProductJob[] = [
  {
    id: 'PJ-DEMO-1',
    booking_id: 'BK-DEMO-1',
    customer: 'Minh Anh',
    product: 'Ly men rêu',
    stage: 'glazing',
    status: 'photo_needed',
    image: '2 ảnh',
    owner: 'Chị Linh',
    due: '10/06/2026',
  },
  {
    id: 'PJ-DEMO-2',
    booking_id: 'BK-DEMO-2',
    customer: 'Linh Nguyễn',
    product: 'Bình celadon',
    stage: 'ready',
    status: 'ready',
    image: '4 ảnh',
    owner: 'Anh Quân',
    due: '09/06/2026',
  },
  {
    id: 'PJ-DEMO-3',
    booking_id: 'BK-DEMO-3',
    customer: 'Quỳnh Chi',
    product: 'DIY kit',
    stage: 'drying',
    status: 'in_progress',
    image: '0 ảnh',
    owner: 'Chị Hạnh',
    due: '12/06/2026',
  },
];

const demoDashboard: ApiStaffDashboard = {
  today: 3,
  week: 9,
  customers: 3,
  revenue_million: 2.65,
  pending_checkin: 1,
  checked_in: 2,
  trackers_need_update: 2,
  qc_issues: 1,
  confirmed: 1,
  paid: 2,
  cancelled: 0,
};

export function useStaffData(_enabled: boolean): StaffData {
  const reload = useCallback(() => undefined, []);

  return {
    bookings: demoBookings,
    trackers: demoTrackers,
    productJobs: demoProductJobs,
    dashboard: demoDashboard,
    loading: false,
    error: null,
    reload,
  };
}
