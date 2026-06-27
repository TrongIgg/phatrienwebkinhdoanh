import { Link, NavLink, useLocation } from 'react-router';
import { Facebook, LogOut, Mail, Menu, ShoppingCart, UserCircle, X, CalendarCheck, Package, Sparkles } from 'lucide-react';
import { useState, useEffect, useRef, type ReactNode } from 'react';
import { useProductCart } from '../contexts/ProductCartContext';
import { useWorkshopCart } from '../contexts/WorkshopCartContext';
import { logoImage, ProgressRule } from './DesignPrimitives';
import {
  CUSTOMER_SESSION_EVENT,
  createMockCustomerSession,
  readCustomerSession,
  saveCustomerSession,
  type CustomerSession,
  type SocialProvider,
} from '../lib/customerExperience';
import { createPortal } from 'react-dom';
import { readLocalTrackingRecords, cancelLocalTrackingRecord, type ApiTracking } from '../lib/trackingStorage';
import { CancelConfirmationModal } from './TrackingPage';
import { toast } from 'sonner';

const navItems = [
  { label: 'Trang chủ', to: '/' },
  { label: 'Workshop', to: '/workshop' },
  { label: 'Sản phẩm', to: '/product' },
  { label: 'Theo dõi', to: '/tracking' },
  { label: 'Về THỔ', to: '/about' },
  { label: 'Đánh giá', to: '/review' },
];

export function Header() {
  const location = useLocation();
  const { productCount } = useProductCart();
  const { workshopTicketCount } = useWorkshopCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [badgePulse, setBadgePulse] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [customer, setCustomer] = useState<CustomerSession | null>(() => readCustomerSession());
  const prevCountRef = useRef(0);

  const itemCount = productCount + workshopTicketCount;

  // Pulse animation when item count changes
  useEffect(() => {
    if (itemCount > prevCountRef.current) {
      setBadgePulse(true);
      const timer = setTimeout(() => setBadgePulse(false), 400);
      return () => clearTimeout(timer);
    }
    prevCountRef.current = itemCount;
  }, [itemCount]);

  useEffect(() => {
    const syncCustomer = () => setCustomer(readCustomerSession());
    window.addEventListener(CUSTOMER_SESSION_EVENT, syncCustomer);
    window.addEventListener('storage', syncCustomer);
    return () => {
      window.removeEventListener(CUSTOMER_SESSION_EVENT, syncCustomer);
      window.removeEventListener('storage', syncCustomer);
    };
  }, []);

  const loginWithProvider = (provider: SocialProvider) => {
    const session = createMockCustomerSession(provider);
    saveCustomerSession(session);
    setCustomer(session);
    setLoginOpen(false);
  };

  const logoutCustomer = () => {
    saveCustomerSession(null);
    setCustomer(null);
    setLoginOpen(false);
  };

  const isCurrentNav = (to: string, isActive: boolean) => {
    if (to === '/') return location.pathname === '/';
    return isActive || location.pathname.startsWith(to);
  };

  const getNavClassName = (to: string) => ({ isActive }: { isActive: boolean }) => {
    const current = isCurrentNav(to, isActive);
    return `relative inline-flex min-h-11 items-center rounded-full px-4 text-[20px] font-bold transition-all ${
      current
        ? 'bg-[#361F17] text-[#FBEEE5] shadow-[0_8px_22px_rgba(54,31,23,0.18)]'
        : 'text-[#361F17] hover:bg-[#EFE2D6] hover:text-[#716942]'
    }`;
  };

  return (
    <header className="sticky top-0 z-50 bg-[#FBEEE5]/95 backdrop-blur supports-[backdrop-filter]:bg-[#FBEEE5]/85">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
        <div className="flex h-24 items-center justify-between gap-6">
          <Link to="/" className="flex items-center" onClick={() => setMobileMenuOpen(false)} aria-label="THỔ Studio">
            <img src={logoImage} alt="THỔ Studio logo" className="h-16 w-16 rounded-full object-cover shadow-sm" />
          </Link>

          <nav className="hidden items-center space-x-8 lg:flex">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} className={getNavClassName(item.to)}>
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link to="/cart" className="relative rounded-lg p-2 transition-colors hover:bg-[#EFE2D6]">
              <ShoppingCart className="h-6 w-6 text-[#361F17]" />
              {itemCount > 0 && (
                <span
                  className={`absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#716942] text-xs text-white ${
                    badgePulse ? 'cart-badge-pulse' : ''
                  }`}
                >
                  {itemCount}
                </span>
              )}
            </Link>

            <div className="relative">
              {customer ? (
                <button
                  type="button"
                  onClick={() => setLoginOpen((open) => !open)}
                  className="flex h-11 items-center gap-2 rounded-full border border-[#E2CDBD] bg-white/60 px-2 pr-3 text-sm font-bold text-[#361F17] hover:bg-[#EFE2D6]"
                  aria-label="Tài khoản khách hàng"
                >
                  <img src={customer.avatar_url} alt={customer.display_name} className="h-8 w-8 rounded-full object-cover" />
                  <span className="hidden max-w-[92px] truncate xl:inline">{customer.display_name}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setLoginOpen((open) => !open)}
                  className="hidden h-11 items-center gap-2 rounded-full border border-[#361F17] px-4 font-bold text-[#361F17] hover:bg-[#EFE2D6] sm:flex"
                >
                  <UserCircle className="h-5 w-5" />
                  Đăng nhập
                </button>
              )}

              {loginOpen && (
                <div className="absolute right-0 top-14 z-50 w-[280px] rounded-lg border border-[#E2CDBD] bg-[#FFF8F2] p-4 shadow-[0_16px_40px_rgba(54,31,23,0.18)]">
                  {customer ? (
                    <div>
                      <div className="flex items-center gap-3">
                        <img src={customer.avatar_url} alt={customer.display_name} className="h-11 w-11 rounded-full object-cover" />
                        <div className="min-w-0">
                          <p className="truncate font-bold text-[#361F17]">{customer.display_name}</p>
                          <p className="truncate text-xs text-[#716942]">{customer.email}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setHistoryModalOpen(true);
                          setLoginOpen(false);
                        }}
                        className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#361F17] font-bold text-[#FBEEE5] hover:bg-[#716942] transition-colors text-sm"
                      >
                        <ShoppingCart className="h-4 w-4" />
                        Lịch sử đơn hàng & vé
                      </button>
                      <button
                        type="button"
                        onClick={logoutCustomer}
                        className="mt-2 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-[#361F17] font-bold text-[#361F17]"
                      >
                        <LogOut className="h-4 w-4" />
                        Đăng xuất demo
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-sm font-bold text-[#361F17]">Đăng nhập nhanh để tự điền checkout và review</p>
                      <SocialLoginButton label="Tiếp tục với Google" icon={<Mail className="h-4 w-4" />} onClick={() => loginWithProvider('google')} />
                      <SocialLoginButton label="Tiếp tục với Facebook" icon={<Facebook className="h-4 w-4" />} onClick={() => loginWithProvider('facebook')} />
                      <SocialLoginButton label="Tiếp tục với Zalo" icon={<span className="text-xs font-black">Z</span>} onClick={() => loginWithProvider('zalo')} />
                    </div>
                  )}
                </div>
              )}
            </div>

            <Link
              to="/workshop"
              className="hidden items-center rounded-full bg-[#361F17] px-7 py-2 font-bold text-white xl:flex"
            >
              Đặt lịch
            </Link>

            <button
              className="rounded-lg p-2 transition-colors hover:bg-[#EFE2D6] lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Đóng menu' : 'Mở menu'}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6 text-[#361F17]" />
              ) : (
                <Menu className="h-6 w-6 text-[#361F17]" />
              )}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <nav className="border-t border-[#716942]/30 py-4 lg:hidden">
            <div className="flex flex-col space-y-3">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={getNavClassName(item.to)}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </NavLink>
              ))}
              <Link
                to="/workshop"
                className="inline-flex h-11 items-center justify-center rounded-full bg-[#361F17] px-5 font-bold text-white"
                onClick={() => setMobileMenuOpen(false)}
              >
                Đặt lịch
              </Link>
              {!customer && (
                <button
                  type="button"
                  onClick={() => {
                    loginWithProvider('google');
                    setMobileMenuOpen(false);
                  }}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[#361F17] px-4 font-bold text-[#361F17]"
                >
                  <UserCircle className="h-5 w-5" />
                  Đăng nhập demo
                </button>
              )}
            </div>
          </nav>
        )}
      </div>

      <ProgressRule />
      {historyModalOpen &&
        createPortal(
          <OrderHistoryModal onClose={() => setHistoryModalOpen(false)} />,
          document.body,
        )}
    </header>
  );
}

function SocialLoginButton({ label, icon, onClick }: { label: string; icon: ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-11 w-full items-center gap-3 rounded-lg border border-[#E2CDBD] bg-white px-3 text-left font-bold text-[#361F17] hover:bg-[#EFE2D6]"
    >
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#361F17] text-white">{icon}</span>
      {label}
    </button>
  );
}

function OrderHistoryModal({ onClose }: { onClose: () => void }) {
  const [records, setRecords] = useState<ApiTracking[]>([]);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedRecordToCancel, setSelectedRecordToCancel] = useState<ApiTracking | null>(null);

  const loadRecords = () => {
    setRecords(readLocalTrackingRecords());
  };

  useEffect(() => {
    loadRecords();
    window.addEventListener('tho-tracking-records-changed', loadRecords);
    return () => window.removeEventListener('tho-tracking-records-changed', loadRecords);
  }, []);

  const handleCancelClick = (record: ApiTracking) => {
    setSelectedRecordToCancel(record);
    setCancelModalOpen(true);
  };

  const handleConfirmCancel = () => {
    if (!selectedRecordToCancel) return;
    const updated = cancelLocalTrackingRecord(selectedRecordToCancel.code);
    if (updated) {
      toast.success(`Đã hủy thành công đơn/vé ${updated.code}!`);
      loadRecords();
    } else {
      toast.error('Không thể thực hiện hủy đơn lúc này.');
    }
    setCancelModalOpen(false);
    setSelectedRecordToCancel(null);
  };

  return (
    <div className="fixed inset-0 z-[9999] grid place-items-center bg-black/60 px-4 py-8 overflow-y-auto">
      <div className="w-full max-w-[720px] rounded-2xl bg-[#FBEEE5] border border-[#E2CDBD] shadow-2xl overflow-hidden flex flex-col my-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E2CDBD] bg-white p-5">
          <div>
            <h3 className="text-xl font-bold text-[#361F17] flex items-center gap-2">
              📜 Lịch sử mua hàng & Đặt chỗ
            </h3>
            <p className="text-xs text-muted-foreground mt-1">Danh sách các đơn hàng và vé đã đặt của bạn.</p>
          </div>
          <button onClick={onClose} className="rounded-full p-2 hover:bg-[#EFE2D6]" aria-label="Đóng lịch sử" type="button">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {records.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-[#EFD8C7]">
              <ShoppingCart className="h-12 w-12 text-[#716942] mx-auto mb-3 opacity-60" />
              <p className="text-foreground font-bold">Chưa có đơn hàng hoặc vé nào</p>
              <p className="text-xs text-muted-foreground mt-1">Các đơn hàng hoặc vé đã thanh toán sẽ tự động xuất hiện ở đây.</p>
            </div>
          ) : (
            records.map((record) => {
              const isCancelled = record.status === 'cancelled';
              const isOrder = record.tracking_type === 'order' || record.tracking_type === 'custom';

              return (
                <div key={record.code} className="bg-white p-4 rounded-xl border border-[#EFD8C7] hover:shadow-sm transition-shadow">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 border-b border-[#F7F1EC] pb-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-sm font-bold text-[#361F17]">{record.code}</span>
                        <span className={`text-[10px] rounded-full px-2 py-0.5 font-bold ${
                          isCancelled
                            ? 'bg-red-100 text-red-700'
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {isCancelled ? 'Đã hủy' : record.status}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Thời gian đặt: {record.createdAt ? new Date(record.createdAt).toLocaleString('vi-VN') : 'Đang cập nhật'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/tracking?code=${record.code}`}
                        onClick={onClose}
                        className="text-xs bg-[#716942]/10 text-[#716942] hover:bg-[#716942]/20 font-bold px-3 py-1.5 rounded-lg transition-colors"
                      >
                        Theo dõi hành trình →
                      </Link>
                      {!isCancelled && (
                        <button
                          type="button"
                          onClick={() => handleCancelClick(record)}
                          className="text-xs bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 font-bold px-3 py-1.5 rounded-lg transition-colors"
                        >
                          Hủy đơn
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Items list */}
                  {record.items && record.items.length > 0 && (
                    <div className="space-y-2">
                      {record.items.map((item) => (
                        <div key={item.id} className="flex items-center gap-3 bg-[#FFF8F2] p-2 rounded-lg border border-[#EFD8C7] text-xs">
                          <div className="h-10 w-10 overflow-hidden rounded-[6px] border border-[#EFD8C7] flex-shrink-0 bg-[#EFE2D6]">
                            <img
                              src={item.image || 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&q=80&w=200'}
                              alt={item.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-[#361F17] truncate">{item.name}</p>
                            <p className="text-muted-foreground mt-0.5">
                              {item.type === 'workshop' ? `${item.date} · ${item.time} · ${item.tickets} vé` : `${item.price.toLocaleString('vi-VN')}đ · SL: ${item.quantity}`}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {cancelModalOpen && selectedRecordToCancel && (
        <CancelConfirmationModal
          record={selectedRecordToCancel}
          onClose={() => {
            setCancelModalOpen(false);
            setSelectedRecordToCancel(null);
          }}
          onConfirm={handleConfirmCancel}
        />
      )}
    </div>
  );
}
