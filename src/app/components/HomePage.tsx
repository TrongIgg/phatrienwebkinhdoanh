import { Link, useNavigate } from 'react-router';
import { ArrowRight, Calendar, Flame, Gift, Heart, Home, ShoppingCart, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { useProductCart } from '../contexts/ProductCartContext';
import { WorkshopChatbot } from './WorkshopChatbot';
import {
  AssetImage,
  JourneyIcon,
  PillButton,
  ProgressRule,
  ReviewStrip,
  productImages,
  workshops,
  workshopImages,
  products,
} from './DesignPrimitives';

const heroClayVideo = new URL('../../assets/video/hero-clay.mp4', import.meta.url).href;

const whyChoose = [
  { icon: Calendar, label: 'Đặt lịch dễ dàng' },
  { icon: Home, label: 'Không gian ấm cúng' },
  { icon: Heart, label: 'Theo dõi quá trình hoàn thiện' },
  { icon: Gift, label: 'Phù hợp nhiều nhu cầu' },
];

const journey = [
  ['calendar', 'Chọn workshop'],
  ['booking', 'Đặt lịch & Thanh toán'],
  ['workshop', 'Tham gia workshop'],
  ['track', 'Theo dõi quy trình'],
  ['gift', 'Nhận sản phẩm'],
] as const;

const workshopBadges: Record<string, string> = {
  '1': 'Phù hợp người mới',
  '2': 'Men màu hút khách',
  '3': 'Đi cùng người thương',
};

const productBadges: Record<string, string> = {
  p1: 'Bán chạy',
  p2: 'Sẵn làm quà',
  p3: 'Trang trí đẹp',
  p4: 'Sắp hết',
};

export function HomePage() {
  const { addProduct } = useProductCart();
  const navigate = useNavigate();

  const handleAddToCart = (product: (typeof products)[number]) => {
    addProduct({
      id: product.id,
      name: product.detailName,
      price: product.price,
      quantity: 1,
      image: product.image,
    });
    toast.success(`Đã thêm "${product.detailName}" vào giỏ hàng`);
  };

  const handleBuyNow = (product: (typeof products)[number]) => {
    addProduct({
      id: product.id,
      name: product.detailName,
      price: product.price,
      quantity: 1,
      image: product.image,
    });
    toast.success(`Đã thêm "${product.detailName}" — đang chuyển đến giỏ hàng`);
    navigate('/cart');
  };

  return (
    <div className="bg-[#FBEEE5] text-[#3F3F35]">
      <section className="mx-auto max-w-[1440px] px-4 pb-8 pt-10 sm:px-6 lg:px-16">
        <div className="clay-cinema relative min-h-[560px] overflow-hidden rounded-[24px] bg-[#361F17] px-5 py-8 text-[#FBEEE5] shadow-[0_24px_62px_rgba(54,31,23,0.2)] lg:px-10 lg:py-10">
          <video
            className="absolute inset-0 h-full w-full rounded-[30px] object-cover opacity-[0.62]"
            src={heroClayVideo}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster={workshopImages.hero}
            aria-label="Video nghệ nhân tạo hình gốm tại THỔ"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#26140E]/88 via-[#361F17]/54 to-[#361F17]/18" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#26140E]/62 via-transparent to-[#26140E]/18" />

          <div className="relative z-10 flex min-h-[460px] max-w-[760px] flex-col justify-center">
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-[#FBEEE5]/12 px-4 py-2 text-sm font-bold uppercase tracking-[0.18em] text-[#F3D4BE]">
              <Sparkles className="h-4 w-4" />
              Trải nghiệm gốm thủ công
            </span>
            <h1 className="mt-6 text-[clamp(2.8rem,6vw,5.4rem)] font-semibold leading-[0.98] tracking-normal">
              THỔ Studio
            </h1>
            <p className="mt-5 max-w-[700px] text-[clamp(1.35rem,2.5vw,2.6rem)] font-light leading-tight text-[#F8E5D4]">
              Một lát cắt chậm của đất, nước, bàn tay và ký ức.
            </p>
            <p className="mt-6 max-w-[560px] text-base leading-7 text-[#FBEEE5]/82 lg:text-lg">
              Trước khi là sản phẩm, gốm là một chuyển động: xoay, nén, nâng, lắng lại.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link to="/workshop" className="inline-flex items-center gap-2 rounded-full bg-[#FBEEE5] px-7 py-4 font-bold text-[#361F17]">
                Khám phá workshop
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1440px] gap-12 px-6 py-24 lg:grid-cols-[520px_1fr] lg:px-20">
        <div>
          <h2 className="text-[64px] font-bold leading-none text-[#3F3F35]">Workshop tại THỔ</h2>
          <div className="mt-14 grid grid-cols-2 gap-5">
            <AssetImage src={workshopImages.hero} alt="Bàn xoay gốm thủ công" className="h-[190px] rounded-[18px]" />
            <AssetImage src={workshopImages.wheelBw} alt="Tạo hình gốm trên bàn xoay" className="h-[249px] rounded-[18px]" />
            <AssetImage src={workshopImages.detailBw} alt="Nghệ nhân vẽ chi tiết gốm" className="h-[286px] rounded-[18px]" />
            <AssetImage src={workshopImages.handsWarm} alt="Nặn thân gốm bằng tay" className="h-[195px] rounded-[18px]" />
          </div>
        </div>
        <div className="pt-12 text-right lg:pt-32">
          <p className="text-xl font-light leading-9 lg:text-2xl lg:leading-[39px]">
            THỔ là không gian để bạn chạm vào đất sét, thử tạo hình và trang trí món đồ gốm mang dấu ấn cá nhân. Dù là lần đầu,
            bạn vẫn được nghệ nhân hướng dẫn từng bước và có thể theo dõi thành phẩm sau buổi học.
          </p>
          <Link to="/workshop" className="mt-8 inline-flex items-center gap-2 font-bold text-[#643A2A] hover:text-[#716942]">
            Xem tất cả workshop
            <ArrowRight className="h-4 w-4" />
          </Link>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {[
              ['Tự tay tạo hình', 'Được trực tiếp nặn, vuốt hoặc trang trí theo phong cách riêng.'],
              ['Nghệ nhân hướng dẫn', 'Mỗi gói trải nghiệm đều có nghệ nhân hỗ trợ từ cơ bản đến nâng cao.'],
              ['Theo dõi thành phẩm', 'Xem tiến độ qua từng giai đoạn phơi khô, nung, tráng men và sẵn sàng nhận sản phẩm.'],
            ].map(([title, text]) => (
              <div key={title} className="text-left">
                <h3 className="mb-6 text-[26px] font-semibold">{title}</h3>
                <p className="text-2xl font-light leading-7">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-5 py-16">
        <h2 className="mb-12 text-center text-[52px] font-semibold leading-none text-[#361F17]">Hành trình tại THỔ</h2>
        <div className="rounded-[20px] bg-[#716942] px-8 py-20 shadow-md">
          <div className="grid gap-10 md:grid-cols-5">
            {journey.map(([type, label], index) => (
              <div key={label} className="relative flex flex-col items-center text-center">
                {index < journey.length - 1 && (
                  <div className="absolute left-1/2 top-[52px] hidden h-0.5 w-full translate-x-1/2 bg-[#FBEEE5] md:block" />
                )}
                <div className="relative z-10 flex h-[106px] w-[106px] items-center justify-center rounded-full bg-[#FBEEE5]">
                  <JourneyIcon type={type} />
                </div>
                <h3 className="mt-8 text-[26px] font-semibold text-[#C0AC8B]">{label}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-20 bg-[#C0AC8B] py-20">
        <div className="mx-auto grid max-w-[1440px] gap-12 px-6 lg:grid-cols-[540px_1fr] lg:px-14">
          <div>
            <h2 className="text-[64px] font-bold leading-none text-[#361F17]">About THỔ</h2>
            <h3 className="mt-16 text-[50px] font-medium leading-none text-[#361F17]">THỔ - Nơi đất trở thành ký ức</h3>
            <ProgressRule light className="mt-6 max-w-[642px] opacity-20" />
            <p className="mt-10 text-2xl font-light leading-[39px] text-white">
              THỔ được tạo nên từ mong muốn mang gốm thủ công đến gần hơn với đời sống hiện đại.
              Giữa nhịp sống vội vã, THỔ mở ra một không gian để mỗi người chậm lại, chạm vào đất
              và tự tay tạo nên món gốm mang dấu ấn riêng.
            </p>
            <Link to="/about" className="mt-10 inline-block"><PillButton variant="light">Tìm hiểu thêm</PillButton></Link>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <AssetImage src={workshopImages.detailBw} alt="Không gian làm gốm tỉ mỉ" className="kinetic-sheen h-[389px] rounded-[18px] opacity-70" />
            <AssetImage src={workshopImages.largePot} alt="Bình gốm đang tạo hình" className="hero-float kinetic-sheen mt-[-40px] h-[532px] rounded-[18px] opacity-70" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-6 py-24 lg:px-16">
        <h2 className="mb-9 text-[52px] font-semibold leading-none">Vì sao nên chọn THỔ</h2>
        <div className="grid gap-5 md:grid-cols-4">
          {whyChoose.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="flex h-[159px] flex-col items-center justify-center bg-[#361F17] text-[#FBEEE5]">
                <Icon className="mb-5 h-12 w-12" />
                <h3 className="text-center text-[26px] font-semibold leading-7">{item.label}</h3>
              </div>
            );
          })}
        </div>
      </section>

      <section id="workshop-advisor" className="mx-auto max-w-[1440px] scroll-mt-24 px-6 py-12 lg:px-16">
        <WorkshopChatbot />
      </section>

      <section className="mx-auto max-w-[1440px] px-6 py-20 lg:px-16">
        <div className="mb-16 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <h2 className="text-[64px] font-bold leading-none text-[#643A2A]">Lựa chọn trải nghiệm của bạn</h2>
          <Link to="/workshop"><PillButton variant="outline">Xem tất cả</PillButton></Link>
        </div>
        <div className="grid gap-7 md:grid-cols-3">
          {workshops.map((workshop) => (
            <article key={workshop.id} className="workshop-card overflow-hidden rounded-[19px] bg-white shadow-[0_19px_47px_rgba(119,115,170,0.1)]">
              <div className="relative">
                <AssetImage src={workshop.image} alt={workshop.name} className="h-[157px] rounded-t-[19px]" />
                <span className="absolute left-4 top-4 inline-flex items-center gap-1 rounded-full bg-[#C96B37] px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-white">
                  <Flame className="h-3.5 w-3.5" />
                  {workshopBadges[workshop.id] ?? 'Gợi ý từ studio'}
                </span>
              </div>
              <div className="grid grid-cols-[52px_1fr] gap-4 p-5">
                  <div className="text-center">
                  <p className="text-xs font-bold text-[#3D37F1]">{workshop.day}</p>
                  <p className="text-[28px] font-bold leading-8 text-black">{workshop.date}</p>
                </div>
                <div>
                  <h3 className="text-base font-bold text-black">{workshop.name}</h3>
                  <p className="mt-2 text-sm leading-5 text-[#6A6A6A]">{workshop.description}</p>
                  <div className="mt-4 flex gap-3">
                    <Link to={`/workshop/${workshop.id}`} className="rounded-full border border-[#716942] px-4 py-2 text-sm font-bold text-[#716942] transition-colors hover:bg-[#716942] hover:text-white">Chi tiết</Link>
                    <Link to={`/workshop/${workshop.id}`} className="rounded-full bg-[#716942] px-5 py-2 text-sm font-bold text-white transition-opacity hover:opacity-85">Đặt chỗ</Link>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-[1440px] gap-8 px-6 py-14 lg:grid-cols-[520px_1fr] lg:px-10">
        <div>
          <h2 className="mb-6 text-[42px] font-bold leading-none text-[#361F17]">Khoảnh khắc tại THỔ</h2>
          <div className="grid grid-cols-[1.05fr_0.95fr] gap-4">
            <AssetImage src={workshopImages.detailBw} alt="Khoảnh khắc tỉ mỉ tại THỔ" className="h-[300px] rounded-[18px]" />
            <div className="grid gap-4">
              <AssetImage src={workshopImages.handsWarm} alt="Tạo hình gốm bằng tay" className="h-[140px] rounded-[18px]" />
              <AssetImage src={workshopImages.wheelBw} alt="Bàn xoay gốm" className="h-[140px] rounded-[18px]" />
            </div>
          </div>
        </div>
        <div>
          <h2 className="mb-6 text-right text-[42px] font-bold leading-none text-[#361F17]">Khách hàng nói gì?</h2>
          <ReviewStrip limit={3} />
        </div>
      </section>

      <section className="bg-[#3F3F35] py-16 text-[#FBEEE5]">
        <div className="mx-auto max-w-[1440px] px-6">
          <h2 className="mb-12 text-center text-[64px] font-bold leading-none">Một số sản phẩm</h2>
          <div className="grid gap-6 md:grid-cols-4">
            {products.map((product) => (
              <article key={product.id} className="product-card overflow-hidden rounded-[19px] bg-white text-black">
                <div className="relative">
                  <AssetImage src={product.image} alt={product.name} className="h-[157px] rounded-t-[19px] overflow-hidden" />
                  <span className="absolute left-4 top-4 inline-flex items-center gap-1 rounded-full bg-[#FBEEE5] px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-[#361F17] shadow-sm">
                    <Flame className="h-3.5 w-3.5 text-[#C96B37]" />
                    {productBadges[product.id] ?? 'Hot'}
                  </span>
                </div>
                <div className="grid grid-cols-[82px_1fr] gap-4 p-4">
                  <p className="text-sm font-bold">{product.price.toLocaleString('vi-VN')}đ</p>
                  <div>
                    <h3 className="text-base font-bold">{product.name}</h3>
                    <p className="text-xs leading-5 text-[#6A6A6A]">{product.description}</p>
                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={() => handleAddToCart(product)}
                        className="rounded-full border border-[#716942] px-4 py-2 text-sm font-bold text-[#716942] transition-colors hover:bg-[#716942] hover:text-white"
                      >
                        Thêm giỏ
                      </button>
                      <button
                        onClick={() => handleBuyNow(product)}
                        className="inline-flex items-center gap-1 rounded-full bg-[#716942] px-4 py-2 text-sm font-bold text-white transition-opacity hover:opacity-85"
                      >
                        <ShoppingCart className="h-3.5 w-3.5" />
                        Mua ngay
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link to="/product"><PillButton variant="light">Xem sản phẩm</PillButton></Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-6 py-24">
        <div className="relative overflow-hidden rounded-[30px] bg-[#EFE2D6] px-8 py-20 lg:px-20">
          <AssetImage src={productImages.tealVase} alt="Sản phẩm gốm thủ công" className="absolute inset-y-0 right-0 hidden h-full w-[48%] rounded-[30px] opacity-95 lg:block" imgClassName="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#EFE2D6] via-[#EFE2D6]/92 to-[#EFE2D6]/18" />
          <div className="relative z-10 max-w-[880px]">
            <h2 className="max-w-[1101px] text-[50px] font-semibold leading-[1.08] text-[#3F3F35] md:text-[68px] xl:text-[74px]">
              Sẵn sàng bắt đầu hành trình làm gốm cùng THỔ?
            </h2>
            <p className="mt-10 max-w-[795px] text-2xl leading-[39px] text-[#3F3F35]">
              Lựa chọn trải nghiệm workshop và đặt lịch ngay để cùng THỔ tự tay làm ra những món đồ gốm mang dấu ấn của bạn!
            </p>
            <div className="mt-14 flex flex-wrap gap-10">
              <Link to="/workshop"><PillButton variant="outline" className="min-w-[260px] sm:min-w-[320px]">Xem các gói trải nghiệm</PillButton></Link>
              <Link to="/product"><PillButton className="min-w-[260px] sm:min-w-[320px]">Xem sản phẩm gốm</PillButton></Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
