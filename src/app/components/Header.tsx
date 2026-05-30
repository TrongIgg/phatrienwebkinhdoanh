import { Link, NavLink } from 'react-router';
import { Menu, Search, ShoppingCart, X } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useCart } from '../contexts/CartContext';
import { logoImage, ProgressRule } from './DesignPrimitives';

const navItems = [
  { label: 'Home', to: '/' },
  { label: 'Workshop', to: '/workshop' },
  { label: 'Product', to: '/product' },
  { label: 'Tracking', to: '/tracking' },
  { label: 'About Us', to: '/about' },
  { label: 'Review sản phẩm', to: '/review#review-form' },
];

export function Header() {
  const { items } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [badgePulse, setBadgePulse] = useState(false);
  const prevCountRef = useRef(0);

  const itemCount = items.reduce((sum, item) => {
    if (item.type === 'workshop') return sum + item.tickets;
    return sum + item.quantity;
  }, 0);

  // Pulse animation when item count changes
  useEffect(() => {
    if (itemCount > prevCountRef.current) {
      setBadgePulse(true);
      const timer = setTimeout(() => setBadgePulse(false), 400);
      return () => clearTimeout(timer);
    }
    prevCountRef.current = itemCount;
  }, [itemCount]);

  const getNavClassName = ({ isActive }: { isActive: boolean }) =>
    `text-[20px] font-bold transition-colors ${
      isActive ? 'text-[#716942]' : 'text-[#361F17] hover:text-[#716942]'
    }`;

  return (
    <header className="sticky top-0 z-50 bg-[#FBEEE5]/95 backdrop-blur supports-[backdrop-filter]:bg-[#FBEEE5]/85">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
        <div className="flex h-24 items-center justify-between gap-6">
          <Link to="/" className="flex items-center" onClick={() => setMobileMenuOpen(false)} aria-label="THỔ Studio">
            <img src={logoImage} alt="THỔ Studio logo" className="h-16 w-16 rounded-full object-cover shadow-sm" />
          </Link>

          <nav className="hidden items-center space-x-8 lg:flex">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} className={getNavClassName}>
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/product"
              className="hidden h-11 w-11 items-center justify-center rounded-full hover:bg-[#EFE2D6] lg:flex"
              aria-label="Tìm sản phẩm"
            >
              <Search className="h-5 w-5 text-[#361F17]" />
            </Link>

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

            <a
              href="tel:0912784507"
              className="hidden items-center rounded-full bg-[#361F17] px-7 py-2 font-bold text-white xl:flex"
            >
              Booking
            </a>

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
                  className={getNavClassName}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </NavLink>
              ))}
              <a href="tel:0912784507" className="text-[20px] font-bold text-[#361F17]">
                0912784507
              </a>
            </div>
          </nav>
        )}
      </div>

      <ProgressRule />
    </header>
  );
}
