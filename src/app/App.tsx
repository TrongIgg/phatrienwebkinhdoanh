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
import { BookingForm } from './components/BookingForm';
import { PaymentSuccess } from './components/PaymentSuccess';
import { PaymentFailure } from './components/PaymentFailure';
import { TrackingPage } from './components/TrackingPage';
import { FigmaExportPage } from './components/FigmaExportPage';
import { PolicyPage } from './components/PolicyPage';
import { CartProvider } from './contexts/CartContext';

export default function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <AppLayout />
        <Toaster position="top-right" duration={3000} richColors closeButton />
      </BrowserRouter>
    </CartProvider>
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

function AppLayout() {
  const location = useLocation();
  const checkoutFlow = ['/cart', '/checkout', '/success', '/payment-failed'].includes(location.pathname);
  const exportFlow = location.pathname === '/figma-export';

  return (
    <div
      className="min-h-screen flex flex-col bg-background"
      style={checkoutFlow ? { background: '#F7F1EC' } : undefined}
    >
      <ScrollToTop />
      {!checkoutFlow && !exportFlow && <Header />}
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
            <Route path="/booking/:workshopId" element={<BookingForm />} />
            <Route path="/success" element={<PaymentSuccess />} />
            <Route path="/payment-failed" element={<PaymentFailure />} />
            <Route path="/tracking" element={<TrackingPage />} />
            <Route path="/figma-export" element={<FigmaExportPage />} />
          </Routes>
        </div>
      </main>
      {!checkoutFlow && !exportFlow && <Footer />}
    </div>
  );
}
