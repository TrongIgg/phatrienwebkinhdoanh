import { Link, useNavigate } from 'react-router';
import { Calendar, Gift, Heart, Home, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';
import { useCart } from '../contexts/CartContext';
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

export function HomePage() {
  const { addProduct } = useCart();
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
      <section className="mx-auto max-w-[1440px] px-6 pb-24 pt-24 lg:px-20">
        <div className="relative min-h-[631px] overflow-hidden rounded-[30px] bg-[#C0AC8B] px-8 py-14 shadow-sm lg:px-14">
          <div className="relative z-10 max-w-[1101px]">
            <h1 className="max-w-[1101px] text-[48px] font-semibold leading-[1.08] text-[#3F3F35] md:text-[68px] xl:text-[74px]">
              Tự tay tạo nên tác phẩm mang dấu ấn của riêng bạn
            </h1>
            <p className="mt-14 max-w-[563px] text-2xl font-light leading-[39px] text-white">
              Trải nghiệm workshop gốm thủ công tại THỔ - nơi bạn có thể nặn, tô, vẽ dấu ấn của bạn
              trên những món đồ gốm tưởng chừng là vô tri.
            </p>
          </div>

          <AssetImage
            src={workshopImages.largePot}
            alt="Nặn gốm trên bàn xoay"
            className="absolute bottom-12 right-8 hidden h-[390px] w-[390px] rounded-[10px] lg:flex"
            loading="eager"
          />

          <div className="absolute bottom-16 right-12 z-10 flex flex-wrap gap-8">
            <Link to="/about"><PillButton variant="light">Learn More</PillButton></Link>
            <Link to="/workshop"><PillButton>Booking Now</PillButton></Link>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1440px] gap-12 px-6 py-24 lg:grid-cols-[520px_1fr] lg:px-20">
        <div>
          <h2 className="text-[64px] font-bold leading-none text-[#3F3F35]">About Workshop</h2>
          <div className="mt-14 grid grid-cols-2 gap-5">
            <AssetImage src={workshopImages.hero} alt="Bàn xoay gốm thủ công" className="h-[190px] rounded-[18px]" />
            <AssetImage src={workshopImages.wheelBw} alt="Tạo hình gốm trên bàn xoay" className="h-[249px] rounded-[18px]" />
            <AssetImage src={workshopImages.detailBw} alt="Nghệ nhân vẽ chi tiết gốm" className="h-[286px] rounded-[18px]" />
            <AssetImage src={workshopImages.handsWarm} alt="Nặn thân gốm bằng tay" className="h-[195px] rounded-[18px]" />
          </div>
        </div>
        <div className="pt-32 text-right">
          <p className="text-2xl font-light leading-[39px]">
            THỔ là không gian để bạn chạm vào đất sét, thử tạo hình và trang trí món đồ gốm mang dấu ấn cá nhân.
            Dù bạn chưa từng làm gốm trước đây, nghệ nhân tại THỔ sẽ cùng bạn từng bước hoàn thành sản phẩm của riêng mình.
            Sau đó, thành phẩm sẽ trải qua các giai đoạn gia công và hoàn thiện tại xưởng.
            Bạn có thể theo dõi tiến độ thông qua Ceramic Tracker.
          </p>
          <div className="mt-16 grid gap-10 md:grid-cols-3">
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
            <Link to="/about" className="mt-10 inline-block"><PillButton variant="light">Learn More</PillButton></Link>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <AssetImage src={workshopImages.detailBw} alt="Không gian làm gốm tỉ mỉ" className="h-[389px] rounded-[18px] opacity-70" />
            <AssetImage src={workshopImages.largePot} alt="Bình gốm đang tạo hình" className="mt-[-40px] h-[532px] rounded-[18px] opacity-70" />
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

      <section className="mx-auto max-w-[1440px] px-6 py-20 lg:px-16">
        <div className="mb-16 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <h2 className="text-[64px] font-bold leading-none text-[#643A2A]">Lựa chọn trải nghiệm của bạn</h2>
          <Link to="/workshop"><PillButton variant="outline">Learn More</PillButton></Link>
        </div>
        <div className="grid gap-7 md:grid-cols-3">
          {workshops.map((workshop) => (
            <article key={workshop.id} className="workshop-card overflow-hidden rounded-[19px] bg-white shadow-[0_19px_47px_rgba(119,115,170,0.1)]">
              <AssetImage src={workshop.image} alt={workshop.name} className="h-[157px] rounded-t-[19px]" />
              <div className="grid grid-cols-[52px_1fr] gap-4 p-5">
                <div className="text-center font-['DM_Sans',Arial,sans-serif]">
                  <p className="text-xs font-bold text-[#3D37F1]">{workshop.day}</p>
                  <p className="text-[28px] font-bold leading-8 text-black">{workshop.date}</p>
                </div>
                <div>
                  <h3 className="font-['DM_Sans',Arial,sans-serif] text-base font-bold text-black">{workshop.name}</h3>
                  <p className="mt-2 font-['DM_Sans',Arial,sans-serif] text-sm leading-5 text-[#6A6A6A]">{workshop.description}</p>
                  <div className="mt-4 flex gap-3">
                    <Link to={`/booking/${workshop.id}`} className="rounded-full border border-[#716942] px-4 py-2 text-sm font-bold text-[#716942] transition-colors hover:bg-[#716942] hover:text-white">Learn More</Link>
                    <Link to={`/booking/${workshop.id}`} className="rounded-full bg-[#716942] px-5 py-2 text-sm font-bold text-white transition-opacity hover:opacity-85">Booking</Link>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-[1440px] gap-12 px-6 py-20 lg:grid-cols-[560px_1fr] lg:px-10">
        <div>
          <h2 className="mb-8 text-[48px] font-bold leading-none text-[#361F17]">Khoảng khắc tại THỔ</h2>
          <div className="grid grid-cols-2 gap-6">
            <AssetImage src={workshopImages.detailBw} alt="Khoảnh khắc tỉ mỉ tại THỔ" className="h-[380px] rounded-[18px]" />
            <div className="grid gap-6">
              <AssetImage src={workshopImages.handsWarm} alt="Tạo hình gốm bằng tay" className="h-[166px] rounded-[18px]" />
              <AssetImage src={workshopImages.wheelBw} alt="Bàn xoay gốm" className="h-[188px] rounded-[18px]" />
            </div>
          </div>
        </div>
        <div>
          <h2 className="mb-12 text-right text-[48px] font-bold leading-none text-[#361F17]">Khách hàng nói gì ?</h2>
          <ReviewStrip />
        </div>
      </section>

      <section className="bg-[#3F3F35] py-16 text-[#FBEEE5]">
        <div className="mx-auto max-w-[1440px] px-6">
          <h2 className="mb-12 text-center text-[64px] font-bold leading-none">Một số sản phẩm</h2>
          <div className="grid gap-6 md:grid-cols-4">
            {products.map((product) => (
              <article key={product.id} className="product-card overflow-hidden rounded-[19px] bg-white text-black">
                <AssetImage src={product.image} alt={product.name} className="h-[157px] rounded-t-[19px] overflow-hidden" />
                <div className="grid grid-cols-[82px_1fr] gap-4 p-4">
                  <p className="font-['DM_Sans',Arial,sans-serif] text-sm font-bold">{product.price.toLocaleString('vi-VN')}đ</p>
                  <div>
                    <h3 className="font-['DM_Sans',Arial,sans-serif] text-base font-bold">{product.name}</h3>
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
            <Link to="/product"><PillButton variant="light">Learn More</PillButton></Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-6 py-24">
        <div className="relative overflow-hidden rounded-[30px] bg-[#C0AC8B] px-8 py-20 lg:px-20">
          <AssetImage src={productImages.tealVase} alt="Sản phẩm gốm thủ công" className="absolute inset-0 h-full w-full rounded-[30px] opacity-35" />
          <div className="relative z-10">
            <h2 className="max-w-[1101px] text-[50px] font-semibold leading-[1.08] text-[#3F3F35] md:text-[68px] xl:text-[74px]">
              Sẵn sàng bắt đầu hành trình làm gốm cùng THỔ?
            </h2>
            <p className="mt-10 max-w-[795px] text-2xl leading-[39px] text-[#3F3F35]">
              Lựa chọn trải nghiệm workshop và đặt lịch ngay để cùng THỔ tự tay làm ra những món đồ gốm mang dấu ấn của bạn!
            </p>
            <div className="mt-14 flex flex-wrap gap-10">
              <Link to="/workshop"><PillButton variant="outline" className="min-w-[388px]">Xem các gói trải nghiệm</PillButton></Link>
              <Link to="/workshop"><PillButton className="min-w-[409px]">Đặt lịch Workshop</PillButton></Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
