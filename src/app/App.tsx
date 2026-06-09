import { BrowserRouter, Routes, Route, useLocation } from 'react-router';
import { useEffect } from 'react';
import { Toaster } from 'sonner';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './components/HomePage';
import { WorkshopPage } from './components/WorkshopPage';
import { ProductPage } from './components/ProductPage';
import { WorkshopDetailPage } from './components/WorkshopDetailPage';
import { ProductDetailPage } from './components/ProductDetailPage';
import { AboutPage } from './components/AboutPage';
import { ReviewPage } from './components/ReviewPage';
import { CartPage } from './components/CartPage';
import { CheckoutPage } from './components/CheckoutPage';
import { WorkshopCustomizer } from './components/WorkshopCustomizer';
import { PaymentSuccess } from './components/PaymentSuccess';
import { PaymentFailure } from './components/PaymentFailure';
import { TrackingPage } from './components/TrackingPage';
import { FigmaExportPage } from './components/FigmaExportPage';
import { PolicyPage } from './components/PolicyPage';
import { StaffAdminPage } from './components/StaffAdminPage';
import { FloatingWorkshopChatbot } from './components/FloatingWorkshopChatbot';
import { ProductCartProvider } from './contexts/ProductCartContext';
import { WorkshopCartProvider } from './contexts/WorkshopCartContext';

export default function App() {
  return (
    <ProductCartProvider>
      <WorkshopCartProvider>
        <BrowserRouter>
          <AppLayout />
          <Toaster position="top-right" duration={3000} richColors closeButton />
        </BrowserRouter>
      </WorkshopCartProvider>
    </ProductCartProvider>
  );
}

/** Scroll to top on every route change */
function ScrollToTop() {
  const { hash, pathname } = useLocation();
  useEffect(() => {
    if (hash) {
      window.setTimeout(() => {
        document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 80);
      return;
    }

    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [hash, pathname]);
  return null;
}

function MotionEnhancer() {
  const { pathname } = useLocation();

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let observer: IntersectionObserver | null = null;
    const timeout = window.setTimeout(() => {
      const targets = Array.from(
        document.querySelectorAll<HTMLElement>(
          'main section, .motion-section, .product-card, .workshop-card, article',
        ),
      ).filter((element) => !element.closest('[data-no-reveal="true"]'));

      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              observer.unobserve(entry.target);
            }
          });
        },
        { rootMargin: '0px 0px -10% 0px', threshold: 0.12 },
      );

      targets.forEach((element, index) => {
        element.classList.add('reveal-on-scroll');
        element.style.setProperty('--reveal-delay', `${Math.min(index % 8, 6) * 55}ms`);
        observer?.observe(element);
      });
    }, 60);

    return () => {
      window.clearTimeout(timeout);
      observer?.disconnect();
    };
  }, [pathname]);

  return null;
}

function AppLayout() {
  const location = useLocation();
  const checkoutFlow = ['/cart', '/checkout', '/success', '/payment-failed'].includes(location.pathname);
  const exportFlow = location.pathname === '/figma-export';
  const staffFlow = location.pathname.startsWith('/staff') || location.pathname.startsWith('/admin');

  return (
    <div
      className="min-h-screen flex flex-col bg-background"
      style={checkoutFlow ? { background: '#F7F1EC' } : undefined}
    >
      <ScrollToTop />
      <MotionEnhancer />
      {!checkoutFlow && !exportFlow && !staffFlow && <Header />}
      <main className="flex-1">
        <div key={location.pathname} className="page-transition">
          <Routes location={location}>
            <Route path="/" element={<HomePage />} />
            <Route path="/workshop" element={<WorkshopPage />} />
            <Route path="/workshop/:workshopId" element={<WorkshopDetailPage />} />
            <Route path="/product" element={<ProductPage />} />
            <Route path="/product/:productId" element={<ProductDetailPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/policy" element={<PolicyPage />} />
            <Route path="/review" element={<ReviewPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/workshop-customizer" element={<WorkshopCustomizer />} />
            <Route path="/success" element={<PaymentSuccess />} />
            <Route path="/payment-failed" element={<PaymentFailure />} />
            <Route path="/tracking" element={<TrackingPage />} />
            <Route path="/figma-export" element={<FigmaExportPage />} />
            <Route path="/staff" element={<StaffAdminPage />} />
            <Route path="/staff/login" element={<StaffAdminPage />} />
            <Route path="/staff/dashboard" element={<StaffAdminPage />} />
            <Route path="/staff/booking" element={<StaffAdminPage />} />
            <Route path="/staff/product" element={<StaffAdminPage />} />
            <Route path="/staff/tracking" element={<StaffAdminPage />} />
            <Route path="/admin" element={<StaffAdminPage />} />
            <Route path="/admin/login" element={<StaffAdminPage />} />
            <Route path="/admin/dashboard" element={<StaffAdminPage />} />
            <Route path="/admin/booking" element={<StaffAdminPage />} />
            <Route path="/admin/product" element={<StaffAdminPage />} />
            <Route path="/admin/tracking" element={<StaffAdminPage />} />
          </Routes>
        </div>
      </main>
      {!checkoutFlow && !exportFlow && !staffFlow && <FloatingWorkshopChatbot />}
      {!checkoutFlow && !exportFlow && !staffFlow && <Footer />}
    </div>
  );
}
