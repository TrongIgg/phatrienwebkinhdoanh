import { Link, useNavigate } from 'react-router';
import { AlertTriangle, ArrowLeft, RefreshCw } from 'lucide-react';
import { CheckoutShell, PolicyBar } from './DesignPrimitives';

export function PaymentFailure() {
  const navigate = useNavigate();

  return (
    <CheckoutShell active={2}>
      <section className="mx-auto flex min-h-[820px] max-w-[1440px] flex-col items-center justify-center px-6 py-20 text-center">
        <button onClick={() => navigate('/cart')} className="back-btn mb-10 self-start" type="button">
          <ArrowLeft className="h-4 w-4" />
          Quay lại giỏ hàng
        </button>

        <div className="mb-10 flex h-[129px] w-[129px] items-center justify-center rounded-full bg-red-100">
          <AlertTriangle className="h-20 w-20 text-red-600" />
        </div>
        <h1 className="text-[40px] font-extrabold text-black">THANH TOÁN THẤT BẠI!</h1>
        <p className="mt-8 max-w-[790px] text-[21px] leading-8 text-black">
          Đơn hàng chưa thể hoàn tất thanh toán. Nếu bạn vừa hủy QR workshop, slot đã được trả lại ngay để người khác có thể đặt.
        </p>

        <div className="mt-12 flex flex-col gap-6 sm:flex-row">
          <Link to="/cart" className="rounded-full border border-[#3B2118]/25 px-12 py-5 text-xl font-medium text-[#3B2118] hover:bg-[#3B2118] hover:text-white">
            Quay lại giỏ hàng
          </Link>
          <Link to="/checkout" className="inline-flex items-center justify-center gap-3 rounded-full bg-black px-12 py-5 text-xl font-medium text-white">
            <RefreshCw className="h-5 w-5" />
            Thanh toán lại
          </Link>
        </div>
      </section>
      <PolicyBar />
    </CheckoutShell>
  );
}
