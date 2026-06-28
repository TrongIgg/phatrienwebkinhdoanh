import { FormEvent, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useSearchParams } from 'react-router';
import { AlertCircle, ArrowLeft, CreditCard, Loader2, QrCode, ShoppingBag, Tag, TimerReset, X } from 'lucide-react';
import { useProductCart, type CheckoutAddress } from '../contexts/ProductCartContext';
import { useWorkshopCart } from '../contexts/WorkshopCartContext';
import { AssetImage, CheckoutShell, PolicyBar, workshopImages } from './DesignPrimitives';
import { type ApiTracking } from '../lib/api';
import { readCustomerSession } from '../lib/customerExperience';

// ─── Types ───────────────────────────────────────────────────────────────────

export type OrderPayload = {
  orderCode: string;
  checkoutItems: CheckoutItem[];
  subtotal: number;
  shippingFee: number;
  total: number;
  customer: CheckoutAddress;
  paymentMethod: PaymentMethod;
  hasWorkshopCheckout: boolean;
  hasProducts: boolean;
  selectedProductIds: string[];
  selectedWorkshopIds: string[];
  trackingRecords: ApiTracking[];
};

type PaymentMethod = 'momo' | 'vnpay';
type FormErrors = Partial<Record<keyof CheckoutAddress, string>>;
type CheckoutItem = {
  id: string;
  name: string;
  price: number;
  type: 'product' | 'workshop';
  quantity?: number;
  tickets?: number;
  date?: string;
  time?: string;
  image?: string;
  gift?: { occasion: string; includeWrapping: boolean; giftNote: string; personalNote: string };
  custom?: {
    shape: string;
    glaze: string;
    features: string[];
    engraving?: string;
    brief?: string;
    multiplier: number;
    basePrice: number;
    artisanLeadDays: number;
  };
};

// ─── Constants ────────────────────────────────────────────────────────────────

const ADDRESS_STORAGE_KEY = 'tho-address-suggestions';
const CHECKOUT_PRODUCT_IDS_KEY = 'tho-checkout-product-ids';
const CHECKOUT_WORKSHOP_IDS_KEY = 'tho-checkout-workshop-ids';
const BOOKING_CONTACT_STORAGE_KEY = 'tho-booking-contact';

const defaultAddress: CheckoutAddress = {
  name: '', phone: '', email: '', city: '', district: '', ward: '',
  address: '', note: '', shipping: 'standard',
};

const addressCatalog = {
  cities: [
    'An Giang',
    'Bà Rịa - Vũng Tàu',
    'Bắc Giang',
    'Bắc Kạn',
    'Bạc Liêu',
    'Bắc Ninh',
    'Bến Tre',
    'Bình Định',
    'Bình Dương',
    'Bình Phước',
    'Bình Thuận',
    'Cà Mau',
    'Cần Thơ',
    'Cao Bằng',
    'Đà Nẵng',
    'Đắk Lắk',
    'Đắk Nông',
    'Điện Biên',
    'Đồng Nai',
    'Đồng Tháp',
    'Gia Lai',
    'Hà Giang',
    'Hà Nam',
    'Hà Nội',
    'Hà Tĩnh',
    'Hải Dương',
    'Hải Phòng',
    'Hậu Giang',
    'Hòa Bình',
    'Hưng Yên',
    'Khánh Hòa',
    'Kiên Giang',
    'Kon Tum',
    'Lai Châu',
    'Lâm Đồng',
    'Lạng Sơn',
    'Lào Cai',
    'Long An',
    'Nam Định',
    'Nghệ An',
    'Ninh Bình',
    'Ninh Thuận',
    'Phú Thọ',
    'Phú Yên',
    'Quảng Bình',
    'Quảng Nam',
    'Quảng Ngãi',
    'Quảng Ninh',
    'Quảng Trị',
    'Sóc Trăng',
    'Sơn La',
    'Tây Ninh',
    'Thái Bình',
    'Thái Nguyên',
    'Thanh Hóa',
    'Thừa Thiên Huế',
    'Tiền Giang',
    'TP. Hồ Chí Minh',
    'Trà Vinh',
    'Tuyên Quang',
    'Vĩnh Long',
    'Vĩnh Phúc',
    'Yên Bái'
  ],
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

// ─── Main Component ───────────────────────────────────────────────────────────

export function CheckoutPage({
  onPaymentSuccess,
  onPaymentCancel,
}: {
  /** Gọi sau khi user xác nhận thanh toán — page layer xử lý API, clear cart, navigate */
  onPaymentSuccess: (payload: OrderPayload) => Promise<void>;
  /** Gọi khi user hủy thanh toán hoặc giờ giữ slot hết */
  onPaymentCancel: (selectedWorkshopIds: string[]) => void;
}) {
  const [searchParams] = useSearchParams();
  const { productItems } = useProductCart();
  const { workshopItems } = useWorkshopCart();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('momo');
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [now, setNow] = useState(Date.now());
  const [voucherInput, setVoucherInput] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState<{ code: string; discountPercent: number } | null>(null);
  const [voucherError, setVoucherError] = useState('');

  const [formData, setFormData] = useState<CheckoutAddress>(() => {
    const customer = readCustomerSession();
    const customerDefaults = customer
      ? { name: customer.display_name, phone: customer.phone, email: customer.email }
      : {};
    try {
      const bookingContact = window.localStorage.getItem(BOOKING_CONTACT_STORAGE_KEY);
      return bookingContact
        ? { ...defaultAddress, ...customerDefaults, ...JSON.parse(bookingContact), shipping: 'none' }
        : { ...defaultAddress, ...customerDefaults };
    } catch {
      return { ...defaultAddress, ...customerDefaults };
    }
  });
  const [apiProvinces, setApiProvinces] = useState<{ name: string; code: number }[]>([]);
  const [apiWards, setApiWards] = useState<{ name: string; code: number }[]>([]);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);

  useEffect(() => {
    const fetchProvinces = async () => {
      setLoadingProvinces(true);
      try {
        const res = await fetch('/api/v2/p/');
        if (!res.ok) throw new Error('API failed');
        const data = await res.json();
        if (Array.isArray(data)) {
          const sorted = data
            .map((p: any) => ({ name: p.name, code: p.code }))
            .sort((a, b) => a.name.localeCompare(b.name, 'vi'));
          setApiProvinces(sorted);
        } else {
          throw new Error('Not an array');
        }
      } catch (err) {
        console.warn('Provinces API failed, using fallback list', err);
        setApiProvinces(addressCatalog.cities.map((name) => ({ name, code: 0 })));
      } finally {
        setLoadingProvinces(false);
      }
    };
    fetchProvinces();
  }, []);

  // Fetch wards when city changes
  useEffect(() => {
    if (!formData.city || apiProvinces.length === 0) return;
    const selectedProv = apiProvinces.find((p) => p.name === formData.city);
    if (selectedProv && selectedProv.code > 0) {
      const fetchWards = async () => {
        setLoadingWards(true);
        try {
          const res = await fetch(`/api/v2/w/?province=${selectedProv.code}`);
          if (!res.ok) throw new Error('Wards API failed');
          const data = await res.json();
          if (Array.isArray(data)) {
            const sorted = data
              .map((w: any) => ({ name: w.name, code: w.code }))
              .sort((a, b) => a.name.localeCompare(b.name, 'vi'));
            setApiWards(sorted);
          }
        } catch (err) {
          console.warn('Wards API failed', err);
        } finally {
          setLoadingWards(false);
        }
      };
      fetchWards();
    }
  }, [formData.city, apiProvinces]);

  const handleCityChange = (cityName: string) => {
    updateField('city', cityName);
    updateField('ward', ''); // Reset ward on city change
    setApiWards([]);
  };

  // ── Selection ────────────────────────────────────────────────────────────

  const selectedProductIds = useMemo(() => {
    if (typeof window === 'undefined') return productItems.map((item) => item.id);
    try {
      const stored = window.sessionStorage.getItem(CHECKOUT_PRODUCT_IDS_KEY);
      const parsed = stored ? (JSON.parse(stored) as string[]) : productItems.map((item) => item.id);
      const existingIds = productItems.map((item) => item.id);
      return parsed.filter((id) => existingIds.includes(id));
    } catch {
      return productItems.map((item) => item.id);
    }
  }, [productItems]);

  const selectedWorkshopIds = useMemo(() => {
    if (typeof window === 'undefined') return workshopItems.map((item) => item.id);
    if (searchParams.get('autopay') === 'workshop') return workshopItems.map((item) => item.id);
    try {
      const stored = window.sessionStorage.getItem(CHECKOUT_WORKSHOP_IDS_KEY);
      const parsed = stored ? (JSON.parse(stored) as string[]) : workshopItems.map((item) => item.id);
      const existingIds = workshopItems.map((item) => item.id);
      return parsed.filter((id) => existingIds.includes(id));
    } catch {
      return workshopItems.map((item) => item.id);
    }
  }, [searchParams, workshopItems]);

  // ── Derived state ────────────────────────────────────────────────────────

  const checkoutProductItems = productItems.filter((item) => selectedProductIds.includes(item.id));
  const checkoutProductTotal = checkoutProductItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const checkoutHasCustomProducts = checkoutProductItems.some((item) => item.custom);
  const checkoutWorkshopItems = workshopItems.filter((item) => selectedWorkshopIds.includes(item.id));
  const checkoutWorkshopTotal = checkoutWorkshopItems.reduce((sum, item) => sum + item.price * item.tickets, 0);

  const checkoutMode = searchParams.get('mode');
  const isWorkshopCheckout =
    searchParams.get('autopay') === 'workshop' ||
    (checkoutWorkshopItems.length > 0 && checkoutProductItems.length === 0 && checkoutMode !== 'product');
  const isCombinedCheckout = checkoutMode === 'combined';
  const includesWorkshops = isWorkshopCheckout || isCombinedCheckout;
  const includesProducts = !isWorkshopCheckout || isCombinedCheckout || checkoutMode === 'product';

  const checkoutItems: CheckoutItem[] = [
    ...(includesWorkshops ? checkoutWorkshopItems : []),
    ...(includesProducts ? checkoutProductItems : []),
  ];
  const hasWorkshopCheckout = includesWorkshops && checkoutWorkshopItems.length > 0;
  const hasProducts = includesProducts && checkoutProductItems.length > 0;
  const checkoutSubtotal = (hasWorkshopCheckout ? checkoutWorkshopTotal : 0) + (hasProducts ? checkoutProductTotal : 0);
  const giftFee = checkoutProductItems.filter((item) => item.gift).reduce((sum, item) => sum + 50000 * (item.quantity || 1), 0);
  const shippingFee = hasProducts ? 35000 : 0;
  const preDiscountTotal = checkoutSubtotal + giftFee + shippingFee;
  const discountAmount = appliedVoucher ? Math.round(preDiscountTotal * appliedVoucher.discountPercent / 100) : 0;
  const payableTotal = preDiscountTotal - discountAmount;

  const savedAddressSuggestions = useMemo(() => (typeof window === 'undefined' ? [] : readSavedAddresses()), []);
  const contactReadonly = isWorkshopCheckout && !hasProducts && checkoutWorkshopItems.length > 0;

  const workshopHoldExpiresAt = checkoutWorkshopItems.reduce<number | null>((nearest, item) => {
    if (!nearest) return item.reservedUntil;
    return item.reservedUntil < nearest ? item.reservedUntil : nearest;
  }, null);
  const workshopHoldSeconds = workshopHoldExpiresAt
    ? Math.max(0, Math.ceil((workshopHoldExpiresAt - now) / 1000))
    : 0;
  const workshopHoldClock = `${String(Math.floor(workshopHoldSeconds / 60)).padStart(2, '0')}:${String(workshopHoldSeconds % 60).padStart(2, '0')}`;

  // ── Timer ────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!hasWorkshopCheckout) return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [hasWorkshopCheckout]);

  // Khi giờ giữ slot hết → báo lên page layer
  useEffect(() => {
    if (!hasWorkshopCheckout || !workshopHoldExpiresAt || workshopHoldSeconds > 0) return;
    onPaymentCancel(selectedWorkshopIds);
  }, [hasWorkshopCheckout, onPaymentCancel, selectedWorkshopIds, workshopHoldExpiresAt, workshopHoldSeconds]);

  // ── Form logic ───────────────────────────────────────────────────────────

  const updateField = (field: keyof CheckoutAddress, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const nextErrors: FormErrors = {};
    const phone = formData.phone.replace(/[\s.-]/g, '');
    if (!formData.name.trim()) nextErrors.name = 'Vui lòng nhập họ tên.';
    if (isWorkshopCheckout) {
      if (!formData.phone.trim() && !formData.email.trim()) {
        nextErrors.phone = 'Vui lòng nhập số điện thoại hoặc email để nhận xác nhận.';
        nextErrors.email = 'Vui lòng nhập số điện thoại hoặc email để nhận xác nhận.';
      } else if (formData.phone.trim() && !/^(0\d{9}|\+84\d{9})$/.test(phone)) {
        nextErrors.phone = 'Số điện thoại cần có dạng 09xxxxxxxx hoặc +84xxxxxxxxx.';
      }
    } else if (!/^(0\d{9}|\+84\d{9})$/.test(phone)) {
      nextErrors.phone = 'Số điện thoại cần có dạng 09xxxxxxxx hoặc +84xxxxxxxxx.';
    }
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

  // ── Payment logic ─────────────────────────────────────────────────────────

  const buildTrackingRecords = (orderCode: string): ApiTracking[] => {
    const records: ApiTracking[] = [
      {
        code: orderCode,
        tracking_type: hasProducts ? 'order' : 'workshop',
        status: hasProducts ? 'paid_waiting_pack' : 'confirmed',
        title: hasProducts
          ? checkoutHasCustomProducts ? 'Đơn custom THỔ Studio' : 'Đơn hàng THỔ Studio'
          : 'Vé workshop THỔ Studio',
        message: !hasProducts
          ? 'Vé đã xác nhận. QR check-in đã gửi qua email/SMS.'
          : checkoutHasCustomProducts
            ? 'Đơn custom đã thanh toán. Nghệ nhân sẽ nhận brief sau 3 ngày.'
            : 'Đơn hàng đã thanh toán và đang chờ studio đóng gói.',
        manager_name: hasWorkshopCheckout && !hasProducts ? 'Anh Quân' : 'Chị Linh',
        participant_count: hasWorkshopCheckout
          ? checkoutWorkshopItems.reduce((sum, item) => sum + item.tickets, 0) || null
          : null,
        checkin_status: hasWorkshopCheckout ? 'pending' : null,
        timeline: !hasProducts
          ? [
              { stage: 'paid', label: 'Đã thanh toán', state: 'done' },
              { stage: 'qr_sent', label: 'Đã gửi QR check-in', state: 'current' },
              { stage: 'checked_in', label: 'Chờ check-in tại studio', state: 'waiting' },
            ]
          : [
              { stage: 'paid', label: 'Đã thanh toán', state: 'done' },
              { stage: 'packing', label: checkoutHasCustomProducts ? 'Chờ nghệ nhân nhận brief' : 'Chờ đóng gói', state: 'current' },
              { stage: 'waiting_carrier', label: checkoutHasCustomProducts ? 'Chờ xác nhận làm mẫu' : 'Đợi đơn vị vận chuyển', state: 'waiting' },
              { stage: 'delivering', label: 'Đang giao', state: 'waiting' },
              { stage: 'received', label: 'Đã nhận', state: 'waiting' },
            ],
        items: checkoutItems.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          type: item.type,
          quantity: item.quantity,
          tickets: item.tickets,
          date: item.date,
          time: item.time,
          image: item.image,
        })),
        createdAt: new Date().toISOString(),
      },
    ];

    if (hasWorkshopCheckout) {
      checkoutWorkshopItems.forEach((item, index) => {
        records.push({
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
    }

    return records;
  };

  const finishPayment = async () => {
    const orderCode = `${hasWorkshopCheckout && !hasProducts ? 'WS' : 'ORD'}-${Date.now().toString().slice(-8)}`;
    const customer = hasProducts
      ? formData
      : { ...formData, city: '', district: '', ward: '', address: '', shipping: 'none' };
    const trackingRecords = buildTrackingRecords(orderCode);

    // Emit payload lên page layer — không tự xử lý cart hay navigate
    await onPaymentSuccess({
      orderCode,
      checkoutItems,
      subtotal: checkoutSubtotal,
      shippingFee,
      total: payableTotal,
      customer,
      paymentMethod,
      hasWorkshopCheckout,
      hasProducts,
      selectedProductIds,
      selectedWorkshopIds,
      trackingRecords,
    });
  };

  const cancelPayment = () => {
    setPaymentOpen(false);
    // Báo lên page layer — không tự navigate hay xóa cart
    onPaymentCancel(selectedWorkshopIds);
  };

  // ── Render ────────────────────────────────────────────────────────────────

  if (checkoutItems.length === 0) {
    return (
      <CheckoutShell active={2}>
        <section className="mx-auto max-w-[920px] px-6 py-16">
          <Link to="/cart" className="back-btn mb-8 inline-flex items-center gap-2 text-sm font-bold text-[#716942]">
            <ArrowLeft className="h-4 w-4" />Quay lại giỏ hàng
          </Link>
          <div className="empty-state rounded-[24px] border-2 border-[#EFD8C7] bg-[#FFF1E8]">
            <ShoppingBag className="mb-7 h-16 w-16 text-[#716942]" />
            <h1 className="text-4xl font-bold text-[#2B211D]">Chưa có mục nào để thanh toán</h1>
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
        <Link to="/cart" className="back-btn mb-8 inline-flex items-center gap-2 text-sm font-bold text-[#716942]">
          <ArrowLeft className="h-4 w-4" />Quay lại giỏ hàng
        </Link>
        <h1 className="text-center text-[35px] font-bold text-[#252323]">THANH TOÁN</h1>
        <p className="mt-3 text-center text-lg text-[#6A4A3D]">
          {hasWorkshopCheckout && hasProducts
            ? 'Thanh toán chung sản phẩm và vé workshop. Phí vận chuyển chỉ áp dụng cho sản phẩm vật lý.'
            : hasWorkshopCheckout
            ? 'Thanh toán vé workshop không yêu cầu địa chỉ giao hàng và không cộng phí vận chuyển.'
            : 'Thanh toán sản phẩm vật lý yêu cầu địa chỉ giao hàng và dùng phí vận chuyển tiêu chuẩn 35.000đ.'}
        </p>

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

            {/* Demo voucher suggestion */}
            <div className="mb-7 rounded-[16px] border border-dashed border-[#716942]/40 bg-[#F9F3ED] p-4">
              <p className="mb-2 text-sm font-bold text-[#361F17]">🎟️ Mã giảm giá dành cho bạn</p>
              <button
                type="button"
                onClick={() => {
                  setVoucherInput('THO10');
                  setAppliedVoucher({ code: 'THO10', discountPercent: 10 });
                  setVoucherError('');
                }}
                className={`w-full rounded-[10px] border px-4 py-3 text-left text-sm transition-colors ${
                  appliedVoucher?.code === 'THO10'
                    ? 'border-[#16a34a] bg-[#f0fdf4] text-[#16a34a]'
                    : 'border-[#E5CDBA] bg-white text-[#361F17] hover:border-[#716942]'
                }`}
              >
                <span className="block font-bold">THO10</span>
                <span className="text-xs text-[#6E4E3F]">Giảm 10% toàn bộ hoá đơn — Nhấn để áp dụng</span>
                {appliedVoucher?.code === 'THO10' && <span className="mt-1 block text-xs font-bold text-[#16a34a]">✓ Đã áp dụng</span>}
              </button>
            </div>

            {checkoutHasCustomProducts && (
              <div className="mb-7 rounded-[16px] border border-[#C96B37]/35 bg-[#FFF8F2] p-5 text-[#6E4E3F]">
                <p className="font-bold text-[#2B211D]">Đơn custom cần nghệ nhân xác nhận</p>
                <p className="mt-2 leading-7">
                  Sau khi thanh toán, THỔ sẽ chuyển brief cho nghệ nhân trong 3 ngày. Nghệ nhân sẽ liên hệ lại để chốt khả năng làm, lịch hoàn thiện và những điều chỉnh cần thiết trước khi bắt đầu.
                </p>
              </div>
            )}

            <div className="space-y-6">
              {hasWorkshopCheckout && (
                <div className="rounded-[16px] border border-[#716942]/30 bg-[#F3E2D5] p-4 text-[#6E4E3F]">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-bold text-[#2B211D]">Xác nhận thông tin đặt chỗ</p>
                      <p className="mt-1 text-sm">Kiểm tra lại thông tin bên dưới. Nếu cần chỉnh sửa, bấm nút quay lại.</p>
                    </div>
                    {workshopHoldExpiresAt && (
                      <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-[#716942]">
                        <TimerReset className="h-4 w-4" />
                        Còn {workshopHoldClock}
                      </span>
                    )}
                  </div>
                  <Link to="/cart" className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-[#716942] underline">
                    ← Quay lại chỉnh thông tin
                  </Link>
                </div>
              )}

              <Field label="Họ tên" required value={formData.name} error={errors.name} onChange={(value) => updateField('name', value)} readOnly={contactReadonly} />
              <Field label="Số điện thoại" required value={formData.phone} error={errors.phone} onChange={(value) => updateField('phone', value)} readOnly={contactReadonly} />
              <Field label="Địa chỉ email" type="email" value={formData.email} error={errors.email} onChange={(value) => updateField('email', value)} readOnly={contactReadonly} />

              {hasProducts ? (
                <>
                  <div>
                    <label className="mb-2 block font-bold">Địa chỉ giao hàng <span className="text-red-600">*</span></label>
                    <div className="grid gap-3 md:grid-cols-[0.85fr_0.85fr_0.85fr_1.35fr]">
                      <Field bare placeholder={loadingProvinces ? 'Đang tải...' : 'Tỉnh/TP'} options={apiProvinces.map((p) => p.name)} value={formData.city} error={errors.city} onChange={handleCityChange} />
                      <Field bare placeholder="Quận/Huyện" value={formData.district} error={errors.district} onChange={(value) => updateField('district', value)} />
                      <Field bare placeholder={loadingWards ? 'Đang tải...' : 'Phường/Xã'} options={apiWards.length > 0 ? apiWards.map((w) => w.name) : undefined} value={formData.ward} error={errors.ward} onChange={(value) => updateField('ward', value)} />
                      <Field bare placeholder="Số nhà, tên đường..." value={formData.address} error={errors.address} onChange={(value) => updateField('address', value)} />
                    </div>
                  </div>
                  <div className="rounded-[16px] border border-[#EFD8C7] bg-[#FFF8F2] p-5 text-[#6E4E3F]">
                    {formData.city && <p className="mb-2 font-bold text-[#C96B37]">Giao hàng đến: {formData.city}</p>}
                    <p className="font-bold text-[#2B211D]">Vận chuyển tiêu chuẩn: 35.000đ (Dự kiến nhận hàng trong 2-3 ngày)</p>
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
                <textarea
                  value={formData.note}
                  readOnly={contactReadonly}
                  onChange={(event) => updateField('note', event.target.value)}
                  className={`min-h-[86px] w-full border border-[#949494] px-4 py-3 outline-none focus:ring-2 focus:ring-[#716942]/30 ${contactReadonly ? 'bg-[#F7F1EC] text-[#6E4E3F]' : 'bg-white'}`}
                />
              </label>
            </div>

            <button type="submit" disabled={submitting} className="mt-10 flex h-12 w-full items-center justify-center bg-black text-sm font-semibold uppercase tracking-wide text-white disabled:opacity-70">
              {submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Đang kiểm tra...</> : hasWorkshopCheckout ? 'Tiến hành thanh toán' : 'Đặt hàng'}
            </button>
          </div>

          <aside className="space-y-8">
            <section className="rounded-[14px] border border-black/10 bg-white p-8 shadow-sm">
              <h2 className="text-2xl font-bold uppercase text-[#252323]">Thông tin đơn hàng</h2>
              <div className="mt-8 space-y-4">
                <SummaryLine label="Tạm tính" value={checkoutSubtotal} />
                {giftFee > 0 && <SummaryLine label="Phí quà tặng" value={giftFee} highlight />}
                <SummaryLine label="Phí vận chuyển" value={shippingFee} />
                {discountAmount > 0 && (
                  <div className="flex justify-between text-lg">
                    <span className="text-[#16a34a] font-semibold">Giảm giá ({appliedVoucher?.code})</span>
                    <span className="text-[#16a34a] font-semibold">-{discountAmount.toLocaleString('vi-VN')}đ</span>
                  </div>
                )}
                <SummaryLine label="Tổng" value={payableTotal} strong />
              </div>
              <div className="mt-8 space-y-4 border-t border-[#E2E2E2] pt-6">
                {checkoutItems.map((item) => (
                  <div key={item.id} className="rounded-[10px] border border-[#E2E2E2] bg-white p-4">
                    <div className="grid grid-cols-[84px_1fr] gap-4">
                      <AssetImage src={item.type === 'workshop' ? workshopImages.handsWarm : item.image} alt={item.name} className="h-[84px] w-[84px] rounded-[10px]" />
                      <div>
                        <h3 className="font-bold text-[#2B211D]">{item.name}</h3>
                        <p className="mt-2 text-sm text-[#6E4E3F]">
                          {item.type === 'workshop' ? `${item.date} · ${item.time}` : `Số lượng: ${item.quantity}`}
                        </p>
                        {item.type === 'product' && item.gift && (
                          <div className="mt-2 space-y-1">
                            <p className="rounded-md bg-[#FFF1E8] px-3 py-2 text-xs leading-5 text-[#6E4E3F]">
                              🎁 Quà tặng · {item.gift.occasion} · {item.gift.includeWrapping ? 'Có giấy gói' : 'Không gói quà'} · <span className="font-bold text-[#DC2626]">+50.000đ</span>
                            </p>
                            {item.gift.giftNote && (
                              <p className="px-3 text-xs text-[#8B765D]">💌 "{item.gift.giftNote}"</p>
                            )}
                            {item.gift.personalNote && (
                              <p className="px-3 text-xs text-[#8B765D]">📝 Thêm: {item.gift.personalNote}</p>
                            )}
                          </div>
                        )}
                        {item.type === 'product' && item.custom && (
                          <p className="mt-2 rounded-md bg-[#FFF1E8] px-3 py-2 text-xs leading-5 text-[#6E4E3F]">
                            Custom · {item.custom.shape} · {item.custom.glaze} · Nghệ nhân liên hệ sau {item.custom.artisanLeadDays} ngày
                          </p>
                        )}
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

            {/* Voucher input */}
            <section className="rounded-[14px] border border-black/10 bg-white p-8 shadow-sm">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Tag className="h-5 w-5 text-[#716942]" />
                Mã voucher
              </h2>
              <div className="mt-4 flex gap-2">
                <input
                  type="text"
                  value={voucherInput}
                  onChange={(e) => { setVoucherInput(e.target.value.toUpperCase()); setVoucherError(''); }}
                  placeholder="Nhập mã giảm giá"
                  className="h-11 flex-1 rounded-lg border border-[#949494] px-4 text-sm uppercase focus:outline-none focus:ring-2 focus:ring-[#716942]/30"
                />
                {appliedVoucher ? (
                  <button
                    type="button"
                    onClick={() => { setAppliedVoucher(null); setVoucherInput(''); setVoucherError(''); }}
                    className="rounded-lg bg-[#DC2626] px-5 text-sm font-bold text-white hover:bg-[#B91C1C] transition-colors"
                  >
                    Huỷ
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      const code = voucherInput.trim();
                      if (!code) { setVoucherError('Vui lòng nhập mã voucher.'); return; }
                      if (code === 'THO10') {
                        setAppliedVoucher({ code: 'THO10', discountPercent: 10 });
                        setVoucherError('');
                      } else {
                        setVoucherError('Mã voucher không hợp lệ hoặc đã hết hạn.');
                      }
                    }}
                    className="rounded-lg bg-[#716942] px-5 text-sm font-bold text-white hover:bg-[#5d5635] transition-colors"
                  >
                    Áp dụng
                  </button>
                )}
              </div>
              {voucherError && <p className="mt-2 text-sm text-[#DC2626]">{voucherError}</p>}
              {appliedVoucher && (
                <p className="mt-3 flex items-center gap-2 rounded-lg bg-[#f0fdf4] px-4 py-2.5 text-sm font-semibold text-[#16a34a]">
                  ✓ Mã <span className="font-bold">{appliedVoucher.code}</span> — Giảm {appliedVoucher.discountPercent}% (-{discountAmount.toLocaleString('vi-VN')}đ)
                </p>
              )}
            </section>
          </aside>
        </form>
      </section>

      <PolicyBar />

      {paymentOpen &&
        createPortal(
          <PaymentModal
            method={paymentMethod}
            total={payableTotal}
            initialSeconds={hasWorkshopCheckout ? workshopHoldSeconds || 15 * 60 : 5 * 60}
            isWorkshopCheckout={hasWorkshopCheckout}
            onClose={() => setPaymentOpen(false)}
            onBack={() => setPaymentOpen(false)}
            onSuccess={finishPayment}
            onFail={cancelPayment}
          />,
          document.body,
        )}
    </CheckoutShell>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Field({
  label,
  value,
  onChange,
  type = 'text',
  required,
  bare = false,
  placeholder,
  error,
  options,
  readOnly = false,
}: {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  bare?: boolean;
  placeholder?: string;
  error?: string;
  options?: string[];
  readOnly?: boolean;
}) {
  const selectOrInput = options ? (
    <select
      value={value}
      disabled={readOnly}
      onChange={(event) => onChange(event.target.value)}
      className={`h-[49px] w-full border px-4 outline-none focus:ring-2 focus:ring-[#716942]/30 ${readOnly ? 'bg-[#F7F1EC] text-[#6E4E3F]' : 'bg-white'} ${error ? 'input-error border-[#A33A2F]' : 'border-[#949494]'}`}
      required={required}
    >
      <option value="" disabled>{placeholder}</option>
      {options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
    </select>
  ) : (
    <input
      type={type}
      value={value}
      readOnly={readOnly}
      onChange={(event) => onChange(event.target.value)}
      className={`h-[49px] w-full border px-4 outline-none focus:ring-2 focus:ring-[#716942]/30 ${readOnly ? 'bg-[#F7F1EC] text-[#6E4E3F]' : 'bg-white'} ${error ? 'input-error border-[#A33A2F]' : 'border-[#949494]'}`}
      placeholder={placeholder}
      required={required}
    />
  );

  const input = (
    <div>
      {selectOrInput}
      {error && <p className="field-error"><AlertCircle className="h-3.5 w-3.5" />{error}</p>}
    </div>
  );
  if (bare) return input;
  return (
    <label className="block">
      <span className="mb-2 block font-bold">{label} {required && <span className="text-red-600">*</span>}</span>
      {input}
    </label>
  );
}

function SummaryLine({ label, value, strong = false, highlight = false }: { label: string; value: number; strong?: boolean; highlight?: boolean }) {
  return (
    <div className={`flex justify-between ${strong ? 'text-2xl font-bold' : 'text-lg'}`}>
      <span>{label}</span>
      <span className={highlight ? 'text-[#DC2626] font-semibold' : ''}>{value.toLocaleString('vi-VN')}đ</span>
    </div>
  );
}

const momoLogo = new URL('../../../image/logo/momo.png', import.meta.url).href;
const vnpayLogo = new URL('../../../image/logo/vnpay.jpg', import.meta.url).href;

function PaymentChoice({ method, active, onClick }: { method: 'momo' | 'vnpay'; active: boolean; onClick: () => void }) {
  const isMomo = method === 'momo';
  const logoSrc = isMomo ? momoLogo : vnpayLogo;
  return (
    <button type="button" onClick={onClick} className={`flex min-h-[150px] flex-col items-center justify-center rounded-[10px] border text-center transition hover:shadow-md ${active ? 'border-2 border-[#716942] bg-[#F7F1EC]' : 'border-[#D4D4D4] bg-white'}`}>
      <div className="mb-4 flex h-[68px] w-[140px] items-center justify-center overflow-hidden rounded-[18px] bg-white p-1 border border-[#E2CDBD] shadow-sm">
        <img
          src={logoSrc}
          alt={isMomo ? 'MoMo' : 'VNPAY'}
          className="h-full w-full object-contain"
        />
      </div>
      <span className="text-base font-semibold text-[#361F17]">{method === 'momo' ? 'Ví điện tử MoMo' : 'Thanh toán qua VNPAY'}</span>
    </button>
  );
}

function PaymentModal({
  method,
  total,
  initialSeconds,
  isWorkshopCheckout,
  onClose,
  onBack,
  onSuccess,
  onFail,
}: {
  method: 'momo' | 'vnpay';
  total: number;
  initialSeconds: number;
  isWorkshopCheckout: boolean;
  onClose: () => void;
  onBack: () => void;
  onSuccess: () => void | Promise<void>;
  onFail: () => void;
}) {
  const [secondsLeft, setSecondsLeft] = useState(() => Math.max(1, initialSeconds));
  const isMomo = method === 'momo';
  const logoSrc = isMomo ? momoLogo : vnpayLogo;

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
    <div className="fixed inset-0 z-[999] grid place-items-center overflow-y-auto bg-black/55 px-6 py-10">
      <div className={`my-auto w-full max-w-[1020px] rounded-[14px] bg-[#F7F1EC] shadow-2xl ${isMomo ? 'border-4 border-[#DC1A8D]' : 'border-4 border-[#0088C9]'}`}>
        <div className="flex items-center justify-between border-b border-[#E2E2E2] bg-white p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-20 items-center justify-center overflow-hidden rounded-lg border border-[#E2CDBD] bg-white p-1">
              <img src={logoSrc} alt={isMomo ? 'MoMo' : 'VNPAY'} className="h-full w-full object-contain" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{isMomo ? 'Cổng thanh toán MoMo' : 'Cổng thanh toán VNPAY'}</h2>
              <p className="mt-1 text-xs text-[#727272]">
                QR thanh toán hết hạn sau {minutes}:{seconds}. {isWorkshopCheckout ? 'Hủy thanh toán vé workshop sẽ trả slot ngay.' : 'Hủy thanh toán sẽ đưa bạn về trang chưa hoàn tất.'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-full p-2 hover:bg-[#EFE2D6]" aria-label="Đóng thanh toán" type="button">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="grid gap-8 p-8 lg:grid-cols-[360px_1fr]">
          <div className="rounded-[10px] bg-white p-7">
            <h3 className="text-2xl font-medium">Thông tin đơn hàng</h3>
            <p className="mt-8 text-[#68788F]">Số tiền thanh toán</p>
            <p className={`mt-2 text-3xl font-semibold ${isMomo ? 'text-[#DC1A8D]' : 'text-[#00489B]'}`}>
              {total.toLocaleString('vi-VN')} VND
            </p>
            <p className="mt-8 text-[#68788F]">Thời gian còn lại</p>
            <p className="mt-2 text-4xl font-bold">{minutes}:{seconds}</p>
            <button
              type="button"
              onClick={onBack}
              className="mt-10 inline-flex items-center gap-2 rounded-full border border-[#716942] px-5 py-2.5 text-sm font-bold text-[#716942] hover:bg-[#716942] hover:text-white transition-colors"
            >
              ← Chọn lại phương thức
            </button>
          </div>

          <div className={`rounded-[10px] p-8 text-center ${isMomo ? 'bg-[#DC1A8D] text-white' : 'bg-[#F5F7F9] text-black'}`}>
            <h3 className="text-3xl font-medium">Quét mã để thanh toán</h3>
            <div className="mx-auto my-8 flex h-[300px] w-[300px] items-center justify-center rounded-[10px] bg-white">
              <QrCode className={`h-56 w-56 ${isMomo ? 'text-[#DC1A8D]' : 'text-[#0088C9]'}`} />
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button onClick={onFail} className="rounded-full bg-white px-8 py-4 text-black" type="button">
                Hủy thanh toán
              </button>
              <button onClick={onSuccess} className="rounded-full bg-black px-8 py-4 text-white" type="button">
                Đã thanh toán
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
