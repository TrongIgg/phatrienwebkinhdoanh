import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  ShieldCheck,
  Sparkles,
  UserRound,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../lib/api';
import { AssetImage, DatabaseConnectionViz, workshopImages } from './DesignPrimitives';
import { fallbackWorkshops, mapWorkshop, type WorkshopView } from './WorkshopPage';

export type WorkshopBookingPayload = {
  workshop: WorkshopView;
  contact: { name: string; phone: string; email: string; notes: string };
  slotCount: number;
};

export function WorkshopDetailPage({
  onBookingSubmit,
}: {
  onBookingSubmit: (payload: WorkshopBookingPayload) => void;
}) {
  const { workshopId } = useParams();
  const navigate = useNavigate();

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

    // Emit data lên page layer — không tự xử lý cart/localStorage/navigate
    onBookingSubmit({ workshop, contact: { ...formData }, slotCount });
  };

  const slotsUrgent = workshop.slots.available <= 3;

  return (
    <div className="min-h-screen bg-[#FBEEE5] text-[#361F17]">
      {/* ── Hero Detail ─────────────────────────────────────── */}
      <section className="mx-auto grid max-w-[1440px] gap-10 px-6 py-14 lg:grid-cols-[0.95fr_1fr] lg:px-20">
        {/* Left – Image + Advisory */}
        <div>
          <button
            onClick={() => navigate('/workshop')}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#C0AC8B] px-5 py-2 font-semibold text-[#716942] hover:bg-[#716942] hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Workshop
          </button>
          <AssetImage src={workshop.image} alt={workshop.name} className="aspect-[4/3.8] rounded-lg" loading="eager" />

          {/* ── Why this package? Advisory script ──────────── */}
          <WhyThisPackage workshopType={workshop.workshopType} audience={workshop.audience} />
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
        <div className="mt-16">
          <DatabaseConnectionViz />
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

/* ── Advisory scripts per workshop type ─────────────────────────── */

const packageScripts: Record<string, { title: string; paragraphs: string[]; bestFor: string }> = {
  basic: {
    title: 'Bước đầu tiên trên hành trình gốm',
    paragraphs: [
      'Gói cơ bản là lựa chọn lý tưởng nếu bạn lần đầu chạm đất sét. Bạn sẽ được hướng dẫn từng bước: từ cách nhào đất, tạo dáng bằng tay, đến vuốt mép và để lại dấu vân tay riêng trên sản phẩm.',
      'Không cần kinh nghiệm, không sợ "làm hỏng" — vì mỗi vết nứt, mỗi nét xiên đều là một phần của câu chuyện. Nghệ nhân sẽ đi cùng bạn cả buổi.',
    ],
    bestFor: 'Người mới bắt đầu, muốn thử cảm giác nặn gốm thủ công lần đầu.',
  },
  painting: {
    title: 'Cho những ai yêu màu sắc',
    paragraphs: [
      'Nếu bạn thích vẽ, thích pha màu, thích sự bất ngờ khi men chảy trong lò nung — gói trang trí men màu dành cho bạn.',
      'Bạn sẽ nhận phôi gốm đã nung mộc sẵn, chọn bảng men yêu thích, rồi thoải mái vẽ hoa văn, chữ viết hoặc hình tự do. Sau khi nung men, màu sắc sẽ "sống dậy" hoàn toàn khác — và đó chính là điều kỳ diệu của gốm.',
    ],
    bestFor: 'Người yêu nghệ thuật, thích trang trí, hoặc muốn tạo món quà cá nhân hóa.',
  },
  combo: {
    title: 'Hai người, hai tác phẩm, một kỷ niệm',
    paragraphs: [
      'Gói combo dành cho hai người đi cùng — bạn thân, người yêu hoặc đồng nghiệp thân thiết. Mỗi người làm một sản phẩm riêng, nhưng cùng ngồi một bàn, cùng chia sẻ khoảng thời gian chậm lại giữa nhịp sống vội.',
      'Workshop không chỉ là làm gốm — mà còn là lý do để hai bạn ngồi xuống, tập trung vào hiện tại, và tạo ra thứ gì đó bằng chính đôi tay mình.',
    ],
    bestFor: 'Cặp đôi, bạn thân, hoặc hai người muốn có trải nghiệm chung đáng nhớ.',
  },
  family: {
    title: 'Khoảng lặng gia đình giữa thành phố',
    paragraphs: [
      'Workshop gia đình được thiết kế chậm hơn, có trợ giảng kèm trẻ nhỏ, và góc chụp ảnh thành phẩm cuối buổi. Bố mẹ và con cùng nhau nặn đất, cùng bẩn tay, cùng cười.',
      'Thay vì một chủ nhật quanh quẩn với màn hình, hãy tặng gia đình một buổi chạm vào thứ gì đó thật — bằng đất, bằng nước, và bằng những đôi tay nhỏ xíu đang háo hức.',
    ],
    bestFor: 'Gia đình có trẻ em từ 5 tuổi, muốn hoạt động gắn kết thực tế.',
  },
  premium: {
    title: 'Dành cho người muốn đi sâu hơn',
    paragraphs: [
      'Gói premium không chỉ là "làm gốm nâng cao". Bạn sẽ có bàn xoay riêng, thời lượng dài hơn, và nghệ nhân đi sát từng chi tiết: cách đặt tay, lực ấn, góc nghiêng khi vuốt dáng trên bàn xoay.',
      'Đây là gói phù hợp nếu bạn đã thử qua gốm cơ bản và muốn thử thách bản thân, hoặc đơn giản là bạn thích sự tập trung cao độ, thích "flow state" khi đôi tay hoàn toàn chìm vào đất.',
    ],
    bestFor: 'Người đã có trải nghiệm gốm, hoặc muốn trải nghiệm bàn xoay chuyên nghiệp.',
  },
  tea: {
    title: 'Nghệ thuật trong một chén trà nhỏ',
    paragraphs: [
      'Gói chén trà là sự kết hợp giữa thủ công và thiền: bạn nặn một chiếc chén vừa tay, học cách nhìn men sữa chảy tự nhiên, và hiểu vì sao mỗi chiếc chén trà thủ công không bao giờ giống nhau.',
      'Sau buổi workshop, bạn sẽ không chỉ mang về một chiếc chén — mà còn mang về cách nhìn mới: bắt đầu cảm nhận đồ vật bằng tay trước khi bằng mắt.',
    ],
    bestFor: 'Người yêu trà, thích sự tối giản, hoặc muốn trải nghiệm mindfulness qua gốm.',
  },
  sculpture: {
    title: 'Tạo hình tự do, không giới hạn',
    paragraphs: [
      'Gói tượng gốm mini dành cho những ai thích sáng tạo không theo khuôn mẫu. Bạn có thể nặn con vật nhỏ, mô hình nhà, đám mây, hoặc bất cứ ký hiệu nào có ý nghĩa riêng với bạn.',
      'Nghệ nhân sẽ hướng dẫn kỹ thuật nặn chi tiết, cách tạo kết cấu bề mặt, và cách giữ tỷ lệ. Nhưng ý tưởng? Hoàn toàn thuộc về bạn.',
    ],
    bestFor: 'Người thích sáng tạo tự do, trẻ em lớn, hoặc muốn tạo vật phẩm kỷ niệm riêng.',
  },
};

function WhyThisPackage({ workshopType, audience }: { workshopType: string; audience: string }) {
  const script = packageScripts[workshopType] ?? packageScripts.basic;

  return (
    <div className="mt-6 rounded-xl border border-[#E5CDBA] bg-gradient-to-br from-[#FFF8F2] to-[#FBF0E4] p-6">
      <div className="mb-4 flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#716942]/10">
          <Sparkles className="h-4 w-4 text-[#716942]" />
        </span>
        <h3 className="text-lg font-bold text-[#3B2118]">Tại sao nên chọn gói này?</h3>
      </div>

      <h4 className="mb-3 text-base font-bold text-[#643A2A]">{script.title}</h4>

      <div className="space-y-3">
        {script.paragraphs.map((p, i) => (
          <p key={i} className="text-sm leading-7 text-[#6A5D52]">{p}</p>
        ))}
      </div>

      <div className="mt-5 flex items-start gap-2 rounded-lg bg-[#716942]/8 px-4 py-3">
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#716942]" />
        <p className="text-sm font-semibold text-[#361F17]">
          <span className="text-[#716942]">Phù hợp nhất với:</span> {script.bestFor}
        </p>
      </div>
    </div>
  );
}

