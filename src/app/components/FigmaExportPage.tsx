import type { ComponentType, ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { HomePage } from './HomePage';
import { WorkshopPage } from './WorkshopPage';
import { ProductPage } from './ProductPage';
import { AboutPage } from './AboutPage';
import { ReviewPage } from './ReviewPage';
import { TrackingPage } from './TrackingPage';
import { CartPage } from './CartPage';
import { CheckoutPage } from './CheckoutPage';
import { BookingForm } from './BookingForm';
import { PaymentSuccess } from './PaymentSuccess';
import { PaymentFailure } from './PaymentFailure';

type Screen = {
  id: string;
  title: string;
  route: string;
  kind: 'site' | 'checkout' | 'standalone';
  component: ComponentType;
};

const screens: Screen[] = [
  { id: 'home', title: 'Home Page', route: '/', kind: 'site', component: HomePage },
  { id: 'workshop', title: 'Workshop Listing', route: '/workshop', kind: 'site', component: WorkshopPage },
  { id: 'product', title: 'Product Page', route: '/product', kind: 'site', component: ProductPage },
  { id: 'tracking', title: 'Tracking Page', route: '/tracking', kind: 'site', component: TrackingPage },
  { id: 'about', title: 'About Page', route: '/about', kind: 'site', component: AboutPage },
  { id: 'review', title: 'Review Page', route: '/review', kind: 'site', component: ReviewPage },
  { id: 'cart', title: 'Cart Page', route: '/cart', kind: 'checkout', component: CartPage },
  { id: 'checkout', title: 'Checkout Page', route: '/checkout', kind: 'checkout', component: CheckoutPage },
  { id: 'success', title: 'Payment Success', route: '/success', kind: 'checkout', component: PaymentSuccess },
  { id: 'failure', title: 'Payment Failure', route: '/payment-failed', kind: 'checkout', component: PaymentFailure },
];

export function FigmaExportPage() {
  return (
    <div className="figma-export-page min-h-screen overflow-x-auto bg-[#ECE7E2] py-10 text-[#241B16]">
      <div className="mx-auto w-[1440px]">
        <header className="mb-8 border-b border-[#C8BAB0] pb-6">
          <p className="text-sm uppercase tracking-[0.18em] text-[#796B5F]">Figma import board</p>
          <h1 className="mt-3 text-[44px] font-semibold leading-none">THO Website Screens</h1>
          <p className="mt-4 max-w-[780px] text-lg leading-7 text-[#6E5D51]">
            Import this URL with html.to.design to capture multiple editable screens in one pass.
          </p>
        </header>

        <div className="space-y-16">
          {screens.map((screen) => {
            const ScreenComponent = screen.component;
            return (
              <ExportFrame key={screen.id} title={screen.title} route={screen.route} kind={screen.kind}>
                {screen.kind === 'site' ? (
                  <>
                    <Header />
                    <main>
                      <ScreenComponent />
                    </main>
                    <Footer />
                  </>
                ) : (
                  <ScreenComponent />
                )}
              </ExportFrame>
            );
          })}

          <ExportFrame title="Booking Form" route="/booking/1" kind="standalone">
            <BookingForm workshopIdOverride="1" />
          </ExportFrame>
        </div>
      </div>
    </div>
  );
}

function ExportFrame({
  title,
  route,
  kind,
  children,
}: {
  title: string;
  route: string;
  kind: Screen['kind'];
  children: ReactNode;
}) {
  return (
    <section className="figma-export-frame" data-screen={route}>
      <div className="mb-3 flex items-center justify-between rounded-t-lg bg-[#2D211B] px-5 py-3 text-[#FFF8F2]">
        <h2 className="text-lg font-semibold">{title}</h2>
        <span className="text-sm text-[#D7C5B7]">{route}</span>
      </div>
      <div
        className={`overflow-hidden border border-[#CDBFB5] shadow-[0_20px_60px_rgba(55,39,31,0.16)] ${
          kind === 'checkout' || kind === 'standalone' ? 'bg-[#F7F1EC]' : 'bg-[#FBEEE5]'
        }`}
      >
        {children}
      </div>
    </section>
  );
}
