import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  ShieldCheck,
  UserRound,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../lib/api';
import { useWorkshopCart } from '../contexts/WorkshopCartContext';
import { AssetImage, workshopImages } from './DesignPrimitives';
import { fallbackWorkshops, mapWorkshop, type WorkshopView } from './WorkshopPage';

const BOOKING_CONTACT_STORAGE_KEY = 'tho-booking-contact';

export function WorkshopDetailPage() {
  const { workshopId } = useParams();
  const navigate = useNavigate();
  const { addWorkshop, clearWorkshopCart } = useWorkshopCart();

  const fallback = fallbackWorkshops.find((item) => item.id === workshopId) ?? null;
  const [workshop, setWorkshop] = useState<WorkshopView | null>(fallback);
  const [loading, setLoading] = useState(!fallback);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', notes: '' });
  const [slotCount, setSlotCount] = useState(1);

  useEffect(() => {
    if (!workshopId) return;
    api
      .workshop(workshopId)
      .then((row) => setWorkshop(mapWorkshop(row, Number(workshopId) - 1)))
      .catch(() => {
        if (!fallback) setWorkshop(null);
      })
      .finally(() => setLoading(false));
  }, [workshopId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FBEEE5] px-6 py-20 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 rounded-full border-3 border-[#C0AC8B] border-t-[#716942] animate-spin" />
          <p className="text-[#7A6A58]">Đang tải workshop...</p>
        </div>
      </div>
    );
  }

  if (!workshop) {
    return (
      <div className="min-h-screen bg-[#FBEEE5] px-6 py-20 text-center">
        <p>Không tìm thấy workshop.</p>
        <Link to="/workshop" className="mt-5 inline-flex rounded-full border border-[#716942] px-6 py-3">
          Quay lại workshop
        </Link>
      </div>
    );
  }

  const handlePayNow = (event: React.FormEvent) => {
    event.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Vui lòng nhập họ và tên.');
      return;
    }
    if (!formData.phone.trim() && !formData.email.trim()) {
      toast.error('Vui lòng nhập số điện thoại hoặc email để nhận xác nhận.');
      return;
    }
    if (slotCount > workshop.slots.available) {
      toast.error(`Workshop chỉ còn ${workshop.slots.available} slot.`);
      return;
    }

    setSubmitting(true);

    // Persist contact info so CheckoutPage can pre-fill
    window.localStorage.setItem(
      BOOKING_CONTACT_STORAGE_KEY,
      JSON.stringify({
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        note: formData.notes,
        slotCount,
      }),
    );

    // Push workshop into cart context
    clearWorkshopCart();
    addWorkshop({
      id: `workshop-${workshop.id}-${Date.now()}`,
      name: workshop.name,
      date: workshop.fullDate,
      time: workshop.time,
      instructor: workshop.instructor,
      price: workshop.price,
      tickets: slotCount,
      maxTickets: workshop.slots.available,
      package: workshop.package,
    });

    // Navigate straight to payment method selection
    navigate('/checkout?autopay=workshop');
  };

  const slotsUrgent = workshop.slots.available <= 3;

  return (
    <div className="min-h-screen bg-[#FBEEE5] text-[#361F17]">
      {/* ── Hero Detail ─────────────────────────────────────── */}
      <section className="mx-auto grid max-w-[1440px] gap-10 px-6 py-14 lg:grid-cols-[0.95fr_1fr] lg:px-20">
        {/* Left – Image */}
        <div>
          <button
            onClick={() => navigate('/workshop')}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#C0AC8B] px-5 py-2 font-semibold text-[#716942] hover:bg-[#716942] hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Workshop
          </button>
          <AssetImage src={workshop.image} alt={workshop.name} className="aspect-[4/4.4] rounded-lg" loading="eager" />
        </div>

        {/* Right – Info + inline booking form */}
        <div className="self-start lg:sticky lg:top-24">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#716942]">
            {workshop.audience.replace('_', ' ')}
          </p>
          <h1 className="mt-3 text-5xl font-bold leading-tight text-[#3B2118]">{workshop.name}</h1>
          <p className="mt-6 text-xl leading-9 text-[#6A5D52]">{workshop.description}</p>

          {/* Meta grid */}
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <Info icon={<Calendar className="h-5 w-5" />} label="Ngày học" value={workshop.fullDate} />
            <Info icon={<Clock className="h-5 w-5" />} label="Khung giờ" value={workshop.time} />
            <Info icon={<UserRound className="h-5 w-5" />} label="Nghệ nhân" value={workshop.instructor} />
            <Info
              icon={<Users className="h-5 w-5" />}
              label="Slot còn lại"
              value={`${workshop.slots.available}/${workshop.slots.total}`}
              urgent={slotsUrgent}
            />
          </div>

          {/* Slot urgency banner */}
          {slotsUrgent && (
            <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#C96B37]/15 px-4 py-2 text-sm font-bold text-[#C96B37]">
              ⚡ Chỉ còn {workshop.slots.available} chỗ — đặt ngay để không mất slot!
            </p>
          )}

          {/* ── Inline Booking Form ──────────────────────────── */}
          <form
            onSubmit={handlePayNow}
            className="mt-8 space-y-4 rounded-xl border border-[#EFD8C7] bg-[#FFF8F2] p-6"
          >
            <h2 className="text-xl font-bold text-[#3B2118]">Thông tin đặt chỗ</h2>

            {/* Name */}
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-[#361F17]">
                Họ và tên <span className="text-[#C96B37]">*</span>
              </span>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="h-11 w-full rounded-lg border border-[#E5CDBA] bg-white px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#716942]/40"
                placeholder="Nhập họ tên của bạn"
              />
            </label>

            {/* Phone + Email row */}
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold text-[#361F17]">Số điện thoại</span>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="h-11 w-full rounded-lg border border-[#E5CDBA] bg-white px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#716942]/40"
                  placeholder="0912 345 678"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold text-[#361F17]">Email</span>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="h-11 w-full rounded-lg border border-[#E5CDBA] bg-white px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#716942]/40"
                  placeholder="email@example.com"
                />
              </label>
            </div>

            {/* Slot counter */}
            <div>
              <span className="mb-1.5 block text-sm font-semibold text-[#361F17]">
                Số lượng vé <span className="text-[#C96B37]">*</span>
              </span>
              <div className="flex items-center gap-4">
                <div className="inline-flex h-11 items-center rounded-full border border-[#E5CDBA] bg-white">
                  <button
                    type="button"
                    onClick={() => setSlotCount((v) => Math.max(1, v - 1))}
                    className="px-4 text-lg font-bold"
                    aria-label="Giảm số vé"
                  >
                    −
                  </button>
                  <span className="min-w-[3rem] text-center font-bold">{slotCount}</span>
                  <button
                    type="button"
                    onClick={() => {
                      if (slotCount >= workshop.slots.available) {
                        toast.error(`Workshop chỉ còn ${workshop.slots.available} slot.`);
                        return;
                      }
                      setSlotCount((v) => v + 1);
                    }}
                    className="px-4 text-lg font-bold"
                    aria-label="Tăng số vé"
                  >
                    +
                  </button>
                </div>
                <p className="text-sm text-[#6A5D52]">Còn {workshop.slots.available} slot khả dụng</p>
              </div>
            </div>

            {/* Notes */}
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-[#361F17]">Ghi chú (không bắt buộc)</span>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="h-24 w-full rounded-lg border border-[#E5CDBA] bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#716942]/40"
                placeholder="Yêu cầu đặc biệt, dị ứng, nhóm lớn..."
              />
            </label>

            {/* Price + CTA */}
            <div className="flex flex-col gap-4 pt-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-[#6A5D52]">Tổng</p>
                <p className="text-3xl font-bold text-[#643A2A]">
                  {(workshop.price * slotCount).toLocaleString('vi-VN')}đ
                </p>
                {slotCount > 1 && (
                  <p className="text-xs text-[#8B765D]">
                    {workshop.price.toLocaleString('vi-VN')}đ × {slotCount} vé
                  </p>
                )}
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#716942] px-8 py-4 font-bold text-white hover:bg-[#5d5635] disabled:opacity-60 transition-colors"
              >
                <CreditCard className="h-5 w-5" />
                {submitting ? 'Đang xử lý...' : 'Thanh toán ngay'}
              </button>
            </div>

            {/* Slot policy note */}
            <p className="text-xs text-[#8B765D]">
              🔒 Slot được giữ 15 phút sau khi mở cổng thanh toán. Hủy thanh toán trả slot về ngay lập tức.
            </p>
          </form>

          {/* Secondary CTA: 3D Customizer */}
          <Link
            to="/workshop-customizer"
            className="mt-4 inline-flex w-full items-center justify-center rounded-full border border-[#716942] px-8 py-4 text-center font-bold text-[#716942] hover:bg-[#716942] hover:text-white transition-colors"
          >
            Tạo mẫu gốm thử 3D trước
          </Link>

          {/* Policy box */}
          <div className="mt-6 rounded-lg border border-[#EFD8C7] bg-[#FFF8F2] p-5">
            <h2 className="text-base font-bold">Chính sách giữ chỗ</h2>
            <ul className="mt-3 space-y-2 text-sm text-[#6A5D52]">
              <li className="flex gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#716942]" />
                Slot được giữ 15 phút sau khi bạn mở thanh toán.
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#716942]" />
                Hủy thanh toán → slot được trả lại ngay cho workshop.
              </li>
              <li className="flex gap-2">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#716942]" />
                Gốm sau workshop được đóng gói và giao theo chính sách vận chuyển riêng.
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ── What you'll experience ───────────────────────────── */}
      <section className="mx-auto max-w-[1440px] px-6 pb-20 lg:px-20">
        <h2 className="mb-6 text-3xl font-bold">Bạn sẽ trải nghiệm</h2>
        <div className="grid gap-5 md:grid-cols-3">
          {[
            'Làm quen chất đất và công cụ',
            'Tạo hình hoặc trang trí theo gói',
            'Nhận tracking thành phẩm sau workshop',
          ].map((item) => (
            <div key={item} className="rounded-lg border border-[#EFD8C7] bg-[#FFF8F2] p-6 text-lg font-semibold">
              {item}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Info({
  icon,
  label,
  value,
  urgent = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  urgent?: boolean;
}) {
  return (
    <div className="rounded-lg border border-[#EFD8C7] bg-[#FFF8F2] p-5">
      <div className="mb-2 flex items-center gap-2 text-sm font-bold text-[#716942]">
        {icon}
        {label}
      </div>
      <p className={urgent ? 'font-bold text-[#C96B37]' : 'text-[#361F17]'}>{value}</p>
    </div>
  );
}
