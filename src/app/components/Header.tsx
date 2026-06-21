import { Link, NavLink, useLocation } from 'react-router';
import { Facebook, LogOut, Mail, Menu, ShoppingCart, UserCircle, X } from 'lucide-react';
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
                        onClick={logoutCustomer}
                        className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-[#361F17] font-bold text-[#361F17]"
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
