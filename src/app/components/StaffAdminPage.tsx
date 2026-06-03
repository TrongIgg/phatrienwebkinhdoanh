import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { Link, NavLink, Navigate, useLocation, useNavigate } from 'react-router';
import {
  AlertTriangle,
  Bell,
  CalendarDays,
  Camera,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Edit3,
  Gift,
  ImageUp,
  LogOut,
  Mail,
  MapPin,
  MoreHorizontal,
  Package,
  PackageCheck,
  Phone,
  Plus,
  QrCode,
  RefreshCw,
  Search,
  Send,
  ShieldCheck,
  TrendingUp,
  UploadCloud,
  UserCheck,
  UserRoundCheck,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { useStaffData } from '../hooks/useStaffData';
import type { ApiStaffBooking, ApiStaffDashboard, ApiStaffProductJob, ApiStaffTracker } from '../lib/api';
import {
  readReviewNotifications,
  readGiftOrders,
  readTrackingMedia,
  upsertTrackingMedia,
  type TrackingMedia,
} from '../lib/customerExperience';
import { productImages, ProgressRule, workshopImages } from './DesignPrimitives';

type StaffPage = 'dashboard' | 'booking' | 'product' | 'tracking';
type StaffRole = 'staff' | 'admin';
type BookingStatus = ApiStaffBooking['status'];
type PaymentStatus = ApiStaffBooking['payment'];
type TrackerStage = 'created' | 'drying' | 'bisque' | 'glazing' | 'final' | 'ready' | 'done';
type QcStatus = 'normal' | 'need_photo' | 'glaze_error' | 'cracked';
type ProductStatus = 'waiting' | 'in_progress' | 'photo_needed' | 'ready' | 'delivered';

type StaffSession = {
  role: StaffRole;
  name: string;
};

type Booking = ApiStaffBooking;
type Tracker = ApiStaffTracker & { stage: TrackerStage; qc: QcStatus };
type ProductJob = ApiStaffProductJob & { status: ProductStatus; stage: TrackerStage };

const SESSION_KEY = 'tho_staff_session';

function mapTracker(row: ApiStaffTracker): Tracker {
  return { ...row, stage: row.stage as TrackerStage, qc: row.qc as QcStatus };
}

function mapProductJob(row: ApiStaffProductJob): ProductJob {
  return { ...row, stage: row.stage as TrackerStage, status: row.status as ProductStatus };
}

const statusLabel: Record<BookingStatus, string> = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  completed: 'Hoàn thành',
  cancelled: 'Đã hủy',
};

const statusClass: Record<BookingStatus, string> = {
  pending: 'bg-[#716942] text-white',
  confirmed: 'bg-[#3F3F35] text-white',
  completed: 'bg-[#C0AC8B] text-[#361F17]',
  cancelled: 'bg-[#361F17] text-white',
};

const paymentLabel: Record<PaymentStatus, string> = {
  paid: 'Đã thanh toán',
  waiting: 'Chờ thanh toán',
  refund: 'Hoàn tiền',
};

const paymentClass: Record<PaymentStatus, string> = {
  paid: 'bg-[#716942] text-white',
  waiting: 'bg-[#C0AC8B] text-[#361F17]',
  refund: 'bg-[#3F3F35] text-white',
};

const stageLabel: Record<TrackerStage, string> = {
  created: 'Đã tạo',
  drying: 'Phơi khô',
  bisque: 'Nung sơ',
  glazing: 'Tráng men',
  final: 'Nung hoàn thiện',
  ready: 'Sẵn sàng nhận',
  done: 'Hoàn tất',
};

const stageClass: Record<TrackerStage, string> = {
  created: 'bg-[#F0F3E3] text-[#59612E]',
  drying: 'bg-[#FFF3D7] text-[#A76020]',
  bisque: 'bg-[#F9E5D5] text-[#A76020]',
  glazing: 'bg-[#E6EFF8] text-[#456582]',
  final: 'bg-[#F1E9F5] text-[#6A4D79]',
  ready: 'bg-[#F0E4FF] text-[#704F9A]',
  done: 'bg-[#EFF4D8] text-[#59612E]',
};

const qcLabel: Record<QcStatus, string> = {
  normal: 'Bình thường',
  need_photo: 'Cần ảnh',
  glaze_error: 'Lỗi men',
  cracked: 'Nứt',
};

const qcClass: Record<QcStatus, string> = {
  normal: 'bg-[#F0F3E3] text-[#59612E]',
  need_photo: 'bg-[#FFF3D7] text-[#A76020]',
  glaze_error: 'bg-[#FFE3E1] text-[#A33A2F]',
  cracked: 'bg-[#FFE3E1] text-[#A33A2F]',
};

const productStatusLabel: Record<ProductStatus, string> = {
  waiting: 'Chờ xử lý',
  in_progress: 'Đang làm',
  photo_needed: 'Cần upload ảnh',
  ready: 'Sẵn sàng giao',
  delivered: 'Đã bàn giao',
};

const productStatusClass: Record<ProductStatus, string> = {
  waiting: 'bg-[#F5F1ED] text-[#716942]',
  in_progress: 'bg-[#FFF3D7] text-[#A76020]',
  photo_needed: 'bg-[#FFE3E1] text-[#A33A2F]',
  ready: 'bg-[#F0E4FF] text-[#704F9A]',
  delivered: 'bg-[#EFF4D8] text-[#59612E]',
};

export function StaffAdminPage() {
  const location = useLocation();
  const [session, setSession] = useState<StaffSession | null>(() => readSession());
  const staffData = useStaffData(Boolean(session));
  const bookings = staffData.bookings;
  const trackers = staffData.trackers.map(mapTracker);
  const productJobs = staffData.productJobs.map(mapProductJob);
  const page = getStaffPage(location.pathname);
  const base = location.pathname.startsWith('/admin') ? '/admin' : '/staff';
  const isLoginRoute = location.pathname.endsWith('/login');

  useEffect(() => {
    setSession(readSession());
  }, [location.pathname]);

  if (!session) {
    return <StaffLoginPage defaultRole={base === '/admin' ? 'admin' : 'staff'} onLogin={setSession} />;
  }

  if (isLoginRoute) {
    return <Navigate to={session.role === 'admin' ? '/admin/dashboard' : '/staff/tracking'} replace />;
  }

  if (location.pathname === '/staff' || location.pathname === '/admin') {
    return <Navigate to={session.role === 'admin' ? '/admin/dashboard' : '/staff/tracking'} replace />;
  }

  if (session.role === 'staff' && page !== 'tracking') {
    return <Navigate to="/staff/tracking" replace />;
  }

  return (
    <div className="min-h-screen bg-[#F5F1ED] text-[#3F3F35]">
      <StaffHeader activePage={page} session={session} base={session.role === 'admin' ? '/admin' : '/staff'} onLogout={() => setSession(null)} />
      <main className="mx-auto max-w-[1440px] px-5 py-9 lg:px-11">
        <StaffDataBanner loading={staffData.loading} error={staffData.error} onRetry={staffData.reload} />
        {page === 'dashboard' && <DashboardPage bookings={bookings} productJobs={productJobs} dashboard={staffData.dashboard} />}
        {page === 'booking' && <BookingPage bookings={bookings} dashboard={staffData.dashboard} />}
        {page === 'product' && <ProductManagementPage role={session.role} productJobs={productJobs} />}
        {page === 'tracking' && <TrackingManagementPage role={session.role} bookings={bookings} trackers={trackers} dashboard={staffData.dashboard} />}
      </main>
    </div>
  );
}

function StaffDataBanner({ loading, error, onRetry }: { loading: boolean; error: string | null; onRetry: () => void }) {
  if (!loading && !error) return null;

  return (
    <div className={`mb-6 rounded-lg px-5 py-4 text-sm font-semibold ${error ? 'bg-[#FFE3E1] text-[#A33A2F]' : 'bg-white text-[#716942]'}`}>
      {loading ? 'Đang đồng bộ dữ liệu từ cơ sở dữ liệu...' : error}
      {error && (
        <button type="button" onClick={onRetry} className="ml-4 underline">
          Thử lại
        </button>
      )}
    </div>
  );
}

function readSession(): StaffSession | null {
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StaffSession;
    return parsed.role === 'admin' || parsed.role === 'staff' ? parsed : null;
  } catch {
    return null;
  }
}

function getStaffPage(pathname: string): StaffPage {
  if (pathname.includes('/booking')) return 'booking';
  if (pathname.includes('/product')) return 'product';
  if (pathname.includes('/tracking')) return 'tracking';
  return 'dashboard';
}

function StaffLoginPage({ defaultRole, onLogin }: { defaultRole: StaffRole; onLogin: (session: StaffSession) => void }) {
  const navigate = useNavigate();
  const [role, setRole] = useState<StaffRole>(defaultRole);
  const [name, setName] = useState(defaultRole === 'admin' ? 'admin@tho.vn' : 'staff@tho.vn');
  const [password, setPassword] = useState('123456');

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const session = { role, name: name.trim() || (role === 'admin' ? 'Admin' : 'Staff') };
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    onLogin(session);
    navigate(role === 'admin' ? '/admin/dashboard' : '/staff/tracking', { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#F5F1ED] text-[#3F3F35]">
      <header className="mx-auto flex max-w-[1440px] items-center justify-between px-5 py-6 lg:px-11">
        <Link to="/" className="text-5xl font-light leading-none text-[#361F17]">THỔ</Link>
        <span className="rounded-full border border-[#361F17] px-5 py-2 text-sm font-bold uppercase tracking-[0.18em] text-[#361F17]">
          Staff private portal
        </span>
      </header>
      <ProgressRule />
      <main className="mx-auto grid max-w-[1180px] gap-8 px-5 py-14 lg:grid-cols-[1fr_420px] lg:px-11">
        <section className="flex flex-col justify-center">
          <p className="mb-4 text-sm font-bold uppercase tracking-[0.22em] text-[#716942]">Không xuất hiện trên web customer</p>
          <h1 className="max-w-[820px] text-[clamp(2.8rem,5vw,5rem)] font-bold leading-none">
            Back-office cho staff và admin
          </h1>
          <p className="mt-5 max-w-[720px] text-2xl leading-snug text-[#3F3F35]/80">
            Cổng này chỉ mở qua route hoặc domain riêng như <span className="font-bold">/staff</span> hoặc <span className="font-bold">/admin</span>.
            Staff xử lý tracker và upload ảnh sản phẩm, admin quản lý toàn bộ dashboard, booking, product và tracking.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <RoleCard active={role === 'staff'} title="Staff" body="Check-in khách, cập nhật tracker, upload ảnh và gửi thông báo." onClick={() => setRole('staff')} />
            <RoleCard active={role === 'admin'} title="Admin" body="Quản lý toàn bộ booking, product, tracker và luồng vận hành." onClick={() => setRole('admin')} />
          </div>
        </section>
        <form onSubmit={submit} className="rounded-lg bg-white p-6 shadow-[0_18px_45px_rgba(54,31,23,0.08)]">
          <div className="mb-6 flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#361F17] text-white">
              <ShieldCheck className="h-6 w-6" />
            </span>
            <div>
              <h2 className="text-3xl font-bold">Đăng nhập</h2>
              <p className="text-[#716942]">Demo chấp nhận tài khoản nội bộ mẫu.</p>
            </div>
          </div>
          <label className="mb-4 block">
            <span className="mb-2 block font-bold">Role</span>
            <select value={role} onChange={(event) => setRole(event.target.value as StaffRole)} className="h-12 w-full rounded-lg border border-[#3F3F35]/25 px-4 outline-none">
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
            </select>
          </label>
          <label className="mb-4 block">
            <span className="mb-2 block font-bold">Email / Username</span>
            <input value={name} onChange={(event) => setName(event.target.value)} className="h-12 w-full rounded-lg border border-[#3F3F35]/25 px-4 outline-none" />
          </label>
          <label className="mb-6 block">
            <span className="mb-2 block font-bold">Password</span>
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="h-12 w-full rounded-lg border border-[#3F3F35]/25 px-4 outline-none" />
          </label>
          <button className="h-12 w-full rounded-lg bg-[#361F17] font-bold text-white" disabled={!password.trim()}>
            Vào {role === 'admin' ? 'Admin workspace' : 'Staff tracker'}
          </button>
        </form>
      </main>
    </div>
  );
}

function RoleCard({ active, title, body, onClick }: { active: boolean; title: string; body: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`rounded-lg border p-5 text-left transition ${active ? 'border-[#361F17] bg-white shadow-[0_12px_30px_rgba(54,31,23,0.08)]' : 'border-[#3F3F35]/15 bg-white/55'}`}>
      <p className="text-2xl font-bold">{title}</p>
      <p className="mt-2 text-[#3F3F35]/75">{body}</p>
    </button>
  );
}

function StaffHeader({ activePage, session, base, onLogout }: { activePage: StaffPage; session: StaffSession; base: string; onLogout: () => void }) {
  const links = session.role === 'admin'
    ? [
        { label: 'Dashboard', to: `${base}/dashboard`, page: 'dashboard' as StaffPage },
        { label: 'Booking', to: `${base}/booking`, page: 'booking' as StaffPage },
        { label: 'Product', to: `${base}/product`, page: 'product' as StaffPage },
        { label: 'Tracker', to: `${base}/tracking`, page: 'tracking' as StaffPage },
      ]
    : [{ label: 'Tracker', to: `${base}/tracking`, page: 'tracking' as StaffPage }];

  const logout = () => {
    window.localStorage.removeItem(SESSION_KEY);
    onLogout();
  };

  return (
    <header className="sticky top-0 z-40 bg-[#F5F1ED]/95 backdrop-blur">
      <div className="mx-auto flex max-w-[1440px] flex-wrap items-center gap-4 px-5 py-4 lg:px-11">
        <Link to={session.role === 'admin' ? '/admin/dashboard' : '/staff/tracking'} className="mr-3 text-5xl font-light leading-none text-[#361F17]" aria-label="THỔ staff workspace">
          THỔ
        </Link>
        <div className="mr-auto">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#716942]">Private workspace</p>
          <p className="font-bold text-[#361F17]">{session.role === 'admin' ? 'Admin quản lý toàn bộ' : 'Staff tracking & upload ảnh'}</p>
        </div>
        <nav className="flex gap-3 overflow-x-auto">
          {links.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={`inline-flex h-11 min-w-[124px] items-center justify-center rounded-full border px-5 text-base font-bold ${
                activePage === item.page
                  ? 'border-[#361F17] bg-[#361F17] text-white'
                  : 'border-[#361F17] bg-transparent text-[#361F17]'
              }`}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <span className="rounded-full bg-white px-4 py-2 text-sm font-bold text-[#361F17]">{session.role.toUpperCase()}</span>
        <button onClick={logout} className="inline-flex h-11 items-center gap-2 rounded-full border border-[#361F17] px-4 font-bold text-[#361F17]">
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
      <ProgressRule />
      <div className="mx-auto grid max-w-[1440px] grid-cols-1 border-b border-[#716942]/40 bg-white/30 lg:grid-cols-[1fr_220px]">
        <label className="flex h-14 items-center gap-5 border-r border-[#716942]/40 px-5 lg:px-11">
          <Search className="h-6 w-6 text-[#1E1E1E]" />
          <input className="w-full bg-transparent text-lg outline-none placeholder:text-[#3F3F35]/55" placeholder="Tìm booking, tracker, khách hàng hoặc sản phẩm..." />
        </label>
        <a href="tel:0912784507" className="flex h-14 items-center justify-center gap-4 text-lg">
          <Phone className="h-6 w-6" />
          0912784507
        </a>
      </div>
    </header>
  );
}

function DashboardPage({ bookings, productJobs, dashboard }: { bookings: Booking[]; productJobs: ProductJob[]; dashboard: ApiStaffDashboard | null }) {
  const reviewNotifications = readReviewNotifications();

  return (
    <div className="space-y-7">
      <PageTitle title="DASHBOARD" subtitle="Quản lý booking, product và lịch vận hành (đồng bộ DB)" />
      <MetricGrid metrics={[
        { label: 'Hôm nay', value: String(dashboard?.today ?? bookings.length), icon: <CalendarDays /> },
        { label: 'Tuần này', value: String(dashboard?.week ?? bookings.length), icon: <Clock3 /> },
        { label: 'Tổng khách', value: String(dashboard?.customers ?? bookings.length), icon: <UserRoundCheck /> },
        { label: 'Doanh thu', value: `${dashboard?.revenue_million ?? 0}M`, icon: <PackageCheck /> },
      ]} />
      <StaffNotificationPanel notifications={reviewNotifications} />
      <AnalyticsDashboard bookings={bookings} productJobs={productJobs} dashboard={dashboard} />
      <section className="rounded-lg bg-white p-6 shadow-[0_12px_30px_rgba(54,31,23,0.06)]">
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <h2 className="text-4xl font-semibold">Danh sách booking</h2>
          <div className="flex gap-3">
            <SearchBox className="w-full lg:w-[520px]" placeholder="Tìm mã booking, khách hàng..." />
            <FilterButton label="Lọc: Tất cả" />
          </div>
        </div>
        <BookingTable bookings={bookings} compact={false} />
      </section>
    </div>
  );
}

function StaffNotificationPanel({ notifications }: { notifications: ReturnType<typeof readReviewNotifications> }) {
  const fallbackNotifications = notifications.length
    ? notifications
    : [
        {
          id: 'demo-low-rating',
          customer: 'Khách demo',
          title: 'Cần phản hồi về lớp men',
          rating: 3,
          targetType: 'workshop' as const,
          createdAt: new Date().toISOString(),
          status: 'low_rating' as const,
        },
      ];
  const lowRatings = fallbackNotifications.filter((item) => item.rating <= 3).length;

  return (
    <section className="rounded-lg bg-white p-6 shadow-[0_12px_30px_rgba(54,31,23,0.06)]">
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="flex items-center gap-3 text-3xl font-bold">
            <Bell className="h-7 w-7 text-[#C96B37]" />
            Thông báo CSKH
          </h2>
          <p className="mt-1 text-[#3F3F35]/75">
            {fallbackNotifications.length} review cần theo dõi, {lowRatings} review rating thấp.
          </p>
        </div>
        <Link to="/review#review-list" className="inline-flex h-11 items-center justify-center rounded-lg bg-[#361F17] px-5 font-bold text-white">
          Trả lời review ngay
        </Link>
      </div>
      <div className="grid gap-3 lg:grid-cols-3">
        {fallbackNotifications.slice(0, 3).map((item) => (
          <article key={item.id} className="rounded-lg border border-[#3F3F35]/10 bg-[#F5F1ED] p-4">
            <div className="mb-2 flex items-center justify-between gap-3">
              <Badge className={item.rating <= 3 ? 'bg-[#FFE3E1] text-[#A33A2F]' : 'bg-[#EFF4D8] text-[#59612E]'}>
                {item.rating <= 3 ? 'Rating thấp' : 'Review mới'}
              </Badge>
              <span className="text-sm font-bold text-[#716942]">{item.rating}/5 sao</span>
            </div>
            <p className="font-bold text-[#361F17]">{item.title}</p>
            <p className="mt-1 text-sm text-[#3F3F35]/75">{item.customer} · {item.targetType === 'product' ? 'Sản phẩm' : 'Workshop'}</p>
            <p className="mt-3 text-sm text-[#716942]">Chưa có phản hồi từ studio.</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function AnalyticsDashboard({
  bookings,
  productJobs,
  dashboard,
}: {
  bookings: Booking[];
  productJobs: ProductJob[];
  dashboard: ApiStaffDashboard | null;
}) {
  const giftOrders = readGiftOrders();
  const demoBookings: Booking[] = bookings.length
    ? bookings
    : [
        { id: 'BK-DEMO-1', customer: 'Minh Anh', phone: '0912345678', email: 'a@demo.vn', workshop: 'Nặn gốm cơ bản', product: 'Ly men rêu', date: '03/06/2026', time: '19:00', people: 2, price: '980.000đ', status: 'confirmed', payment: 'paid', staff: 'Chị Linh', note: 'Quận 1', checkin_status: 'checked_in', chatbot_note: null, chatbot_style: null, chatbot_purpose: null },
        { id: 'BK-DEMO-2', customer: 'Linh Nguyen', phone: '0908123456', email: 'b@demo.vn', workshop: 'Workshop cặp đôi', product: 'Bình celadon', date: '05/06/2026', time: '18:30', people: 2, price: '1.180.000đ', status: 'completed', payment: 'paid', staff: 'Anh Quân', note: 'Quận 3', checkin_status: 'checked_in', chatbot_note: null, chatbot_style: null, chatbot_purpose: null },
        { id: 'BK-DEMO-3', customer: 'Quỳnh Chi', phone: '0987654321', email: 'c@demo.vn', workshop: 'Tô men thư giãn', product: 'DIY kit', date: '07/06/2026', time: '09:00', people: 1, price: '490.000đ', status: 'pending', payment: 'waiting', staff: 'Chị Hạnh', note: 'Bình Thạnh', checkin_status: 'pending', chatbot_note: null, chatbot_style: null, chatbot_purpose: null },
      ];
  const demoProductJobs = productJobs.length
    ? productJobs
    : [
        { id: 'PJ-DEMO-1', booking_id: 'BK-DEMO-1', customer: 'Minh Anh', product: 'Ly men rêu', stage: 'glazing', status: 'in_progress', image: '2 ảnh', owner: 'Chị Linh', due: '10/06/2026' },
        { id: 'PJ-DEMO-2', booking_id: 'BK-DEMO-2', customer: 'Linh Nguyen', product: 'Bình celadon', stage: 'ready', status: 'ready', image: '4 ảnh', owner: 'Anh Quân', due: '09/06/2026' },
        { id: 'PJ-DEMO-3', booking_id: 'BK-DEMO-3', customer: 'Quỳnh Chi', product: 'DIY kit', stage: 'drying', status: 'photo_needed', image: '0 ảnh', owner: 'Chị Hạnh', due: '12/06/2026' },
      ] as ProductJob[];
  const revenueBars = [
    { label: 'T2', value: 5.2 },
    { label: 'T3', value: 7.8 },
    { label: 'T4', value: 6.4 },
    { label: 'T5', value: dashboard?.revenue_million ?? 9.6 },
  ];
  const maxRevenue = Math.max(...revenueBars.map((item) => item.value), 1);
  const districtCounts = demoBookings.reduce<Record<string, number>>((acc, booking) => {
    const district = booking.note?.match(/Quận \d+|Bình Thạnh|Thủ Đức|Gò Vấp/)?.[0] ?? 'Nội thành';
    acc[district] = (acc[district] ?? 0) + 1;
    return acc;
  }, {});
  const workshopCounts = demoBookings.reduce<Record<string, number>>((acc, booking) => {
    acc[booking.workshop] = (acc[booking.workshop] ?? 0) + 1;
    return acc;
  }, {});
  const topWorkshop = Object.entries(workshopCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'Nặn gốm cơ bản';
  const repeatCustomers = demoBookings.length - new Set(demoBookings.map((item) => item.phone)).size;
  const giftCount = Math.max(giftOrders.length, demoBookings.filter((item) => item.note?.toLowerCase().includes('gift')).length);
  const styleRows = [
    { label: 'Minimal / celadon', value: demoProductJobs.filter((job) => /celadon|ly|men/i.test(job.product)).length + 2 },
    { label: 'Mộc / wabi-sabi', value: demoProductJobs.filter((job) => /bình|đất|mộc/i.test(job.product)).length + 1 },
    { label: 'DIY / trải nghiệm', value: demoProductJobs.filter((job) => /kit|workshop/i.test(job.product)).length + 1 },
  ];

  return (
    <section className="rounded-lg bg-white p-6 shadow-[0_12px_30px_rgba(54,31,23,0.06)]">
      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="flex items-center gap-3 text-3xl font-bold">
            <TrendingUp className="h-7 w-7 text-[#716942]" />
            Analytics cho chủ studio
          </h2>
          <p className="mt-1 text-[#3F3F35]/75">Doanh thu, khu vực khách, repeat booking, workshop nổi bật và gift flow.</p>
        </div>
        <Badge className="bg-[#EFF4D8] text-[#59612E]">Demo analytics</Badge>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-lg border border-[#3F3F35]/10 bg-[#F5F1ED] p-5">
          <h3 className="mb-4 text-xl font-bold">Doanh thu theo tuần</h3>
          <div className="grid h-[220px] grid-cols-4 items-end gap-4">
            {revenueBars.map((item) => (
              <div key={item.label} className="flex h-full flex-col justify-end gap-2">
                <div className="flex items-end rounded-t-lg bg-[#716942]" style={{ height: `${Math.max(18, (item.value / maxRevenue) * 100)}%` }}>
                  <span className="w-full pb-2 text-center text-sm font-bold text-white">{item.value.toFixed(1)}M</span>
                </div>
                <span className="text-center text-sm font-bold text-[#716942]">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-4">
          <AnalyticsStat icon={<UserRoundCheck />} label="Tỷ lệ khách quay lại" value={`${Math.round((repeatCustomers / Math.max(demoBookings.length, 1)) * 100)}%`} helper="Dựa trên số điện thoại trùng trong booking." />
          <AnalyticsStat icon={<Gift />} label="Đơn quà tặng" value={String(giftCount)} helper="Từ nút Mua làm quà và tag gift." />
          <AnalyticsStat icon={<CalendarDays />} label="Workshop nổi bật" value={topWorkshop} helper="Workshop có số booking cao nhất." />
        </div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <AnalyticsList icon={<MapPin />} title="Khu vực khách hàng" rows={Object.entries(districtCounts).map(([label, value]) => ({ label, value }))} />
        <AnalyticsList icon={<PackageCheck />} title="Sản phẩm theo phong cách" rows={styleRows} />
        <AnalyticsList icon={<Gift />} title="Dịp tặng phổ biến" rows={(giftOrders.length ? giftOrders : [{ occasion: 'Sinh nhật' }, { occasion: 'Tân gia' }, { occasion: 'Quà cảm ơn' }]).reduce<Array<{ label: string; value: number }>>((rows, order) => {
          const label = order.occasion;
          const existing = rows.find((item) => item.label === label);
          if (existing) existing.value += 1;
          else rows.push({ label, value: 1 });
          return rows;
        }, [])} />
      </div>
    </section>
  );
}

function AnalyticsStat({ icon, label, value, helper }: { icon: ReactNode; label: string; value: string; helper: string }) {
  return (
    <article className="rounded-lg border border-[#3F3F35]/10 bg-[#F5F1ED] p-5">
      <div className="mb-3 flex items-center gap-3 text-[#716942] [&>svg]:h-6 [&>svg]:w-6">{icon}<span className="font-bold">{label}</span></div>
      <p className="text-3xl font-bold text-[#361F17]">{value}</p>
      <p className="mt-2 text-sm text-[#3F3F35]/70">{helper}</p>
    </article>
  );
}

function AnalyticsList({ icon, title, rows }: { icon: ReactNode; title: string; rows: Array<{ label: string; value: number }> }) {
  const max = Math.max(...rows.map((row) => row.value), 1);
  return (
    <article className="rounded-lg border border-[#3F3F35]/10 bg-[#F5F1ED] p-5">
      <h3 className="mb-4 flex items-center gap-2 text-xl font-bold text-[#361F17]">
        <span className="text-[#716942] [&>svg]:h-5 [&>svg]:w-5">{icon}</span>
        {title}
      </h3>
      <div className="space-y-3">
        {rows.map((row) => (
          <div key={row.label}>
            <div className="mb-1 flex justify-between gap-3 text-sm">
              <span className="font-semibold text-[#3F3F35]">{row.label}</span>
              <span className="text-[#716942]">{row.value}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white">
              <div className="h-full rounded-full bg-[#C96B37]" style={{ width: `${Math.max(12, (row.value / max) * 100)}%` }} />
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}

function BookingPage({ bookings, dashboard }: { bookings: Booking[]; dashboard: ApiStaffDashboard | null }) {
  const selected = bookings[0];

  if (!selected) {
    return <PageTitle title="BOOKING MANAGEMENT" subtitle="Chưa có booking trong cơ sở dữ liệu." />;
  }

  return (
    <div className="space-y-7">
      <PageTitle title="BOOKING MANAGEMENT" subtitle="Quản lý booking workshop" />
      <MetricGrid metrics={[
        { label: 'Hôm nay', value: String(dashboard?.today ?? 0), icon: <CalendarDays /> },
        { label: 'Đã xác nhận', value: String(dashboard?.confirmed ?? 0), icon: <CheckCircle2 /> },
        { label: 'Đã thanh toán', value: String(dashboard?.paid ?? 0), icon: <Mail /> },
        { label: 'Đã hủy', value: String(dashboard?.cancelled ?? 0), icon: <XCircle /> },
      ]} />
      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="rounded-lg bg-white p-6 shadow-[0_12px_30px_rgba(54,31,23,0.06)]">
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <SearchBox className="lg:w-[410px]" placeholder="Tìm booking, khách hàng..." />
            <div className="grid grid-cols-3 gap-3">
              <FilterButton label="Trạng thái" />
              <FilterButton label="Workshop" />
              <FilterButton label="Ngày" />
            </div>
          </div>
          <BookingTable bookings={bookings} compact />
        </div>
        <BookingDetail booking={selected} />
      </section>
    </div>
  );
}

function ProductManagementPage({ role, productJobs }: { role: StaffRole; productJobs: ProductJob[] }) {
  const selected = productJobs[0];
  const stats = useMemo(() => [
    { label: 'Đang xử lý', value: productJobs.filter((item) => item.status === 'in_progress').length.toString(), icon: <RefreshCw /> },
    { label: 'Cần ảnh', value: productJobs.filter((item) => item.status === 'photo_needed').length.toString(), icon: <ImageUp /> },
    { label: 'Sẵn sàng giao', value: productJobs.filter((item) => item.status === 'ready').length.toString(), icon: <PackageCheck /> },
    { label: 'Đã bàn giao', value: productJobs.filter((item) => item.status === 'delivered').length.toString(), icon: <CheckCircle2 /> },
  ], [productJobs]);

  if (!selected) {
    return <PageTitle title="PRODUCT MANAGEMENT" subtitle="Chưa có sản phẩm sau workshop trong DB." />;
  }

  return (
    <div className="space-y-7">
      <PageTitle title="PRODUCT MANAGEMENT" subtitle="Theo dõi sản phẩm sau workshop, ảnh thành phẩm và bàn giao" />
      <MetricGrid metrics={stats} />
      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="rounded-lg bg-white p-6 shadow-[0_12px_30px_rgba(54,31,23,0.06)]">
          <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <h2 className="text-3xl font-bold">Danh sách product</h2>
            <div className="grid gap-3 sm:grid-cols-3">
              <FilterButton label="Stage" />
              <FilterButton label="Ảnh" />
              <FilterButton label="Ngày hẹn" />
            </div>
          </div>
          <div className="mb-4 max-w-[420px]">
            <SearchBox placeholder="Tìm sản phẩm, booking, khách hàng..." />
          </div>
          <ProductTable productJobs={productJobs} />
        </div>
        <aside className="rounded-lg bg-white p-6 shadow-[0_12px_30px_rgba(54,31,23,0.06)]">
          <h2 className="mb-5 text-3xl font-bold">Chi tiết Product</h2>
          <div className="mb-4 flex items-center justify-between">
            <span className="text-3xl font-bold">{selected.id}</span>
            <Badge className={productStatusClass[selected.status]}>{productStatusLabel[selected.status]}</Badge>
          </div>
          <div className="space-y-3 text-lg">
            <InfoRow label="Booking ID" value={selected.booking_id} />
            <InfoRow label="Khách hàng" value={selected.customer} />
            <InfoRow label="Sản phẩm" value={selected.product} />
            <InfoRow label="Stage" value={stageLabel[selected.stage]} />
            <InfoRow label="Người phụ trách" value={selected.owner} />
            <InfoRow label="Hẹn giao" value={selected.due} />
          </div>
          <button className="mt-6 flex h-24 w-full items-center justify-center gap-2 rounded-lg border border-dashed border-[#C0AC8B] bg-[#F5F1ED] text-[#3F3F35]/65">
            <Camera className="h-6 w-6" />
            Upload ảnh sản phẩm
          </button>
          <div className="mt-5 grid gap-3">
            <ActionButton icon={<Edit3 />} label="Cập nhật trạng thái" className="bg-[#3F3F35]" />
            <button className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-[#3F3F35] bg-white font-bold">
              <Send className="h-5 w-5" />
              Gửi ảnh cho khách
            </button>
            {role === 'admin' && <ActionButton icon={<Package />} label="Xác nhận bàn giao" className="bg-[#361F17]" />}
          </div>
        </aside>
      </section>
    </div>
  );
}

function TrackingManagementPage({
  role,
  bookings,
  trackers,
  dashboard,
}: {
  role: StaffRole;
  bookings: Booking[];
  trackers: Tracker[];
  dashboard: ApiStaffDashboard | null;
}) {
  const selected = trackers[0];
  const selectedBooking = selected
    ? bookings.find((booking) => booking.id === selected.booking_id) ?? bookings[0]
    : bookings[0];

  if (!selected || !selectedBooking) {
    return <PageTitle title="CHECK-IN & TRACKER MANAGEMENT" subtitle="Chưa có tracker trong cơ sở dữ liệu." />;
  }

  return (
    <div className="space-y-5">
      <PageTitle title="CHECK-IN & TRACKER MANAGEMENT" subtitle="Đồng bộ với mã tracking khách tra cứu (THO/WS/ORD)" />
      <MetricGrid metrics={[
        { label: 'Chờ check-in', value: String(dashboard?.pending_checkin ?? 0), icon: <Clock3 /> },
        { label: 'Đã check-in', value: String(dashboard?.checked_in ?? 0), icon: <UserRoundCheck /> },
        { label: 'Tracker cần cập nhật', value: String(dashboard?.trackers_need_update ?? trackers.length), icon: <RefreshCw /> },
        { label: 'Lỗi QC', value: String(dashboard?.qc_issues ?? 0), icon: <AlertTriangle /> },
      ]} />
      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_400px]">
        <div className="space-y-5">
          <CheckInPanel booking={selectedBooking} role={role} />
          <TrackerList trackers={trackers} />
        </div>
        <TrackerDetail tracker={selected} booking={selectedBooking} role={role} />
      </section>
    </div>
  );
}

function PageTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div>
      <h1 className="text-[clamp(2.3rem,4.5vw,4.25rem)] font-bold leading-none tracking-normal text-[#3F3F35]">{title}</h1>
      <p className="mt-2 text-2xl text-[#3F3F35]/85">{subtitle}</p>
    </div>
  );
}

function MetricGrid({ metrics }: { metrics: Array<{ label: string; value: string; icon: ReactNode }> }) {
  return (
    <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => (
        <article key={metric.label} className="rounded-lg bg-white p-6 shadow-[0_12px_30px_rgba(54,31,23,0.06)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xl text-[#3F3F35]/80">{metric.label}</p>
              <p className="mt-3 text-5xl font-bold leading-none">{metric.value}</p>
            </div>
            <span className="text-[#716942] [&>svg]:h-10 [&>svg]:w-10">{metric.icon}</span>
          </div>
        </article>
      ))}
    </section>
  );
}

function SearchBox({ placeholder, className = '' }: { placeholder: string; className?: string }) {
  return (
    <label className={`flex h-12 items-center gap-3 rounded-lg border border-[#3F3F35]/20 bg-[#F5F1ED] px-4 ${className}`}>
      <Search className="h-5 w-5 text-[#3F3F35]" />
      <input className="w-full bg-transparent outline-none placeholder:text-[#3F3F35]/55" placeholder={placeholder} />
    </label>
  );
}

function FilterButton({ label }: { label: string }) {
  return (
    <button className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-[#3F3F35]/40 bg-white px-4 font-semibold">
      {label}
      <ChevronDown className="h-4 w-4" />
    </button>
  );
}

function BookingTable({ bookings, compact }: { bookings: Booking[]; compact: boolean }) {
  const rows = bookings;
  const headings = compact
    ? ['ID', 'Khách hàng', 'Liên hệ', 'Workshop', 'Ngày', 'Giờ', 'Số người', 'Chatbot', 'Trạng thái', 'Thanh toán']
    : ['Mã booking', 'Khách hàng', 'Liên hệ', 'Dịch vụ', 'Ngày', 'Giờ', 'Giá', 'Chatbot', 'Trạng thái', 'Người phụ trách', ''];

  return (
    <div className="overflow-x-auto">
      <table className={`${compact ? 'min-w-[980px]' : 'min-w-[1420px]'} w-full border-separate border-spacing-y-2`}>
        <thead>
          <tr className="bg-[#3F3F35] text-white">
            {headings.map((heading, index) => <TableHead key={heading || index} index={index} total={headings.length}>{heading}</TableHead>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((booking) => (
            <tr key={booking.id} className="bg-white outline outline-1 outline-[#3F3F35]/10">
              <td className="rounded-l-lg px-4 py-3 font-semibold">{compact ? booking.id.replace('BK', '') : booking.id}</td>
              <td className="px-4 py-3">{booking.customer}</td>
              <td className="px-4 py-3">{booking.phone}</td>
              <td className="px-4 py-3">{booking.workshop}</td>
              <td className="px-4 py-3">{compact ? booking.date.slice(0, 5) : booking.date}</td>
              <td className="px-4 py-3">{booking.time}</td>
              <td className="px-4 py-3">{compact ? booking.people : booking.price}</td>
              <td className="px-4 py-3">
                <Badge className={booking.chatbot_note ? 'bg-[#F4E4D8] text-[#643A2A]' : 'bg-[#F5F1ED] text-[#716942]'}>
                  {booking.chatbot_note ? 'Có note' : 'Chưa có'}
                </Badge>
              </td>
              <td className="px-4 py-3"><Badge className={statusClass[booking.status]}>{statusLabel[booking.status]}</Badge></td>
              <td className="px-4 py-3"><Badge className={compact ? paymentClass[booking.payment] : 'bg-transparent text-[#3F3F35]'}>{compact ? paymentLabel[booking.payment] : booking.staff}</Badge></td>
              {!compact && <td className="rounded-r-lg px-4 py-3"><MoreHorizontal className="h-5 w-5" /></td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ProductTable({ productJobs }: { productJobs: ProductJob[] }) {
  const headings = ['Product ID', 'Booking', 'Khách hàng', 'Sản phẩm', 'Stage', 'Trạng thái', 'Ảnh', 'Hẹn giao', ''];
  return (
    <div className="overflow-x-auto">
      <table className="min-w-[980px] w-full border-separate border-spacing-y-2">
        <thead>
          <tr className="bg-[#3F3F35] text-white">
            {headings.map((heading, index) => <TableHead key={heading || index} index={index} total={headings.length}>{heading}</TableHead>)}
          </tr>
        </thead>
        <tbody>
          {productJobs.map((job) => (
            <tr key={job.id} className="bg-white outline outline-1 outline-[#3F3F35]/10">
              <td className="rounded-l-lg px-4 py-3 font-semibold">{job.id}</td>
              <td className="px-4 py-3">{job.booking_id}</td>
              <td className="px-4 py-3">{job.customer}</td>
              <td className="px-4 py-3">{job.product}</td>
              <td className="px-4 py-3"><Badge className={stageClass[job.stage]}>{stageLabel[job.stage]}</Badge></td>
              <td className="px-4 py-3"><Badge className={productStatusClass[job.status]}>{productStatusLabel[job.status]}</Badge></td>
              <td className="px-4 py-3">{job.image}</td>
              <td className="px-4 py-3">{job.due}</td>
              <td className="rounded-r-lg px-4 py-3"><MoreHorizontal className="h-5 w-5" /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TableHead({ children, index, total }: { children: ReactNode; index: number; total: number }) {
  return (
    <th className={`px-4 py-4 text-left text-sm font-bold ${index === 0 ? 'rounded-l-lg' : ''} ${index === total - 1 ? 'rounded-r-lg' : ''}`}>
      {children}
    </th>
  );
}

function BookingDetail({ booking }: { booking: Booking }) {
  const rows = [
    ['Khách hàng', booking.customer],
    ['SDT', booking.phone],
    ['Email', booking.email],
    ['Workshop', booking.workshop],
    ['Ngày', booking.date],
    ['Giờ', booking.time],
    ['Số người', booking.people.toString()],
    ['Tổng tiền', booking.price],
    ['Trạng thái', statusLabel[booking.status]],
    ['Thanh toán', paymentLabel[booking.payment]],
    ['Instructor', booking.staff],
    ['Capacity', '8/10'],
    ['Equipment', 'Đủ'],
    ['Trạng thái slot', 'Available'],
    ['Ghi chú', booking.note],
    ['Ghi chú chatbot', booking.chatbot_note || 'Chưa có dữ liệu từ chatbot'],
    ['Phong cách mong muốn', booking.chatbot_style || 'Chưa rõ'],
    ['Mục đích', booking.chatbot_purpose || 'Chưa rõ'],
  ];

  return (
    <aside className="rounded-lg bg-white p-6 shadow-[0_12px_30px_rgba(54,31,23,0.06)]">
      <h2 className="mb-5 text-3xl font-bold">Chi tiết Booking</h2>
      <div className="mb-5 flex items-center justify-between rounded-lg bg-[#C0AC8B] p-4">
        <span className="text-3xl font-bold">{booking.id.replace('BK', '')}</span>
        <Badge className="bg-white text-[#3F3F35]">{statusLabel[booking.status]}</Badge>
      </div>
      <div className="space-y-3">
        {rows.map(([label, value], index) => (
          <InfoRow key={`${label}-${index}`} label={label} value={value} divider={[7, 10, 14].includes(index)} />
        ))}
      </div>
      <div className="mt-7 grid gap-3">
        <ActionButton icon={<CheckCircle2 />} label="Xác nhận booking" className="bg-[#3F3F35]" />
        <ActionButton icon={<XCircle />} label="Hủy booking" className="bg-[#716942]" />
        <ActionButton icon={<UserCheck />} label="Check-in khách" className="bg-[#361F17]" />
      </div>
    </aside>
  );
}

function CheckInPanel({ booking, role }: { booking: Booking; role: StaffRole }) {
  return (
    <section className="rounded-lg bg-white p-6 shadow-[0_12px_30px_rgba(54,31,23,0.06)]">
      <h2 className="mb-4 text-3xl font-bold">Khu vực Check-in</h2>
      <div className="mb-5 grid gap-3 lg:grid-cols-[1fr_160px_160px]">
        <SearchBox placeholder="Nhập mã booking, SĐT hoặc quét QR..." />
        <button className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-[#3F3F35] font-bold text-white">
          <QrCode className="h-5 w-5" />
          Quét QR
        </button>
        <button className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-[#3F3F35]/40 bg-white font-semibold">
          <Search className="h-5 w-5" />
          Tìm kiếm
        </button>
      </div>
      <div className="grid gap-5 rounded-lg border border-[#3F3F35]/15 p-5 lg:grid-cols-[1fr_280px]">
        <div className="grid gap-4 sm:grid-cols-2">
          <Info label="Mã booking" value={booking.id} />
          <Info label="Giờ" value={booking.time} />
          <Info label="Khách hàng" value={booking.customer} />
          <Info label="Số người" value={booking.people.toString()} />
          <Info label="Workshop" value={booking.workshop} />
          <Info label="Payment" value={paymentLabel[booking.payment]} />
          <Info label="Ngày" value={booking.date} />
        </div>
        <div className="flex flex-col justify-center gap-3 border-t border-[#3F3F35]/15 pt-5 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
          <Badge className={`mx-auto ${booking.checkin_status === 'checked_in' ? 'bg-[#EFF4D8] text-[#59612E]' : 'bg-[#FFF3D7] text-[#A76020]'}`}>
            {booking.checkin_status === 'checked_in' ? 'Đã check-in' : booking.checkin_status === 'cancelled' ? 'Đã hủy' : 'Chưa check-in'}
          </Badge>
          <button className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-[#C96B37] font-bold text-white">
            <UserCheck className="h-5 w-5" />
            Check-in khách
          </button>
          <button className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-[#3F3F35] bg-white font-semibold">
            <Plus className="h-5 w-5" />
            {role === 'admin' ? 'Tạo / gán tracker' : 'Tạo tracker'}
          </button>
        </div>
      </div>
    </section>
  );
}

function TrackerList({ trackers }: { trackers: Tracker[] }) {
  return (
    <section className="rounded-lg bg-white p-6 shadow-[0_12px_30px_rgba(54,31,23,0.06)]">
      <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <h2 className="text-3xl font-bold">Danh sách tracker</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <FilterButton label="Stage" />
          <FilterButton label="QC" />
          <FilterButton label="Ngày" />
        </div>
      </div>
      <div className="mb-4 max-w-[360px]">
        <SearchBox placeholder="Tìm tracker, khách hàng, sản phẩm..." />
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-[840px] w-full border-separate border-spacing-y-1">
          <thead>
            <tr className="bg-[#3F3F35] text-white">
              {['Tracker ID', 'Booking ID', 'Khách hàng', 'Sản phẩm', 'Stage', 'QC', 'Cập nhật cuối', 'Hành động'].map((heading, index) => <TableHead key={heading} index={index} total={8}>{heading}</TableHead>)}
            </tr>
          </thead>
          <tbody>
            {trackers.map((tracker) => (
              <tr key={tracker.id} className="border-b border-[#3F3F35]/10 bg-white">
                <td className="px-4 py-3">{tracker.id}</td>
                <td className="px-4 py-3">{tracker.booking_id}</td>
                <td className="px-4 py-3">{tracker.customer}</td>
                <td className="px-4 py-3">{tracker.product}</td>
                <td className="px-4 py-3"><Badge className={stageClass[tracker.stage]}>{stageLabel[tracker.stage]}</Badge></td>
                <td className="px-4 py-3"><Badge className={qcClass[tracker.qc]}>{qcLabel[tracker.qc]}</Badge></td>
                <td className="px-4 py-3">{tracker.updated_at}</td>
                <td className="px-4 py-3"><MoreHorizontal className="h-5 w-5" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex items-center justify-between text-sm">
        <span>Hiển thị {trackers.length} tracker</span>
        <div className="flex items-center gap-2">
          <button className="h-9 w-9 rounded-lg border border-[#3F3F35]/15 text-[#3F3F35]/35">&lt;</button>
          <button className="h-9 w-9 rounded-lg bg-[#3F3F35] text-white">1</button>
          <button className="h-9 w-9 rounded-lg border border-[#3F3F35]/15 text-[#3F3F35]/35">&gt;</button>
        </div>
      </div>
    </section>
  );
}

function TrackerDetail({ tracker, booking, role }: { tracker: Tracker; booking: Booking; role: StaffRole }) {
  const stages: TrackerStage[] = ['created', 'drying', 'bisque', 'glazing', 'final', 'ready'];
  const trackingCode = tracker.tracking_code || `CER-${tracker.id}`;
  const [uploadedMedia, setUploadedMedia] = useState<TrackingMedia[]>(() => (
    readTrackingMedia().filter((item) => item.tracking_code === trackingCode || item.booking_code === booking.id)
  ));

  useEffect(() => {
    setUploadedMedia(readTrackingMedia().filter((item) => item.tracking_code === trackingCode || item.booking_code === booking.id));
  }, [booking.id, trackingCode]);

  const mockUploadMedia = (mediaType: TrackingMedia['media_type'], stage: string, url: string, title: string) => {
    const media: TrackingMedia = {
      id: `${trackingCode}-${mediaType}-${Date.now()}`,
      tracking_code: trackingCode,
      booking_code: booking.id,
      media_type: mediaType,
      stage,
      title,
      description: mediaType === 'video'
        ? 'Thumbnail mini vlog do staff cập nhật cho khách xem lại trải nghiệm.'
        : 'Ảnh demo do staff upload, sẽ hiển thị trong trang Tracking của khách.',
      url,
      uploaded_by: role === 'admin' ? 'Admin THỔ' : tracker.owner,
      created_at: new Date().toISOString(),
      is_new: true,
    };
    upsertTrackingMedia(media);
    setUploadedMedia(readTrackingMedia().filter((item) => item.tracking_code === trackingCode || item.booking_code === booking.id));
    toast.success('Đã upload media demo cho tracking của khách.');
  };

  return (
    <aside className="rounded-lg bg-white p-6 shadow-[0_12px_30px_rgba(54,31,23,0.06)]">
      <h2 className="mb-5 text-3xl font-bold">Chi tiết Tracker</h2>
      <div className="mb-4 flex items-center justify-between">
        <span className="text-3xl font-bold">{tracker.id}</span>
        <Badge className={stageClass[tracker.stage]}>{stageLabel[tracker.stage]}</Badge>
      </div>
      <div className="grid grid-cols-[125px_1fr] gap-y-2 text-[17px]">
        <span className="text-[#716942]">Khách hàng</span><span>{tracker.customer}</span>
        <span className="text-[#716942]">Booking ID</span><span>{tracker.booking_id}</span>
        <span className="text-[#716942]">Mã khách</span>
        <span>
          {tracker.tracking_code ? (
            <Link to={`/tracking?code=${encodeURIComponent(tracker.tracking_code)}`} className="font-bold text-[#C96B37] underline">
              {tracker.tracking_code}
            </Link>
          ) : (
            'Chưa gán'
          )}
        </span>
        <span className="text-[#716942]">Sản phẩm</span><span>{tracker.product}</span>
        <span className="text-[#716942]">Workshop</span><span>{tracker.workshop}</span>
        <span className="text-[#716942]">Ngày tạo</span><span>{booking.date}</span>
        <span className="text-[#716942]">Người phụ trách</span><span>{tracker.owner}</span>
        <span className="text-[#716942]">Lò nung</span><span>{tracker.kiln}</span>
      </div>

      <div className="my-6 space-y-3">
        {stages.map((stage, index) => {
          const isDone = index < stages.indexOf(tracker.stage);
          const isCurrent = stage === tracker.stage;
          return (
            <div key={stage} className="grid grid-cols-[28px_1fr_auto] items-center gap-3">
              <span className={`flex h-5 w-5 items-center justify-center rounded-full border ${isDone ? 'bg-[#716942] text-white' : isCurrent ? 'border-[#C96B37] bg-white text-[#C96B37]' : 'border-[#3F3F35]/25'}`}>
                {isDone && <CheckCircle2 className="h-4 w-4" />}
              </span>
              <span className={isCurrent ? 'font-bold text-[#C96B37]' : 'font-semibold'}>{stageLabel[stage]}</span>
              <span className="text-xs text-[#716942]">{isDone || isCurrent ? tracker.updated_at : ''}</span>
            </div>
          );
        })}
      </div>

      <div className="mb-5 rounded-lg border border-[#3F3F35]/15 bg-[#F5F1ED] p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="text-lg font-bold">Media khách hàng</p>
          <Badge className="bg-white text-[#716942]">{uploadedMedia.length} file</Badge>
        </div>
        <div className="mb-3 grid gap-2">
          {uploadedMedia.slice(0, 3).map((item) => (
            <div key={item.id} className="grid grid-cols-[48px_1fr] gap-3 rounded-lg bg-white p-2">
              <img src={item.url} alt={item.title} className="h-12 w-12 rounded-md object-cover" />
              <div className="min-w-0">
                <p className="truncate text-sm font-bold">{item.title}</p>
                <p className="text-xs text-[#716942]">{item.stage} · {item.media_type}</p>
              </div>
            </div>
          ))}
          {uploadedMedia.length === 0 && (
            <div className="flex min-h-16 items-center justify-center gap-2 rounded-lg border border-dashed border-[#C0AC8B] bg-white text-[#3F3F35]/55">
              <Camera className="h-5 w-5" />
              Chưa có media cho khách
            </div>
          )}
        </div>
        <div className="grid gap-2">
          <button
            type="button"
            onClick={() => mockUploadMedia('image', 'Workshop', workshopImages.handsWarm, 'Ảnh khách đang nặn gốm')}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[#3F3F35] bg-white text-sm font-bold"
          >
            <UploadCloud className="h-4 w-4" />
            Upload ảnh workshop
          </button>
          <button
            type="button"
            onClick={() => mockUploadMedia('image', stageLabel[tracker.stage], productImages.tealVase, 'Ảnh sản phẩm theo stage')}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[#3F3F35] bg-white text-sm font-bold"
          >
            <ImageUp className="h-4 w-4" />
            Upload ảnh stage hiện tại
          </button>
          <button
            type="button"
            onClick={() => mockUploadMedia('video', 'Mini vlog', workshopImages.wheelBw, 'Thumbnail mini vlog workshop')}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[#3F3F35] bg-white text-sm font-bold"
          >
            <Camera className="h-4 w-4" />
            Upload mini vlog
          </button>
        </div>
      </div>
      <label className="mb-5 block">
        <span className="mb-2 block text-lg">Ghi chú QC</span>
        <textarea className="min-h-[78px] w-full rounded-lg border border-[#3F3F35]/20 p-3 outline-none" defaultValue="Bề mặt ổn định, chờ chuyển sang nung sơ." />
      </label>
      <div className="grid gap-3">
        <ActionButton icon={<Edit3 />} label="Cập nhật stage" className="bg-[#3F3F35]" />
        <button
          type="button"
          onClick={() => mockUploadMedia('image', stageLabel[tracker.stage], productImages.tealVase, 'Ảnh cập nhật nhanh từ xưởng')}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-[#3F3F35] bg-white font-bold"
        >
          <UploadCloud className="h-5 w-5" />
          Upload ảnh
        </button>
        <button className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-[#3F3F35] bg-white font-bold">
          <Send className="h-5 w-5" />
          {role === 'admin' ? 'Gửi thông báo / duyệt' : 'Gửi thông báo'}
        </button>
      </div>
    </aside>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[#716942]">{label}</p>
      <p className="mt-1 font-bold">{value}</p>
    </div>
  );
}

function InfoRow({ label, value, divider = false }: { label: string; value: string; divider?: boolean }) {
  return (
    <div className={`grid grid-cols-[132px_1fr] gap-4 text-lg ${divider ? 'border-t border-[#C0AC8B]/50 pt-3' : ''}`}>
      <span className="text-[#716942]">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function Badge({ children, className }: { children: ReactNode; className: string }) {
  return (
    <span className={`inline-flex min-h-8 items-center justify-center rounded-full px-4 text-sm font-semibold ${className}`}>
      {children}
    </span>
  );
}

function ActionButton({ icon, label, className }: { icon: ReactNode; label: string; className: string }) {
  return (
    <button className={`inline-flex h-12 items-center justify-center gap-2 rounded-lg font-bold text-white ${className}`}>
      <span className="[&>svg]:h-5 [&>svg]:w-5">{icon}</span>
      {label}
    </button>
  );
}
