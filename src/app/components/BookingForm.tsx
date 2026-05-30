import { useEffect, useState, type ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Calendar, Clock, UserRound, Users } from 'lucide-react';
import { toast } from 'sonner';
import { useCart } from '../contexts/CartContext';
import { api } from '../lib/api';
import { AssetImage } from './DesignPrimitives';
import { fallbackWorkshops, mapWorkshop, type WorkshopView } from './WorkshopPage';

export function BookingForm({ workshopIdOverride }: { workshopIdOverride?: string } = {}) {
  const params = useParams();
  const navigate = useNavigate();
  const { addWorkshop, clearCart } = useCart();
  const workshopId = workshopIdOverride ?? params.workshopId;
  const [workshop, setWorkshop] = useState<WorkshopView | null>(null);
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', notes: '' });

  useEffect(() => {
    if (!workshopId) return;
    api.workshop(workshopId)
      .then((row) => setWorkshop(mapWorkshop(row, Number(workshopId) - 1)))
      .catch(() => setWorkshop(fallbackWorkshops.find((item) => item.id === workshopId) ?? null));
  }, [workshopId]);

  if (!workshop) {
    return (
      <div className="min-h-screen bg-[#F7F1EC] px-4 py-20 text-center">
        <p className="text-[#7A6E62]">Workshop không tồn tại</p>
      </div>
    );
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!formData.name || !formData.phone || !formData.email) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc.');
      return;
    }

    clearCart();
    addWorkshop({
      id: `workshop-${workshop.id}-${Date.now()}`,
      name: workshop.name,
      date: workshop.fullDate,
      time: workshop.time,
      instructor: workshop.instructor,
      price: workshop.price,
      tickets: workshop.package.includes('2') ? 2 : 1,
      package: workshop.package,
    });

    window.sessionStorage.setItem(
      'tho-booking-contact',
      JSON.stringify({
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        note: formData.notes,
      }),
    );

    toast.success('Đã giữ slot workshop 5 phút. Đang mở thanh toán...');
    navigate('/checkout?autopay=workshop');
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
            </div>
          </aside>

          <div>
            <p className="mb-4 text-sm uppercase text-primary">Booking Form</p>
            <h1 className="mb-5 text-5xl text-[#2B211D]">Đặt chỗ Workshop</h1>
            <div className="mb-6 rounded-lg border border-[#EFD8C7] bg-[#FFF8F2] p-5">
              <p className="text-sm text-[#6f5d52]">
                Ngày và giờ đã cố định theo workshop bạn chọn. Slot được giữ 5 phút sau khi mở QR thanh toán; nếu hủy, slot được trả lại ngay.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 rounded-lg border border-[#EFD8C7] bg-[#FFF8F2] p-6">
              <Field label="Họ và tên" value={formData.name} onChange={(value) => setFormData({ ...formData, name: value })} placeholder="Nhập họ tên của bạn" required />
              <Field label="Số điện thoại" type="tel" value={formData.phone} onChange={(value) => setFormData({ ...formData, phone: value })} placeholder="0912 345 678" required />
              <Field label="Email" type="email" value={formData.email} onChange={(value) => setFormData({ ...formData, email: value })} placeholder="email@example.com" required />

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
                Đặt chỗ và thanh toán ngay
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
