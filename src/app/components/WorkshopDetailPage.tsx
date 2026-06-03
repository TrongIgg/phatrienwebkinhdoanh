import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { ArrowLeft, Calendar, CheckCircle2, Clock, ShieldCheck, UserRound, Users } from 'lucide-react';
import { api } from '../lib/api';
import { AssetImage, workshopImages } from './DesignPrimitives';
import { fallbackWorkshops, mapWorkshop, type WorkshopView } from './WorkshopPage';

export function WorkshopDetailPage() {
  const { workshopId } = useParams();
  const navigate = useNavigate();
  const fallback = fallbackWorkshops.find((item) => item.id === workshopId) ?? null;
  const [workshop, setWorkshop] = useState<WorkshopView | null>(fallback);
  const [loading, setLoading] = useState(!fallback);

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
        <Link to="/workshop" className="mt-5 inline-flex rounded-full border border-[#716942] px-6 py-3">Quay lại workshop</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBEEE5] text-[#361F17]">
      <section className="mx-auto grid max-w-[1440px] gap-10 px-6 py-14 lg:grid-cols-[0.95fr_1fr] lg:px-20">
        <div>
          <button onClick={() => navigate('/workshop')} className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#C0AC8B] px-5 py-2 font-semibold text-[#716942] hover:bg-[#716942] hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            Workshop
          </button>
          <AssetImage src={workshop.image} alt={workshop.name} className="aspect-[4/4.4] rounded-lg" loading="eager" />
        </div>

        <div className="self-center">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#716942]">{workshop.audience.replace('_', ' ')}</p>
          <h1 className="mt-3 text-5xl font-bold leading-tight text-[#3B2118]">{workshop.name}</h1>
          <p className="mt-6 text-xl leading-9 text-[#6A5D52]">{workshop.description}</p>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <Info icon={<Calendar className="h-5 w-5" />} label="Ngày học" value={workshop.fullDate} />
            <Info icon={<Clock className="h-5 w-5" />} label="Khung giờ" value={workshop.time} />
            <Info icon={<UserRound className="h-5 w-5" />} label="Nghệ nhân" value={workshop.instructor} />
            <Info icon={<Users className="h-5 w-5" />} label="Số người" value={`${workshop.package} · còn ${workshop.slots.available}/${workshop.slots.total} slot`} />
          </div>

          <div className="mt-8 rounded-lg border border-[#EFD8C7] bg-[#FFF8F2] p-5">
            <h2 className="text-xl font-bold">Chính sách giữ chỗ</h2>
            <ul className="mt-3 space-y-2 text-[#6A5D52]">
              <li className="flex gap-2"><CheckCircle2 className="mt-1 h-4 w-4 text-[#716942]" />Slot được giữ 15 phút sau khi bạn mở thanh toán.</li>
              <li className="flex gap-2"><CheckCircle2 className="mt-1 h-4 w-4 text-[#716942]" />Nếu hủy thanh toán, slot được trả lại ngay cho workshop.</li>
              <li className="flex gap-2"><ShieldCheck className="mt-1 h-4 w-4 text-[#716942]" />Gốm sau workshop được đóng gói và giao theo chính sách vận chuyển riêng.</li>
            </ul>
          </div>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
            <p className="text-4xl font-bold text-[#643A2A]">{workshop.price.toLocaleString('vi-VN')}đ</p>
            <Link to={`/booking/${workshop.id}`} className="rounded-full bg-[#716942] px-8 py-4 text-center font-bold text-white hover:opacity-90">
              Đặt chỗ và thanh toán
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-6 pb-20 lg:px-20">
        <h2 className="mb-6 text-3xl font-bold">Bạn sẽ trải nghiệm</h2>
        <div className="grid gap-5 md:grid-cols-3">
          {['Làm quen chất đất và công cụ', 'Tạo hình hoặc trang trí theo gói', 'Nhận tracking thành phẩm sau workshop'].map((item) => (
            <div key={item} className="rounded-lg border border-[#EFD8C7] bg-[#FFF8F2] p-6 text-lg font-semibold">{item}</div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Info({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[#EFD8C7] bg-[#FFF8F2] p-5">
      <div className="mb-2 flex items-center gap-2 text-sm font-bold text-[#716942]">
        {icon}
        {label}
      </div>
      <p className="text-[#361F17]">{value}</p>
    </div>
  );
}
