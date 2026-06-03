import { Link } from 'react-router';
import { ArrowRight, Flame, Hand, MapPin, Sparkles } from 'lucide-react';
import { AssetImage, productImages, workshopImages } from './DesignPrimitives';

export function AboutPage() {
  return (
    <div className="bg-[#FBEEE5] text-[#361F17]">
      <section className="mx-auto grid max-w-[1440px] gap-10 px-6 py-16 lg:grid-cols-[1fr_0.9fr] lg:px-20">
        <div className="self-center">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#716942]">THỔ Studio</p>
          <h1 className="mt-4 text-[64px] font-bold leading-none text-[#3B2118]">Một xưởng gốm để chạm tay vào đất, lửa và thời gian.</h1>
          <p className="mt-6 max-w-2xl text-xl leading-9 text-[#6A5D52]">
            THỔ không chỉ bán gốm. Studio tạo một hành trình đầy đủ: chọn workshop, tự làm sản phẩm, theo dõi quá trình nung, nhận thành phẩm và quay lại bằng những bộ sưu tập thủ công.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to="/workshop" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#716942] px-7 py-4 font-bold text-white">
              Xem workshop
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/policy" className="inline-flex items-center justify-center rounded-full border border-[#716942] px-7 py-4 font-bold text-[#716942]">
              Chính sách riêng
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <AssetImage src={workshopImages.hero} alt="Không gian THỔ Studio" className="col-span-2 h-72 rounded-lg" loading="eager" />
          <AssetImage src={workshopImages.artisanBw} alt="Nghệ nhân hướng dẫn" className="h-52 rounded-lg" />
          <AssetImage src={productImages.tealVase} alt="Sản phẩm gốm THỔ" className="h-52 rounded-lg" />
        </div>
      </section>

      <section className="bg-[#3F3F35] py-16 text-[#FBEEE5]">
        <div className="mx-auto grid max-w-[1440px] gap-6 px-6 lg:grid-cols-4 lg:px-20">
          <Stat icon={<Hand className="h-7 w-7" />} title="Thủ công" copy="Mỗi sản phẩm giữ lại dấu tay và độ lệch riêng của mẻ nung." />
          <Stat icon={<Flame className="h-7 w-7" />} title="Theo dõi được" copy="Khách có mã tracking để xem sản phẩm đang phơi, nung hay tráng men." />
          <Stat icon={<Sparkles className="h-7 w-7" />} title="Có trải nghiệm" copy="Workshop tách theo nhóm bạn, cặp đôi, gia đình và người đi một mình." />
          <Stat icon={<MapPin className="h-7 w-7" />} title="Rõ chính sách" copy="Giao hàng, đổi trả, bảo hiểm vỡ và review được đặt ở trang riêng." />
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-6 py-16 lg:px-20">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1fr]">
          <h2 className="text-5xl font-bold leading-tight text-[#3B2118]">Từ một buổi workshop đến món gốm trên tay</h2>
          <div className="grid gap-4">
            {[
              'Đặt lịch và giữ slot 15 phút khi thanh toán.',
              'Tham gia workshop, check-in bằng QR và tạo sản phẩm.',
              'Studio phơi, nung sơ, tráng men, nung hoàn thiện.',
              'Sản phẩm được đóng gói sau workshop và giao theo chính sách vận chuyển.',
            ].map((item, index) => (
              <div key={item} className="grid grid-cols-[48px_1fr] gap-4 rounded-lg border border-[#EFD8C7] bg-[#FFF8F2] p-5">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#716942] font-bold text-white">{index + 1}</span>
                <p className="self-center text-lg text-[#6A5D52]">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function Stat({ icon, title, copy }: { icon: React.ReactNode; title: string; copy: string }) {
  return (
    <div className="rounded-lg border border-[#FBEEE5]/20 p-6">
      {icon}
      <h3 className="mt-4 text-2xl font-bold">{title}</h3>
      <p className="mt-3 leading-7 text-[#FBEEE5]/75">{copy}</p>
    </div>
  );
}
