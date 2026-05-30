import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { AlertCircle, ArrowLeft, CreditCard, Loader2, QrCode, ShoppingBag, X } from 'lucide-react';
import { useCart, type CheckoutAddress } from '../contexts/CartContext';
import { AssetImage, CheckoutShell, PolicyBar, workshopImages } from './DesignPrimitives';
import { saveLocalTrackingRecords } from '../lib/trackingStorage';
import type { ApiTracking } from '../lib/api';

type PaymentMethod = 'momo' | 'vnpay';
type FormErrors = Partial<Record<keyof CheckoutAddress, string>>;

const ADDRESS_STORAGE_KEY = 'tho-address-suggestions';
const defaultAddress: CheckoutAddress = { name: '', phone: '', email: '', city: '', district: '', ward: '', address: '', note: '', shipping: 'standard' };
const addressCatalog = {
  cities: ['TP. Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng'],
  districts: ['Thủ Đức', 'Quận 1', 'Bình Thạnh', 'Hoàn Kiếm', 'Ba Đình', 'Hải Châu'],
  wards: ['Linh Trung', 'Linh Chiểu', 'Bến Nghé', 'Đa Kao', 'Tràng Tiền', 'Mỹ An'],
};

function readSavedAddresses() {
  try {
    const stored = window.localStorage.getItem(ADDRESS_STORAGE_KEY);
    return stored ? (JSON.parse(stored) as CheckoutAddress[]) : [];
  } catch {
    return [];
  }
}

function saveAddressSuggestion(address: CheckoutAddress) {
  const existing = readSavedAddresses();
  const fingerprint = `${address.address}-${address.ward}-${address.district}-${address.city}`.toLowerCase();
  const next = [address, ...existing.filter((item) => `${item.address}-${item.ward}-${item.district}-${item.city}`.toLowerCase() !== fingerprint)].slice(0, 4);
  window.localStorage.setItem(ADDRESS_STORAGE_KEY, JSON.stringify(next));
}

export function CheckoutPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { items, total, clearCart, removeItem, setOrderData } = useCart();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('momo');
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [autoPayHandled, setAutoPayHandled] = useState(false);
  const [formData, setFormData] = useState<CheckoutAddress>(() => {
    try {
      const bookingContact = window.sessionStorage.getItem('tho-booking-contact');
      return bookingContact ? { ...defaultAddress, ...JSON.parse(bookingContact), shipping: 'none' } : defaultAddress;
    } catch {
      return defaultAddress;
    }
  });

  const workshopItems = items.filter((item) => item.type === 'workshop');
  const productItems = items.filter((item) => item.type === 'product');
  const hasProducts = productItems.length > 0;
  const productCount = productItems.reduce((sum, item) => sum + item.quantity, 0);
  const shippingFee = hasProducts ? 35000 : 0;
  const payableTotal = total + shippingFee;
  const savedAddressSuggestions = useMemo(() => (typeof window === 'undefined' ? [] : readSavedAddresses()), []);

  const updateField = (field: keyof CheckoutAddress, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const nextErrors: FormErrors = {};
    const phone = formData.phone.replace(/[\s.-]/g, '');
    if (!formData.name.trim()) nextErrors.name = 'Vui lòng nhập họ tên.';
    if (!/^(0\d{9}|\+84\d{9})$/.test(phone)) nextErrors.phone = 'Số điện thoại cần có dạng 09xxxxxxxx hoặc +84xxxxxxxxx.';
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) nextErrors.email = 'Email chưa đúng định dạng.';
    if (hasProducts) {
      if (!formData.city.trim()) nextErrors.city = 'Vui lòng nhập Tỉnh/TP.';
      if (!formData.district.trim()) nextErrors.district = 'Vui lòng nhập Quận/Huyện.';
      if (!formData.ward.trim()) nextErrors.ward = 'Vui lòng nhập Phường/Xã.';
      if (!formData.address.trim()) nextErrors.address = 'Vui lòng nhập địa chỉ chi tiết.';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    window.setTimeout(() => {
      setSubmitting(false);
      setPaymentOpen(true);
    }, 450);
  };

  useEffect(() => {
    if (autoPayHandled || searchParams.get('autopay') !== 'workshop' || items.length === 0) return;
    setAutoPayHandled(true);
    window.setTimeout(() => {
      if (validate()) setPaymentOpen(true);
    }, 300);
  }, [autoPayHandled, items.length, searchParams]);

  const finishPayment = () => {
    const orderCode = `${workshopItems.length && !hasProducts ? 'WS' : 'ORD'}${Date.now().toString().slice(-8)}`;
    const customer = hasProducts ? formData : { ...formData, city: '', district: '', ward: '', address: '', shipping: 'none' };
    const trackingRecords: ApiTracking[] = [
      {
        code: orderCode,
        tracking_type: orderCode.startsWith('WS') ? 'workshop' : 'order',
        status: orderCode.startsWith('WS') ? 'confirmed' : 'paid_waiting_pack',
        title: orderCode.startsWith('WS') ? 'Vé workshop THỔ Studio' : 'Đơn hàng THỔ Studio',
        message: orderCode.startsWith('WS')
          ? 'Vé đã xác nhận. QR check-in đã gửi qua email/SMS.'
          : 'Đơn hàng đã thanh toán và đang chờ studio đóng gói.',
        manager_name: orderCode.startsWith('WS') ? 'Anh Quân' : 'Chị Linh',
        participant_count: workshopItems.reduce((sum, item) => sum + item.tickets, 0) || null,
        checkin_status: orderCode.startsWith('WS') ? 'pending' : null,
        timeline: orderCode.startsWith('WS')
          ? [
              { stage: 'paid', label: 'Đã thanh toán', state: 'done' },
              { stage: 'qr_sent', label: 'Đã gửi QR check-in', state: 'current' },
              { stage: 'checked_in', label: 'Chờ check-in tại studio', state: 'waiting' },
            ]
          : [
              { stage: 'paid', label: 'Đã thanh toán', state: 'done' },
              { stage: 'packing', label: 'Chờ đóng gói', state: 'current' },
              { stage: 'waiting_carrier', label: 'Đợi đơn vị vận chuyển', state: 'waiting' },
              { stage: 'delivering', label: 'Đang giao', state: 'waiting' },
              { stage: 'received', label: 'Đã nhận', state: 'waiting' },
            ],
      },
    ];

    workshopItems.forEach((item, index) => {
      trackingRecords.push({
        code: `CER${orderCode.slice(-6)}-${index + 1}`,
        tracking_type: 'ceramic',
        status: 'waiting_workshop',
        title: `Thành phẩm ${item.name}`,
        message: 'Đang chờ ngày workshop. Sau khi check-in, studio sẽ cập nhật tạo hình, phơi, nung và tráng men.',
        manager_name: 'Chị Linh',
        participant_count: item.tickets,
        checkin_status: 'pending',
        timeline: [
          { stage: 'booking_paid', label: 'Đã thanh toán workshop', state: 'done' },
          { stage: 'waiting_workshop', label: 'Chờ tham gia workshop', state: 'current' },
          { stage: 'forming', label: 'Tạo hình tại studio', state: 'waiting' },
          { stage: 'drying', label: 'Phơi khô', state: 'waiting' },
          { stage: 'bisque_firing', label: 'Nung sơ', state: 'waiting' },
          { stage: 'glazing', label: 'Tráng men', state: 'waiting' },
        ],
      });
    });

    saveLocalTrackingRecords(trackingRecords);
    setOrderData({
      orderCode,
      items: items.map((item) => ({ ...item })),
      subtotal: total,
      shippingFee,
      total: payableTotal,
      customer,
      createdAt: new Date().toISOString(),
      paymentMethod,
    });
    if (hasProducts) saveAddressSuggestion(formData);
    clearCart();
    navigate('/success');
  };

  const cancelPayment = () => {
    workshopItems.forEach((item) => removeItem(item.id));
    navigate('/payment-failed');
  };

  if (items.length === 0) {
    return (
      <CheckoutShell active={2}>
        <section className="mx-auto max-w-[920px] px-6 py-16">
          <button onClick={() => navigate(-1)} className="back-btn mb-8" type="button"><ArrowLeft className="h-4 w-4" />Quay lại</button>
          <div className="empty-state rounded-[24px] border-2 border-[#EFD8C7] bg-[#FFF1E8]">
            <ShoppingBag className="mb-7 h-16 w-16 text-[#716942]" />
            <h1 className="text-4xl font-bold text-[#2B211D]">Chưa có sản phẩm để thanh toán</h1>
            <Link to="/cart" className="mt-9 rounded-full bg-[#3A1F17] px-8 py-3 font-semibold text-white">Quay lại giỏ hàng</Link>
          </div>
        </section>
        <PolicyBar />
      </CheckoutShell>
    );
  }

  return (
    <CheckoutShell active={2}>
      <section className="mx-auto max-w-[1440px] px-6 py-12 lg:px-20">
        <button onClick={() => navigate('/cart')} className="back-btn mb-8" type="button"><ArrowLeft className="h-4 w-4" />Quay lại giỏ hàng</button>
        <h1 className="text-center text-[35px] font-bold text-[#252323]">THANH TOÁN</h1>
        <p className="mt-3 text-center text-lg text-[#6A4A3D]">Workshop và sản phẩm vật lý được xử lý thành các luồng riêng. Booking workshop trực tiếp sẽ không kéo theo sản phẩm khác.</p>

        <form onSubmit={handleSubmit} className="mt-12 grid gap-12 lg:grid-cols-[1fr_0.9fr]">
          <div className="mx-auto w-full max-w-[760px]">
            <h2 className="mb-7 text-lg font-bold uppercase text-[#252323]">Thông tin thanh toán</h2>

            {hasProducts && savedAddressSuggestions.length > 0 && (
              <div className="mb-7 rounded-[16px] border border-[#EFD8C7] bg-[#FFF8F2] p-4">
                <p className="mb-3 text-sm font-bold text-[#6E4E3F]">Địa chỉ đã lưu</p>
                <div className="grid gap-3 md:grid-cols-2">
                  {savedAddressSuggestions.map((address, index) => (
                    <button key={`${address.address}-${index}`} type="button" onClick={() => setFormData(address)} className="rounded-[14px] border border-[#E5CDBA] bg-white p-4 text-left text-sm leading-6 hover:border-[#716942]">
                      <span className="block font-bold">{address.note || `Địa chỉ ${index + 1}`}</span>
                      {address.address}, {address.ward}, {address.district}, {address.city}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-6">
              <Field label="Họ tên" required value={formData.name} error={errors.name} onChange={(value) => updateField('name', value)} />
              <Field label="Số điện thoại" required value={formData.phone} error={errors.phone} onChange={(value) => updateField('phone', value)} />
              <Field label="Địa chỉ email" type="email" value={formData.email} error={errors.email} onChange={(value) => updateField('email', value)} />

              {hasProducts ? (
                <>
                  <div>
                    <label className="mb-2 block font-bold">Địa chỉ giao hàng <span className="text-red-600">*</span></label>
                    <div className="grid gap-3 md:grid-cols-[0.85fr_0.85fr_0.85fr_1.35fr]">
                      <Field bare placeholder="Tỉnh/TP" list="tho-cities" value={formData.city} error={errors.city} onChange={(value) => updateField('city', value)} />
                      <Field bare placeholder="Quận/Huyện" list="tho-districts" value={formData.district} error={errors.district} onChange={(value) => updateField('district', value)} />
                      <Field bare placeholder="Phường/Xã" list="tho-wards" value={formData.ward} error={errors.ward} onChange={(value) => updateField('ward', value)} />
                      <Field bare placeholder="Số nhà, tên đường..." value={formData.address} error={errors.address} onChange={(value) => updateField('address', value)} />
                    </div>
                    <datalist id="tho-cities">{addressCatalog.cities.map((item) => <option key={item} value={item} />)}</datalist>
                    <datalist id="tho-districts">{addressCatalog.districts.map((item) => <option key={item} value={item} />)}</datalist>
                    <datalist id="tho-wards">{addressCatalog.wards.map((item) => <option key={item} value={item} />)}</datalist>
                  </div>
                  <div className="rounded-[16px] border border-[#EFD8C7] bg-[#FFF8F2] p-5 text-[#6E4E3F]">
                    <p className="font-bold text-[#2B211D]">Vận chuyển tiêu chuẩn: 35.000đ</p>
                    <p className="mt-2">Đơn gốm sau workshop được gửi đi sau 3 ngày. Nội thành dự kiến nhận trong khoảng 2 tuần. Hàng vỡ do vận chuyển được xử lý theo chính sách bảo hiểm nếu khách quay video mở hàng.</p>
                  </div>
                </>
              ) : (
                <div className="rounded-[16px] border border-[#EFD8C7] bg-[#FFF8F2] p-5 text-[#6E4E3F]">
                  Vé workshop không cần địa chỉ giao hàng. QR check-in sẽ được gửi qua email/SMS sau khi thanh toán.
                </div>
              )}

              <label className="block">
                <span className="mb-2 block font-bold">Ghi chú đơn hàng</span>
                <textarea value={formData.note} onChange={(event) => updateField('note', event.target.value)} className="min-h-[86px] w-full border border-[#949494] bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-[#716942]/30" />
              </label>
            </div>

            <button type="submit" disabled={submitting} className="mt-10 flex h-12 w-full items-center justify-center bg-black text-sm font-semibold uppercase tracking-wide text-white disabled:opacity-70">
              {submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Đang kiểm tra...</> : 'Đặt hàng'}
            </button>
          </div>

          <aside className="space-y-8">
            <section className="rounded-[14px] border border-black/10 bg-white p-8 shadow-sm">
              <h2 className="text-2xl font-bold uppercase text-[#252323]">Thông tin đơn hàng</h2>
              <div className="mt-8 space-y-4">
                <SummaryLine label="Tạm tính" value={total} />
                <SummaryLine label="Phí vận chuyển" value={shippingFee} />
                <SummaryLine label="Tổng" value={payableTotal} strong />
              </div>
              <div className="mt-8 space-y-4 border-t border-[#E2E2E2] pt-6">
                {items.map((item) => (
                  <div key={item.id} className="rounded-[10px] border border-[#E2E2E2] bg-white p-4">
                    <div className="grid grid-cols-[84px_1fr] gap-4">
                      <AssetImage src={item.type === 'workshop' ? workshopImages.handsWarm : item.image} alt={item.name} className="h-[84px] w-[84px] rounded-[10px]" />
                      <div>
                        <h3 className="font-bold text-[#2B211D]">{item.name}</h3>
                        <p className="mt-2 text-sm text-[#6E4E3F]">{item.type === 'workshop' ? `${item.date} · ${item.time}` : `Số lượng: ${item.quantity}`}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
            <section className="rounded-[14px] border border-black/10 bg-white p-8 shadow-sm">
              <h2 className="text-xl font-bold">Thanh toán</h2>
              <div className="mt-6 grid grid-cols-2 gap-4">
                <PaymentChoice method="momo" active={paymentMethod === 'momo'} onClick={() => setPaymentMethod('momo')} />
                <PaymentChoice method="vnpay" active={paymentMethod === 'vnpay'} onClick={() => setPaymentMethod('vnpay')} />
              </div>
            </section>
          </aside>
        </form>
      </section>
      <PolicyBar />
      {paymentOpen && <PaymentModal method={paymentMethod} total={payableTotal} onClose={() => setPaymentOpen(false)} onSuccess={finishPayment} onFail={cancelPayment} />}
    </CheckoutShell>
  );
}

function Field({ label, value, onChange, type = 'text', required, bare = false, placeholder, error, list }: { label?: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean; bare?: boolean; placeholder?: string; error?: string; list?: string }) {
  const input = (
    <div>
      <input type={type} value={value} list={list} onChange={(event) => onChange(event.target.value)} className={`h-[49px] w-full border bg-white px-4 outline-none focus:ring-2 focus:ring-[#716942]/30 ${error ? 'input-error border-[#A33A2F]' : 'border-[#949494]'}`} placeholder={placeholder} required={required} />
      {error && <p className="field-error"><AlertCircle className="h-3.5 w-3.5" />{error}</p>}
    </div>
  );
  if (bare) return input;
  return <label className="block"><span className="mb-2 block font-bold">{label} {required && <span className="text-red-600">*</span>}</span>{input}</label>;
}

function SummaryLine({ label, value, strong = false }: { label: string; value: number; strong?: boolean }) {
  return <div className={`flex justify-between ${strong ? 'text-2xl font-bold' : 'text-lg'}`}><span>{label}</span><span>{value.toLocaleString('vi-VN')}đ</span></div>;
}

function PaymentChoice({ method, active, onClick }: { method: PaymentMethod; active: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={`flex min-h-[150px] flex-col items-center justify-center rounded-[10px] border text-center transition hover:shadow-md ${active ? 'border-2 border-[#716942]' : 'border-[#D4D4D4]'}`}>
      <CreditCard className="mb-4 h-12 w-12 text-[#716942]" />
      <span className="text-lg italic text-[#727272]">{method === 'momo' ? 'Ví MoMo' : 'QR VNPay'}</span>
    </button>
  );
}

function PaymentModal({ method, total, onClose, onSuccess, onFail }: { method: PaymentMethod; total: number; onClose: () => void; onSuccess: () => void; onFail: () => void }) {
  const [secondsLeft, setSecondsLeft] = useState(5 * 60);
  const isMomo = method === 'momo';

  useEffect(() => {
    const timer = window.setInterval(() => setSecondsLeft((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (secondsLeft === 0) onFail();
  }, [secondsLeft, onFail]);

  const minutes = Math.floor(secondsLeft / 60).toString().padStart(2, '0');
  const seconds = (secondsLeft % 60).toString().padStart(2, '0');

  return (
    <div className="fixed inset-0 z-[80] overflow-y-auto bg-black/55 px-6 py-10">
      <div className={`mx-auto max-w-[1020px] rounded-[14px] bg-[#F7F1EC] shadow-2xl ${isMomo ? 'border-4 border-[#DC1A8D]' : 'border-4 border-[#0088C9]'}`}>
        <div className="flex items-center justify-between border-b border-[#E2E2E2] bg-white p-6">
          <div>
            <h2 className="text-3xl font-bold">{isMomo ? 'Cổng thanh toán MoMo' : 'Cổng thanh toán VNPAY'}</h2>
            <p className="mt-2 text-[#727272]">QR và slot workshop hết hạn sau {minutes}:{seconds}. Hủy thanh toán sẽ trả slot ngay.</p>
          </div>
          <button onClick={onClose} className="rounded-full p-2 hover:bg-[#EFE2D6]" aria-label="Đóng thanh toán" type="button"><X className="h-6 w-6" /></button>
        </div>
        <div className="grid gap-8 p-8 lg:grid-cols-[360px_1fr]">
          <div className="rounded-[10px] bg-white p-7">
            <h3 className="text-2xl font-medium">Thông tin đơn hàng</h3>
            <p className="mt-8 text-[#68788F]">Số tiền thanh toán</p>
            <p className={`mt-2 text-3xl font-semibold ${isMomo ? 'text-[#DC1A8D]' : 'text-[#00489B]'}`}>{total.toLocaleString('vi-VN')} VND</p>
            <p className="mt-8 text-[#68788F]">Countdown</p>
            <p className="mt-2 text-4xl font-bold">{minutes}:{seconds}</p>
          </div>
          <div className={`rounded-[10px] p-8 text-center ${isMomo ? 'bg-[#DC1A8D] text-white' : 'bg-[#F5F7F9] text-black'}`}>
            <h3 className="text-3xl font-medium">Quét mã để thanh toán</h3>
            <div className="mx-auto my-8 flex h-[300px] w-[300px] items-center justify-center rounded-[10px] bg-white">
              <QrCode className={`h-56 w-56 ${isMomo ? 'text-[#DC1A8D]' : 'text-[#0088C9]'}`} />
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button onClick={onFail} className="rounded-full bg-white px-8 py-4 text-black" type="button">Hủy thanh toán</button>
              <button onClick={onSuccess} className="rounded-full bg-black px-8 py-4 text-white" type="button">Đã thanh toán</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
