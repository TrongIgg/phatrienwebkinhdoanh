import { useEffect, useState, type ReactNode } from 'react';
import { Link, useParams } from 'react-router';
import { ArrowLeft, Calendar, Clock, UserRound, Users } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../lib/api';
import { AssetImage, workshopImages } from './DesignPrimitives';
import { fallbackWorkshops, mapWorkshop, type WorkshopView } from './WorkshopPage';

export type BookingPayload = {
  workshop: WorkshopView;
  contact: { name: string; phone: string; email: string; note: string };
  slotCount: number;
};

export function BookingForm({
  workshopIdOverride,
  onSubmitSuccess,
}: {
  workshopIdOverride?: string;
  onSubmitSuccess: (payload: BookingPayload) => void;
}) {
  const params = useParams();
  const workshopId = workshopIdOverride ?? params.workshopId;
  const fallback = fallbackWorkshops.find((item) => item.id === workshopId) ?? null;
  const [workshop, setWorkshop] = useState<WorkshopView | null>(fallback);
  const [loading, setLoading] = useState(!fallback);
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', notes: '' });
  const [slotCount, setSlotCount] = useState(1);

  useEffect(() => {
    if (!workshopId) return;
    api.workshop(workshopId)
      .then((row) => setWorkshop(mapWorkshop(row, Number(workshopId) - 1)))
      .catch(() => {
        if (!fallback) setWorkshop(null);
      })
      .finally(() => setLoading(false));
  }, [workshopId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F1EC] px-4 py-20 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 rounded-full border-3 border-[#C0AC8B] border-t-[#716942] animate-spin" />
          <p className="text-[#7A6E62]">Đang tải workshop...</p>
        </div>
      </div>
    );
  }

  if (!workshop) {
    return (
      <div className="min-h-screen bg-[#F7F1EC] px-4 py-20 text-center">
        <p className="text-[#7A6E62]">Workshop không tồn tại</p>
      </div>
    );
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!formData.name || (!formData.phone && !formData.email)) {
      toast.error('Vui lòng nhập họ tên và ít nhất một thông tin liên hệ: email hoặc số điện thoại.');
      return;
    }

    if (slotCount > workshop.slots.available) {
      toast.error(`Workshop chỉ còn ${workshop.slots.available} slot.`);
      return;
    }

    // Chỉ emit data lên — không navigate, không cart, không localStorage
    onSubmitSuccess({
      workshop,
      contact: {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        note: formData.notes,
      },
      slotCount,
    });
  };

  return (
    <div className="min-h-screen bg-[#F7F1EC]">
      <section className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-start gap-8 lg:grid-cols-[430px_1fr]">
          <aside className="sticky top-24 overflow-hidden rounded-lg border border-[#EFD8C7] bg-[#FFF8F2]">
            <AssetImage src={workshop.image} alt={workshop.name} className="aspect-[4/5]" />
            <div className="p-6">
              <h2 className="mb-5 text-3xl text-[#2B211D]">{workshop.name}</h2>
              <div className="space-y-3 text-sm text-[#7A6E62]">
                <Info icon={<Calendar className="h-4 w-4" />} text={workshop.fullDate} />
                <Info icon={<Clock className="h-4 w-4" />} text={workshop.time} />
                <Info icon={<UserRound className="h-4 w-4" />} text={workshop.instructor} />
                <Info icon={<Users className="h-4 w-4" />} text={`${workshop.package} · còn ${workshop.slots.available}/${workshop.slots.total} slot`} />
              </div>
              <p className="mt-6 text-3xl text-primary">{workshop.price.toLocaleString('vi-VN')}đ</p>
              <div className="mt-6 grid grid-cols-3 gap-2">
                {[workshopImages.artisanBw, workshopImages.handsWarm, workshopImages.wheelBw].map((image, index) => (
                  <AssetImage
                    key={image}
                    src={image}
                    alt={`Không gian workshop ${index + 1}`}
                    className="aspect-square rounded-md"
                  />
                ))}
              </div>
            </div>
          </aside>

          <div>
            <Link to="/workshop" className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#C0AC8B] px-5 py-2 font-semibold text-[#716942] hover:bg-[#716942] hover:text-white">
              <ArrowLeft className="h-4 w-4" />
              Về trang Workshop
            </Link>
            <p className="mb-4 text-sm uppercase text-primary">Form đặt chỗ</p>
            <h1 className="mb-5 text-5xl text-[#2B211D]">Đặt chỗ Workshop</h1>
            <div className="mb-6 rounded-lg border border-[#EFD8C7] bg-[#FFF8F2] p-5">
              <p className="text-sm text-[#6f5d52]">
                Ngày và giờ đã cố định theo workshop bạn chọn. Slot được giữ 15 phút sau khi mở QR thanh toán; nếu hủy, slot được trả lại ngay.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 rounded-lg border border-[#EFD8C7] bg-[#FFF8F2] p-6">
              <Field label="Họ và tên" value={formData.name} onChange={(value) => setFormData({ ...formData, name: value })} placeholder="Nhập họ tên của bạn" required />
              <div className="rounded-lg bg-[#F7E8DC] p-4 text-sm text-[#6f5d52]">
                Chỉ cần nhập email hoặc số điện thoại. THỔ sẽ dùng thông tin này để xác nhận lịch và gửi nhắc thanh toán.
              </div>
              <div>
                <span className="mb-2 block text-[#2B211D]">Số slot muốn giữ <span className="text-destructive">*</span></span>
                <div className="flex flex-wrap items-center gap-4">
                  <div className="inline-flex h-12 items-center rounded-full border border-[#E5CDBA] bg-white">
                    <button
                      type="button"
                      onClick={() => setSlotCount((value) => Math.max(1, value - 1))}
                      className="px-4"
                      aria-label="Giảm số slot"
                    >
                      -
                    </button>
                    <span className="min-w-12 text-center font-bold">{slotCount}</span>
                    <button
                      type="button"
                      onClick={() => {
                        if (slotCount >= workshop.slots.available) {
                          toast.error(`Workshop chỉ còn ${workshop.slots.available} slot.`);
                          return;
                        }
                        setSlotCount((value) => value + 1);
                      }}
                      className="px-4"
                      aria-label="Tăng số slot"
                    >
                      +
                    </button>
                  </div>
                  <p className="text-sm text-[#6f5d52]">
                    Bạn có thể đăng ký chung cho bạn bè trong cùng một đơn. Còn {workshop.slots.available} slot.
                  </p>
                </div>
              </div>
              <Field label="Số điện thoại" type="tel" value={formData.phone} onChange={(value) => setFormData({ ...formData, phone: value })} placeholder="0912 345 678" />
              <Field label="Email" type="email" value={formData.email} onChange={(value) => setFormData({ ...formData, email: value })} placeholder="email@example.com" />

              <label className="block">
                <span className="mb-2 block text-[#2B211D]">Ghi chú (không bắt buộc)</span>
                <textarea
                  value={formData.notes}
                  onChange={(event) => setFormData({ ...formData, notes: event.target.value })}
                  className="h-28 w-full rounded-lg border border-[#E5CDBA] bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Thông tin bổ sung..."
                />
              </label>

              <button type="submit" className="w-full rounded-full bg-[#3B2118] py-4 text-[#FFF8F2] transition-opacity hover:opacity-90">
                Thanh toán ngay
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[#2B211D]">
        {label} {required && <span className="text-destructive">*</span>}
      </span>
      <input
        type={type}
        value={value}
        required={required}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 w-full rounded-lg border border-[#E5CDBA] bg-white px-4 focus:outline-none focus:ring-2 focus:ring-ring"
        placeholder={placeholder}
      />
    </label>
  );
}

function Info({ icon, text }: { icon: ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-2">
      {icon}
      <span>{text}</span>
    </div>
  );
}
